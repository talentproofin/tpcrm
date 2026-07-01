import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @param {{ title: string, description?: string }} props
 */
export function LeadSectionPlaceholder({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description ?? "This section will be available in a future milestone."}
        </p>
      </CardContent>
    </Card>
  );
}
