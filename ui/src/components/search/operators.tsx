import {
  AlignEndVertical,
  AlignStartVertical,
  Calendar1,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarRange,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Equal,
  EqualNot,
  MoveHorizontal,
  Regex,
  Search,
} from "lucide-react";

export const operators = {
  string: [
    { type: "EqString", label: "Equals to", icon: Equal },
    { type: "NeqString", label: "Not equals to", icon: EqualNot },
    { type: "Contains", label: "Contains", icon: Search },
    { type: "StartsWith", label: "Starts with", icon: AlignStartVertical },
    { type: "EndsWith", label: "Ends with", icon: AlignEndVertical },
    { type: "Regex", label: "Regex", icon: Regex },
  ],

  number: [
    { type: "EqInt", label: "Equals to", icon: Equal },
    { type: "NeqInt", label: "Not equals to", icon: EqualNot },
    { type: "GtInt", label: "Greater than", icon: ChevronRight },
    { type: "LtInt", label: "Less than", icon: ChevronLeft },
    { type: "BetweenInt", label: "Between", icon: MoveHorizontal },
  ],

  date: [
    { type: "EqDate", label: "Equals to", icon: Calendar1 },
    { type: "NeqDate", label: "Not equals to", icon: CalendarX },
    { type: "AfterDate", label: "After", icon: CalendarArrowUp },
    { type: "BeforeDate", label: "Before", icon: CalendarArrowDown },
    { type: "BetweenDate", label: "Between", icon: CalendarRange },
  ],
};
