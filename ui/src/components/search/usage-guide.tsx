import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Filter,
  Hash,
  Calendar,
  Type,
  BookOpen,
  Lightbulb,
  Target,
} from "lucide-react";

export function UsageGuide() {
  const operatorExamples = [
    {
      category: "String Operations",
      icon: Type,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      examples: [
        { operator: "Equals to", example: 'username = "john_doe"' },
        { operator: "Contains", example: 'email contains "@gmail.com"' },
        { operator: "Starts with", example: 'name starts with "Admin"' },
        { operator: "Regex", example: 'phone matches "^\\+55"' },
      ],
    },
    {
      category: "Number Operations",
      icon: Hash,
      color: "bg-green-100 text-green-800 border-green-200",
      examples: [
        { operator: "Equals to", example: "age = 25" },
        { operator: "Greater than", example: "score > 100" },
        { operator: "Between", example: "price between 10 and 50" },
        { operator: "Less than", example: "attempts < 3" },
      ],
    },
    {
      category: "Date Operations",
      icon: Calendar,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      examples: [
        { operator: "After", example: 'created_at after "2024-01-01"' },
        { operator: "Before", example: 'updated_at before "2024-12-31"' },
        { operator: "Between", example: "login_date between dates" },
        { operator: "Equals to", example: 'birth_date = "1990-05-15"' },
      ],
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Add Conditions",
      description:
        "Click the 'Add Condition' button to start building your query",
      icon: Plus,
    },
    {
      step: 2,
      title: "Configure Fields",
      description:
        "Enter the field name, select an operator, and provide values",
      icon: Filter,
    },
    {
      step: 3,
      title: "Execute Search",
      description: "Click 'Search' to run your query against the database",
      icon: Search,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mx-auto">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            How to use the Query Builder
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build powerful search queries using our intuitive interface. Combine
            multiple conditions with different operators to find exactly what
            you're looking for.
          </p>
        </div>
      </div>

      {/* Quick Steps */}
      <Card className="border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-semibold">
                    {step.step}
                  </div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operator Examples */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Available Operators
          </h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {operatorExamples.map((category) => (
            <Card
              key={category.category}
              className="border-border/50 shadow-none"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <category.icon className="w-4 h-4" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.examples.map((example, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={category.color}>
                        {example.operator}
                      </Badge>
                    </div>
                    <code className="block text-xs font-mono bg-muted/50 border border-border px-2 py-1.5 rounded text-foreground">
                      {example.example}
                    </code>
                    {index < category.examples.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
