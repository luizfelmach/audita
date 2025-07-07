import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Trash2, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

import {
  IconEqual,
  IconEqualNot,
  IconSearch,
  IconChevronRight,
  IconChevronLeft,
  IconRegex,
  IconMathGreater,
  IconMathLower,
  IconArrowsHorizontal,
  IconCalendar,
  IconChevronUp,
  IconChevronDown,
  IconCalendarWeek,
} from "@tabler/icons-react";
import { useQueryContext } from "@/context/use-query";
import { useState } from "react";
import { Condition, OperatorType } from "@/types/search";

const operations = {
  string: [
    { type: "EqString", label: "Equals to", icon: IconEqual },
    { type: "NeqString", label: "Not equals to", icon: IconEqualNot },
    { type: "Contains", label: "Contains", icon: IconSearch },
    { type: "StartsWith", label: "Starts with", icon: IconChevronRight },
    { type: "EndsWith", label: "Ends with", icon: IconChevronLeft },
    { type: "Regex", label: "Regex", icon: IconRegex },
  ],
  number: [
    { type: "EqInt", label: "Equals to", icon: IconEqual },
    { type: "NeqInt", label: "Not equals to", icon: IconEqualNot },
    { type: "GtInt", label: "Greater than", icon: IconMathGreater },
    { type: "LtInt", label: "Less than", icon: IconMathLower },
    { type: "BetweenInt", label: "Between", icon: IconArrowsHorizontal },
  ],
  date: [
    { type: "EqDate", label: "Equals to", icon: IconCalendar },
    { type: "NeqDate", label: "Not equals to", icon: IconEqualNot },
    { type: "AfterDate", label: "After", icon: IconChevronUp },
    { type: "BeforeDate", label: "Before", icon: IconChevronDown },
    { type: "BetweenDate", label: "Between", icon: IconCalendarWeek },
  ],
};

export function QueryBuilder() {
  const { query, removeCondition, updateCondition } = useQueryContext();

  const [uiState, setUiState] = useState<
    Record<
      number,
      {
        dateValue?: Date;
        dateValue2?: Date;
        timeValue?: string;
        timeValue2?: string;
      }
    >
  >({});

  const conditions = query.and || [];

  const getOperationType = (operatorType: OperatorType) => {
    if (operations.string.find((op) => op.type === operatorType))
      return "string";
    if (operations.number.find((op) => op.type === operatorType))
      return "number";
    if (operations.date.find((op) => op.type === operatorType)) return "date";
    return "string";
  };

  const isDateOperation = (operatorType: OperatorType) => {
    return getOperationType(operatorType) === "date";
  };

  const isNumberOperation = (operatorType: OperatorType) => {
    return getOperationType(operatorType) === "number";
  };

  const needsTwoValues = (operatorType: OperatorType) => {
    return operatorType === "BetweenInt" || operatorType === "BetweenDate";
  };

  const handleRemoveCondition = (index: number) => {
    removeCondition("and", index);
    // Clean up UI state
    setUiState((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const handleUpdateCondition = (
    index: number,
    updates: Partial<Condition>,
  ) => {
    const currentCondition = conditions[index];
    if (currentCondition) {
      updateCondition("and", index, { ...currentCondition, ...updates });
    }
  };

  const handleOperatorChange = (
    index: number,
    newOperatorType: OperatorType,
  ) => {
    const currentCondition = conditions[index];
    if (currentCondition) {
      let newValue: string | [number, number] | [string, string] = "";

      if (needsTwoValues(newOperatorType)) {
        if (isNumberOperation(newOperatorType)) {
          newValue = [0, 0];
        } else if (isDateOperation(newOperatorType)) {
          newValue = ["", ""];
        } else {
          newValue = ["", ""];
        }
      }

      handleUpdateCondition(index, {
        op: {
          type: newOperatorType,
          value: newValue,
        },
      });

      // Reset UI state for this condition
      setUiState((prev) => ({
        ...prev,
        [index]: {
          dateValue: undefined,
          dateValue2: undefined,
          timeValue: isDateOperation(newOperatorType) ? "00:00" : undefined,
          timeValue2: isDateOperation(newOperatorType) ? "23:59" : undefined,
        },
      }));
    }
  };

  const handleValueChange = (
    index: number,
    value: string,
    isSecondValue = false,
  ) => {
    const currentCondition = conditions[index];
    if (!currentCondition) return;

    const operatorType = currentCondition.op.type;
    let newValue: string | [number, number] | [string, string];

    if (needsTwoValues(operatorType)) {
      const currentArray = Array.isArray(currentCondition.op.value)
        ? currentCondition.op.value
        : ["", ""];

      if (isNumberOperation(operatorType)) {
        const numArray = currentArray as [number, number];
        newValue = isSecondValue
          ? [numArray[0], Number.parseFloat(value) || 0]
          : [Number.parseFloat(value) || 0, numArray[1]];
      } else {
        const strArray = currentArray as [string, string];
        newValue = isSecondValue ? [strArray[0], value] : [value, strArray[1]];
      }
    } else {
      newValue = value;
    }

    handleUpdateCondition(index, {
      op: {
        ...currentCondition.op,
        value: newValue,
      },
    });
  };

  const handleDateChange = (
    index: number,
    date: Date | undefined,
    isSecondValue = false,
  ) => {
    const currentCondition = conditions[index];
    if (!currentCondition) return;

    // Update UI state
    setUiState((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [isSecondValue ? "dateValue2" : "dateValue"]: date,
      },
    }));

    // Update condition value
    if (date) {
      const currentUiState = uiState[index] || {};
      const timeValue = isSecondValue
        ? currentUiState.timeValue2 || "23:59"
        : currentUiState.timeValue || "00:00";

      const dateTimeString = `${format(date, "yyyy-MM-dd")}T${timeValue}`;

      if (needsTwoValues(currentCondition.op.type)) {
        const currentArray = Array.isArray(currentCondition.op.value)
          ? (currentCondition.op.value as [string, string])
          : ["", ""];

        const newValue: [string, string] = isSecondValue
          ? [currentArray[0], dateTimeString]
          : [dateTimeString, currentArray[1]];

        handleUpdateCondition(index, {
          op: {
            ...currentCondition.op,
            value: newValue,
          },
        });
      } else {
        handleUpdateCondition(index, {
          op: {
            ...currentCondition.op,
            value: dateTimeString,
          },
        });
      }
    }
  };

  const handleTimeChange = (
    index: number,
    time: string,
    isSecondValue = false,
  ) => {
    // Update UI state
    setUiState((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [isSecondValue ? "timeValue2" : "timeValue"]: time,
      },
    }));

    // Update condition if date is already set
    const currentUiState = uiState[index] || {};
    const dateValue = isSecondValue
      ? currentUiState.dateValue2
      : currentUiState.dateValue;

    if (dateValue) {
      handleDateChange(index, dateValue, isSecondValue);
    }
  };

  const getDisplayValue = (condition: Condition, isSecondValue = false) => {
    if (
      needsTwoValues(condition.op.type) &&
      Array.isArray(condition.op.value)
    ) {
      return isSecondValue
        ? condition.op.value[1]?.toString() || ""
        : condition.op.value[0]?.toString() || "";
    }
    return isSecondValue ? "" : condition.op.value?.toString() || "";
  };

  const groupedOperations = operations;

  return (
    <div>
      {/* Header Row - Hidden on mobile */}
      <div className="hidden lg:grid lg:grid-cols-11 gap-4 mb-4 text-sm font-medium text-gray-700">
        <div className="col-span-3">Field Key</div>
        <div className="col-span-4">Operation</div>
        <div className="col-span-3">Value</div>
        <div className="col-span-1"></div>
      </div>

      {/* Filter Rows */}
      <div className="space-y-6">
        {conditions.map((condition, index) => (
          <div key={index}>
            {index > 0 && (
              <div className="flex justify-center mb-4">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  AND
                </span>
              </div>
            )}
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-11 lg:gap-4 lg:items-start p-4 lg:p-0 border lg:border-0 rounded-lg lg:rounded-none">
              {/* Field Name */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:hidden">
                  Field Key
                </label>
                <Input
                  placeholder="Ex: message, user_id, timestamp"
                  value={condition.field}
                  onChange={(e) =>
                    handleUpdateCondition(index, { field: e.target.value })
                  }
                  className="h-9 text-sm w-full"
                />
              </div>

              {/* Operation */}
              <div className="lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:hidden">
                  Operation
                </label>
                <Select
                  value={condition.op.type}
                  onValueChange={(value: OperatorType) =>
                    handleOperatorChange(index, value)
                  }
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* String Operations */}
                    {groupedOperations.string.map((op) => {
                      const IconComponent = op.icon;
                      return (
                        <SelectItem key={op.type} value={op.type}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{op.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}

                    <SelectSeparator />

                    {/* Number Operations */}
                    {groupedOperations.number.map((op) => {
                      const IconComponent = op.icon;
                      return (
                        <SelectItem key={op.type} value={op.type}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{op.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}

                    <SelectSeparator />

                    {/* Date Operations */}
                    {groupedOperations.date.map((op) => {
                      const IconComponent = op.icon;
                      return (
                        <SelectItem key={op.type} value={op.type}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{op.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:hidden">
                  Value
                </label>
                <div className="space-y-2">
                  {isDateOperation(condition.op.type) ? (
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-9 justify-start text-left font-normal text-sm bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {uiState[index]?.dateValue
                              ? format(uiState[index].dateValue!, "MM/dd/yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={uiState[index]?.dateValue}
                            onSelect={(date) => handleDateChange(index, date)}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <Input
                          type="time"
                          value={uiState[index]?.timeValue || "00:00"}
                          onChange={(e) =>
                            handleTimeChange(index, e.target.value)
                          }
                          className="h-9 text-sm flex-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      placeholder="Enter value"
                      type={
                        isNumberOperation(condition.op.type) ? "number" : "text"
                      }
                      value={getDisplayValue(condition)}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="h-9 text-sm w-full"
                    />
                  )}

                  {needsTwoValues(condition.op.type) && (
                    <div className="pt-1 space-y-2">
                      {isDateOperation(condition.op.type) ? (
                        <div className="space-y-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-9 justify-start text-left font-normal text-sm bg-transparent"
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {uiState[index]?.dateValue2
                                  ? format(
                                      uiState[index].dateValue2!,
                                      "MM/dd/yyyy",
                                    )
                                  : "End date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={uiState[index]?.dateValue2}
                                onSelect={(date) =>
                                  handleDateChange(index, date, true)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <Input
                              type="time"
                              value={uiState[index]?.timeValue2 || "23:59"}
                              onChange={(e) =>
                                handleTimeChange(index, e.target.value, true)
                              }
                              className="h-9 text-sm flex-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <Input
                          placeholder="End value"
                          type={
                            isNumberOperation(condition.op.type)
                              ? "number"
                              : "text"
                          }
                          value={getDisplayValue(condition, true)}
                          onChange={(e) =>
                            handleValueChange(index, e.target.value, true)
                          }
                          className="h-9 text-sm w-full"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <div className="lg:col-span-1 flex justify-center lg:justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(index)}
                  className="h-9 w-9 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
