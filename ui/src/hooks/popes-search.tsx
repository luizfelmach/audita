import api from "@/services/api";
import type { Document, Query } from "@/types/entities";
import { useMutation } from "@tanstack/react-query";

interface SearchResult {
  docs: Document[];
}

// Hook para busca no Firewall
export function useFirewallSearch() {
  const mutation = useMutation({
    mutationFn: async (params: {
      dst_mapped_ip: string;
      dst_mapped_port: string;
      timestamp: string;
    }) => {
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
      return response.data;
    },
  });

  return {
    searchFirewall: mutation.mutate,
    ...mutation,
  };
}

// Hook para busca no DHCP
export function useDhcpSearch() {
  const mutation = useMutation({
    mutationFn: async (params: {
      dst_ip: string; // Apenas dst_ip será usado, campo no DHCP é "ip"
    }) => {
      const query: Query = {
        and: [
          {
            field: "ip", // Campo no DHCP é "ip", não "dst_ip"
            op: { type: "EqString", value: params.dst_ip },
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
      return response.data;
    },
  });

  return {
    searchDhcp: mutation.mutate,
    ...mutation,
  };
}

// Hook para busca no Radius
export function useRadiusSearch() {
  const mutation = useMutation({
    mutationFn: async (params: { mac: string }) => {
      // Formatar MAC: substituir ":" por "-"
      const formattedMac = params.mac.replace(/:/g, "-");

      const query: Query = {
        and: [
          {
            field: "mac",
            op: { type: "EqString", value: formattedMac },
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
      return response.data;
    },
  });

  return {
    searchRadius: mutation.mutate,
    ...mutation,
  };
}
