
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface KnowledgeItem {
  name: string;
  type: string;
  status: number;
}

// Mock data for knowledge base items
const knowledgeItems: KnowledgeItem[] = [
  {
    name: "Product Catalog.pdf",
    type: "PDF",
    status: 100,
  },
  {
    name: "Service Offerings.docx",
    type: "Document",
    status: 100,
  },
  {
    name: "Customer Testimonials.csv",
    type: "CSV",
    status: 75,
  },
  {
    name: "Pricing Guide.pdf",
    type: "PDF",
    status: 40,
  },
];

export function KnowledgeStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Knowledge Base</span>
          <Button size="sm" variant="outline">Manage</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {knowledgeItems.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">{item.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={item.status} className="h-1.5" />
                <span className="text-xs text-muted-foreground w-12">
                  {item.status}%
                </span>
              </div>
            </div>
          ))}
          
          <Button className="w-full mt-4" variant="outline">
            Upload Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
