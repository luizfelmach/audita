import { useConditions, type ConditionHook } from "@/hooks/condition";
import { operators } from "./operators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  X,
  Plus,
  Search,
  Filter,
  Database,
  Hash,
  CalendarIcon,
  Type,
  Trash2,
  Settings2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface QueryBuilderProps {
  onSearch: (conditions: ConditionHook[]) => void;
  searching: boolean;
}

export function QueryBuilder({ onSearch, searching }: QueryBuilderProps) {
  const {
    conditions,
    addCondition,
    updateCondition,
    removeCondition,
    clearConditions,
  } = useConditions();

  const handleAdd = () =>
    addCondition({ field: "", type: "EqString", value1: "", value2: "" });

  const handleSearch = () => onSearch(conditions);

  const allOperators = [
    ...operators.string,
    ...operators.number,
    ...operators.date,
  ];

  const isBetween = (type: string) => type.startsWith("Between");
  const isDateOperation = (type: string) => type.includes("Date");

  const getOperatorGroup = (type: string) => {
    if (operators.string.find((op) => op.type === type)) return "string";
    if (operators.number.find((op) => op.type === type)) return "number";
    if (operators.date.find((op) => op.type === type)) return "date";
    return "string";
  };

  const getFieldIcon = (type: string) => {
    const group = getOperatorGroup(type);
    switch (group) {
      case "string":
        return Type;
      case "number":
        return Hash;
      case "date":
        return CalendarIcon;
      default:
        return Database;
    }
  };

  const handleDateTimeChange = (
    index: number,
    field: "value1" | "value2",
    date: Date | undefined,
    time = "00:00",
  ) => {
    if (date) {
      const [hours, minutes] = time.split(":");
      const dateTime = new Date(date);
      dateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes));
      updateCondition(index, { [field]: dateTime.toISOString() });
    } else {
      updateCondition(index, { [field]: "" });
    }
  };

  const parseDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return { date: undefined, time: "00:00" };
    const date = new Date(dateTimeString);
    return {
      date: isNaN(date.getTime()) ? undefined : date,
      time: isNaN(date.getTime()) ? "00:00" : format(date, "HH:mm"),
    };
  };

  const DateTimeInput = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (date: Date | undefined, time: string) => void;
    placeholder?: string;
  }) => {
    const { date, time } = parseDateTime(value);

    return (
      <div className="flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={searching}
              className={cn(
                "flex-1 justify-start text-left font-normal h-9 text-sm",
                !date && "text-muted-foreground",
                searching && "opacity-50 cursor-not-allowed",
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {date ? format(date, "MMM dd, yyyy") : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => onChange(newDate, time)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="relative">
          <Input
            type="time"
            value={time}
            disabled={searching}
            onChange={(e) => onChange(date, e.target.value)}
            className="w-20 h-9 text-sm"
          />
        </div>
      </div>
    );
  };

  const validConditions = conditions.filter((c) => c.field && c.value1);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
            {searching ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Filter className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Query Builder
            </h2>
            <p className="text-sm text-muted-foreground">
              {searching
                ? "Searching... Please wait while we process your query"
                : "Build complex search queries with multiple conditions"}
            </p>
          </div>
        </div>

        {conditions.length > 0 && (
          <div className="flex items-center gap-2">
            {searching && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse"
              >
                Searching...
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground border-border"
            >
              {conditions.length} condition{conditions.length !== 1 ? "s" : ""}
            </Badge>
            {validConditions.length > 0 && !searching && (
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                {validConditions.length} ready
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Conditions Table */}
      {conditions.length > 0 ? (
        <div
          className={cn(
            "rounded-lg border border-border/50 shadow-none bg-card transition-opacity",
            searching && "opacity-75",
          )}
        >
          <div className="overflow-x-auto">
            <Table className="mb-4">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead className="min-w-[200px]">Field Name</TableHead>
                  <TableHead className="min-w-[180px]">Operator</TableHead>
                  <TableHead className="min-w-[200px]">Value</TableHead>
                  <TableHead className="min-w-[200px]">End Value</TableHead>
                  <TableHead className="min-w-[250px]">Preview</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conditions.map((condition, index) => {
                  const FieldIcon = getFieldIcon(condition.type);
                  const operatorInfo = allOperators.find(
                    (op) => op.type === condition.type,
                  );

                  return (
                    <TableRow key={index} className="hover:bg-muted/30">
                      {/* Index */}
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
                          <FieldIcon className="w-4 h-4 text-primary" />
                        </div>
                      </TableCell>

                      {/* Field Name */}
                      <TableCell>
                        <Input
                          placeholder="e.g., username, email, created_at"
                          value={condition.field}
                          disabled={searching}
                          onChange={(e) =>
                            updateCondition(index, { field: e.target.value })
                          }
                          className="font-mono text-sm h-9"
                        />
                      </TableCell>

                      {/* Operator */}
                      <TableCell>
                        <Select
                          value={condition.type}
                          disabled={searching}
                          onValueChange={(value) =>
                            updateCondition(index, {
                              type: value as ConditionHook["type"],
                            })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2">
                                <Type className="w-3.5 h-3.5" />
                                String Operations
                              </SelectLabel>
                              {operators.string.map((op) => (
                                <SelectItem key={op.type} value={op.type}>
                                  <div className="flex items-center gap-2">
                                    <op.icon className="w-3.5 h-3.5" />
                                    {op.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>

                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5" />
                                Number Operations
                              </SelectLabel>
                              {operators.number.map((op) => (
                                <SelectItem key={op.type} value={op.type}>
                                  <div className="flex items-center gap-2">
                                    <op.icon className="w-3.5 h-3.5" />
                                    {op.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>

                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Date Operations
                              </SelectLabel>
                              {operators.date.map((op) => (
                                <SelectItem key={op.type} value={op.type}>
                                  <div className="flex items-center gap-2">
                                    <op.icon className="w-3.5 h-3.5" />
                                    {op.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Value 1 */}
                      <TableCell>
                        {isDateOperation(condition.type) ? (
                          <DateTimeInput
                            value={condition.value1}
                            onChange={(date, time) =>
                              handleDateTimeChange(index, "value1", date, time)
                            }
                            placeholder="Select start date"
                          />
                        ) : (
                          <div className="relative">
                            <Input
                              placeholder="Enter value"
                              value={condition.value1}
                              disabled={searching}
                              onChange={(e) =>
                                updateCondition(index, {
                                  value1: e.target.value,
                                })
                              }
                              className="font-mono text-sm h-9 pr-8"
                            />
                          </div>
                        )}
                      </TableCell>

                      {/* Value 2 (Between operations) */}
                      <TableCell>
                        {isBetween(condition.type) ? (
                          isDateOperation(condition.type) ? (
                            <DateTimeInput
                              value={condition.value2}
                              onChange={(date, time) =>
                                handleDateTimeChange(
                                  index,
                                  "value2",
                                  date,
                                  time,
                                )
                              }
                              placeholder="Select end date"
                            />
                          ) : (
                            <div className="relative">
                              <Input
                                placeholder="Enter end value"
                                value={condition.value2}
                                disabled={searching}
                                onChange={(e) =>
                                  updateCondition(index, {
                                    value2: e.target.value,
                                  })
                                }
                                className="font-mono text-sm h-9 pr-8"
                              />
                            </div>
                          )
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Preview */}
                      <TableCell>
                        {condition.field && condition.value1 ? (
                          <code className="bg-muted border border-border px-2 py-1 rounded text-foreground font-mono text-xs">
                            {condition.field}{" "}
                            {operatorInfo?.label.toLowerCase()}{" "}
                            {isDateOperation(condition.type) && condition.value1
                              ? `"${format(new Date(condition.value1), "MMM dd, yyyy HH:mm")}"`
                              : `"${condition.value1}"`}
                            {isBetween(condition.type) &&
                              condition.value2 &&
                              (isDateOperation(condition.type)
                                ? ` and "${format(new Date(condition.value2), "MMM dd, yyyy HH:mm")}"`
                                : ` and "${condition.value2}"`)}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Incomplete
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={searching}
                          onClick={() => removeCondition(index)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="border-2 border-dashed border-border bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Settings2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No conditions added
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start building your query by adding conditions. You can combine
              multiple fields and operators to create complex searches.
            </p>
            <Button
              onClick={handleAdd}
              disabled={searching}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Condition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {conditions.length > 0 && (
        <Card className="border-border/50 hover:border-border shadow-none">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleAdd}
                disabled={searching}
                className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>

              <Button
                variant="ghost"
                onClick={clearConditions}
                disabled={searching}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                {validConditions.length !== conditions.length && !searching && (
                  <span className="text-sm text-destructive">
                    {conditions.length - validConditions.length} incomplete
                    condition
                    {conditions.length - validConditions.length !== 1
                      ? "s"
                      : ""}
                  </span>
                )}

                <Button
                  onClick={handleSearch}
                  disabled={validConditions.length === 0 || searching}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search{" "}
                  {validConditions.length > 0 && `(${validConditions.length})`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
