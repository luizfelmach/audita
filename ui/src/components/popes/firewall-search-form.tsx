import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import { PopesSearchParams } from "@/types/search";

interface FirewallSearchFormProps {
  onSearch: (params: PopesSearchParams) => void;
  isLoading: boolean;
}

export function FirewallSearchForm({
  onSearch,
  isLoading,
}: FirewallSearchFormProps) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip || !port || !date) return;

    const timestamp = `${format(date, "yyyy-MM-dd")}T${time}:00.000Z`;

    onSearch({
      dst_mapped_ip: ip,
      dst_mapped_port: port,
      timestamp,
    });
  };

  const isValid = ip && port && date;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ip">Destination IP</Label>
          <Input
            id="ip"
            placeholder="Ex: 177.23.109.176"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Destination Port</Label>
          <Input
            id="port"
            placeholder="Ex: 26719"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Datetime (±10 minutes)</Label>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MM/dd/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2 min-w-32">
            <Clock className="h-4 w-4 text-gray-400" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? "Searching Firewall Logs..." : "Search Firewall Logs"}
      </Button>
    </form>
  );
}
