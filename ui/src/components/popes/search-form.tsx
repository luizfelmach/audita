import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, Fingerprint, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  onSearch: (params: {
    dst_mapped_ip: string;
    dst_mapped_port: string;
    timestamp: string;
  }) => void;
  searching: boolean;
}

export function SearchForm({ onSearch, searching }: SearchFormProps) {
  const [dst_mapped_ip, setDstMappedIp] = useState("");
  const [dst_mapped_port, setDstMappedPort] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dst_mapped_ip || !dst_mapped_port || !date) {
      return;
    }

    const [hours, minutes] = time.split(":");
    const timestamp = new Date(date);
    timestamp.setHours(Number.parseInt(hours), Number.parseInt(minutes));

    onSearch({
      dst_mapped_ip,
      dst_mapped_port,
      timestamp: timestamp.toISOString(),
    });
  };

  const isValid = dst_mapped_ip && dst_mapped_port && date;

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          Pop ES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Destination Mapped IP */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Destination Mapped IP
              </label>
              <Input
                placeholder="e.g., 192.168.1.100"
                value={dst_mapped_ip}
                onChange={(e) => setDstMappedIp(e.target.value)}
                disabled={searching}
                className="font-mono"
              />
            </div>

            {/* Destination Mapped Port */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Destination Mapped Port
              </label>
              <Input
                placeholder="e.g., 80, 443, 8080"
                value={dst_mapped_port}
                onChange={(e) => setDstMappedPort(e.target.value)}
                disabled={searching}
                className="font-mono"
              />
            </div>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Timestamp (±10 minutes range)
            </label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={searching}
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={searching}
                className="w-32"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Search will include 10 minutes before and after the specified time
            </p>
          </div>

          {/* Search Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Firewall Search
              </Badge>
              <Badge variant="outline">Type: fw</Badge>
            </div>
            <Button
              type="submit"
              disabled={!isValid || searching}
              className="bg-primary hover:bg-primary/90"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Firewall
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
