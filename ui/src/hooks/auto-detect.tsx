import api from "@/services/api";
import type { Document, Query } from "@/types/entities";
import { useMutation } from "@tanstack/react-query";


interface SearchResult {
    docs: Document[];
}

type SearchResponse = { docs?: Document[] };

interface Params {
    dst_mapped_ip: string;
    dst_mapped_port: string;
    timestamp: string;
}

const parseTimestamp = (ts?: string): number => {
    if (!ts) return NaN;
    return new Date(ts).getTime();
};

function findClosestDoc<T extends Document>(docs: T[] | undefined, targetTimestampStr: string): T | null {
    if (!docs || docs.length === 0) return null;

    const target = parseTimestamp(targetTimestampStr);
    let closest = docs[0];
    let smallestDiff = Math.abs(target - parseTimestamp(closest.source["@timestamp"] as string));

    for (let i = 1; i < docs.length; i++) {
        const candidate = docs[i];
        const candidateTs = parseTimestamp(candidate.source["@timestamp"] as string);
        const diff = Math.abs(target - candidateTs);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = candidate;
        }
    }

    return closest;
}

/* ----- Hook ----- */

export function useAutoDetectSearch() {
    const mutation = useMutation({
        mutationFn: async (params: Params) => {
            // 1) Firewall -> procurar o doc mais próximo do timestamp fornecido
            const firewallRes = (await searchFirewall(params)) as SearchResponse;
            const closestFirewall = findClosestDoc(firewallRes.docs, params.timestamp);
            if (!closestFirewall) return { firewall: null, dhcp: null, radius: null };

            // 2) DHCP -> buscar com timestamp do firewall e dst_ip, pegar doc mais próximo
            const firewallTimestamp = closestFirewall.source["@timestamp"] as string;
            const dst_ip = closestFirewall.source["dst_ip"] as string;

            const dhcpRes = (await searchDhcp({ timestamp: firewallTimestamp, dst_ip })) as SearchResponse;
            const closestDhcp = findClosestDoc(dhcpRes.docs, firewallTimestamp);
            if (!closestDhcp) return { firewall: closestFirewall, dhcp: null, radius: null };

            // 3) RADIUS -> buscar com timestamp do dhcp e mac, pegar doc mais próximo
            const mac = closestDhcp.source["mac"] as string;

            const radiusRes = (await searchRadius({ timestamp: firewallTimestamp, mac })) as SearchResponse;
            const closestRadius = findClosestDoc(radiusRes.docs, firewallTimestamp);
            if (!closestRadius) return { firewall: closestFirewall, dhcp: closestDhcp, radius: null };

            return {
                firewall: closestFirewall,
                dhcp: closestDhcp,
                radius: closestRadius,
            };
        },
    });

    return {
        autoDetect: mutation.mutate,
        ...mutation,
    } as const;
}




async function searchFirewall(params: {
    dst_mapped_ip: string;
    dst_mapped_port: string;
    timestamp: string;
}) {
    const startTime = new Date(params.timestamp);
    const endTime = new Date(params.timestamp);

    // 10 minutos antes e depois
    startTime.setMinutes(startTime.getMinutes() - 10);
    endTime.setMinutes(endTime.getMinutes() + 10);

    const query: Query = {
        and: [
            {
                field: "dst_mapped_ip",
                op: { type: "EqString", value: params.dst_mapped_ip },
            },
            {
                field: "dst_mapped_port",
                op: { type: "EqString", value: params.dst_mapped_port },
            },
            {
                field: "@timestamp",
                op: {
                    type: "BetweenDate",
                    value: [startTime.toISOString(), endTime.toISOString()],
                },
            },
            {
                field: "type",
                op: { type: "EqString", value: "fw" },
            },
        ],
    };

    const response = await api.post<SearchResult>("/storage/search", {
        query,
    });

    response.data.docs.sort((a, b) => {
        const timeA = new Date(a.source?.["@timestamp"] as string).getTime();
        const timeB = new Date(b.source?.["@timestamp"] as string).getTime();
        return timeA - timeB;
    });

    return response.data;
}

async function searchDhcp(params: { dst_ip: string; timestamp: string }) {
    const startTime = new Date(params.timestamp);
    const endTime = new Date(params.timestamp);

    // 2 horas antes e depois
    startTime.setHours(startTime.getHours() - 2);
    endTime.setHours(endTime.getHours());

    const query: Query = {
        and: [
            {
                field: "ip", // Campo no DHCP é "ip", não "dst_ip"
                op: { type: "EqString", value: params.dst_ip },
            },
            {
                field: "@timestamp",
                op: {
                    type: "BetweenDate",
                    value: [startTime.toISOString(), endTime.toISOString()],
                },
            },
            {
                field: "type",
                op: { type: "EqString", value: "dhcp" },
            },
        ],
    };

    const response = await api.post<SearchResult>("/storage/search", {
        query,
    });

    response.data.docs.sort((a, b) => {
        const timeA = new Date(a.source?.["@timestamp"] as string).getTime();
        const timeB = new Date(b.source?.["@timestamp"] as string).getTime();
        return timeA - timeB;
    });

    return response.data;
}

async function searchRadius(params: { mac: string; timestamp: string }) {
    // Formatar MAC: substituir ":" por "-"
    const formattedMac = params.mac.replace(/:/g, "-");

    const startTime = new Date(params.timestamp);
    const endTime = new Date(params.timestamp);

    // 2 horas antes e depois
    startTime.setHours(startTime.getHours() - 2);
    endTime.setHours(endTime.getHours());

    const query: Query = {
        and: [
            {
                field: "mac",
                op: { type: "EqString", value: formattedMac },
            },
            {
                field: "@timestamp",
                op: {
                    type: "BetweenDate",
                    value: [startTime.toISOString(), endTime.toISOString()],
                },
            },
            {
                field: "type",
                op: { type: "EqString", value: "radius" },
            },
        ],
    };

    const response = await api.post<SearchResult>("/storage/search", {
        query,
    });

    response.data.docs.sort((a, b) => {
        const timeA = new Date(a.source?.["@timestamp"] as string).getTime();
        const timeB = new Date(b.source?.["@timestamp"] as string).getTime();
        return timeA - timeB;
    });

    return response.data;
}