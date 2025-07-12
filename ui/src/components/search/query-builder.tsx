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

      {/* Conditions List */}
      {conditions.length > 0 ? (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            searching && "opacity-75",
          )}
        >
          {conditions.map((condition, index) => {
            const FieldIcon = getFieldIcon(condition.type);
            const operatorInfo = allOperators.find(
              (op) => op.type === condition.type,
            );

            return (
              <div key={index} className="space-y-3">
                {/* Condition Row */}
                <Card className="border-border/50 shadow-none bg-card hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header with icon and delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
                            <FieldIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Condition {index + 1}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={searching}
                          onClick={() => removeCondition(index)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Fields Grid */}
                      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                        {/* Field Key */}
                        <div className="lg:col-span-4 space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Field Key
                          </label>
                          <Input
                            placeholder="Ex: message, user_id, timestamp"
                            value={condition.field}
                            disabled={searching}
                            onChange={(e) =>
                              updateCondition(index, { field: e.target.value })
                            }
                            className="font-mono text-sm h-9"
                          />
                        </div>

                        {/* Operation */}
                        <div className="lg:col-span-3 space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Operation
                          </label>
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
                        </div>

                        {/* Value */}
                        <div className="lg:col-span-5 space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Value
                          </label>
                          <div className="space-y-2">
                            {/* First Value */}
                            {isDateOperation(condition.type) ? (
                              <DateTimeInput
                                value={condition.value1}
                                onChange={(date, time) =>
                                  handleDateTimeChange(
                                    index,
                                    "value1",
                                    date,
                                    time,
                                  )
                                }
                                placeholder="Select start date"
                              />
                            ) : (
                              <Input
                                placeholder="Enter value"
                                value={condition.value1}
                                disabled={searching}
                                onChange={(e) =>
                                  updateCondition(index, {
                                    value1: e.target.value,
                                  })
                                }
                                className="font-mono text-sm h-9"
                              />
                            )}

                            {/* Second Value (for Between operations) */}
                            {isBetween(condition.type) && (
                              <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                  End Value
                                </span>
                                {isDateOperation(condition.type) ? (
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
                                  <Input
                                    placeholder="Enter end value"
                                    value={condition.value2}
                                    disabled={searching}
                                    onChange={(e) =>
                                      updateCondition(index, {
                                        value2: e.target.value,
                                      })
                                    }
                                    className="font-mono text-sm h-9"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      {condition.field && condition.value1 && (
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Preview:
                            </span>
                            <code className="bg-muted border border-border px-2 py-1 rounded text-foreground font-mono text-xs">
                              {condition.field}{" "}
                              {operatorInfo?.label.toLowerCase()}{" "}
                              {isDateOperation(condition.type) &&
                              condition.value1
                                ? `"${format(new Date(condition.value1), "MMM dd, yyyy HH:mm")}"`
                                : `"${condition.value1}"`}
                              {isBetween(condition.type) &&
                                condition.value2 &&
                                (isDateOperation(condition.type)
                                  ? ` and "${format(new Date(condition.value2), "MMM dd, yyyy HH:mm")}"`
                                  : ` and "${condition.value2}"`)}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AND Connector */}
                {index < conditions.length - 1 && (
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className="bg-background text-muted-foreground border-border px-3 py-1"
                    >
                      AND
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
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
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleAdd}
                  disabled={searching}
                  className="w-full md:w-auto whitespace-nowrap border-primary/20 text-primary hover:bg-primary/10 bg-transparent disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearConditions}
                  disabled={searching}
                  className="w-full md:w-auto whitespace-nowrap text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="w-full md:w-auto">
                <Button
                  onClick={handleSearch}
                  disabled={validConditions.length === 0 || searching}
                  className="w-full md:w-auto md:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
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
