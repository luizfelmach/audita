import { sleep } from "k6";
import http from "k6/http";

export const options = {
  duration: "1m",
  vus: 10,
};

function randomMAC() {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

function randomIP() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomExternalIP() {
  return `${Math.floor(Math.random() * 100) + 100}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function elasticTimestamp() {
  return new Date().toISOString();
}

function syslogTimestamp() {
  const date = new Date();
  const day = String(date.getUTCDate()).padStart(2, ' ');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const time = date.toTimeString().split(' ')[0];
  return `${month} ${day} ${time}`;
}

export default function () {
  const url = "http://127.0.0.1:8080/api";

  // 1. RADIUS Log
  const mac = randomMAC();

  const radiusLog = {
    "@timestamp": elasticTimestamp(),
    mac: mac.replace(/:/g, '-'),
    type: "radius",
    username: ""
  };
  http.post(url, JSON.stringify(radiusLog), { headers: { "Content-Type": "application/json" } });

  sleep(0.01);

  // 2. DHCP Log
  const ip = randomIP();
  const dhcpLog = {
    "@timestamp": elasticTimestamp(),
    ip: ip,
    lease_time: String(3600),
    mac: mac,
    syslog_timestamp: syslogTimestamp(),
    type: "dhcp"
  };
  http.post(url, JSON.stringify(dhcpLog), { headers: { "Content-Type": "application/json" } });

  sleep(0.01);

  // 3. Vários logs de Firewall
  const numFwLogs = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < numFwLogs; i++) {
    const dst_ip = randomExternalIP();
    const port = Math.floor(Math.random() * 65535);
    const fwLog = {
      "@timestamp": elasticTimestamp(),
      cisco: {
        asa: {
          tag: "FTD-6-302013"
        }
      },
      dst_ip: ip,
      dst_mapped_ip: dst_ip,
      dst_mapped_port: String(port),
      dst_port: "8090",
      log: {
        syslog: {
          priority: 134
        }
      },
      src_ip: "-",
      src_mapped_ip: "-", 
      src_mapped_port: "-",
      src_port: "-",
      timestamp: syslogTimestamp(),
      type: "fw"
    };
    http.post(url, JSON.stringify(fwLog), { headers: { "Content-Type": "application/json" } });
    sleep(0.01);
  }
}

