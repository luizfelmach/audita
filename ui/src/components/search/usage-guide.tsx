import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Filter, BookOpen, Target } from "lucide-react";

export function UsageGuide() {
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
    </div>
  );
}
