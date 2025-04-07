
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, FileText, Trash2, RefreshCw, Book } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  progress: number;
  status: "processing" | "complete" | "error";
  uploaded: string;
}

// Mock data for documents
const documents: Document[] = [
  {
    id: "1",
    name: "Product Catalog.pdf",
    type: "PDF",
    size: "4.2 MB",
    progress: 100,
    status: "complete",
    uploaded: "2 days ago",
  },
  {
    id: "2",
    name: "Service Offerings.docx",
    type: "Document",
    size: "2.8 MB",
    progress: 100,
    status: "complete",
    uploaded: "3 days ago",
  },
  {
    id: "3",
    name: "Customer Testimonials.csv",
    type: "CSV",
    size: "1.5 MB",
    progress: 75,
    status: "processing",
    uploaded: "10 minutes ago",
  },
  {
    id: "4",
    name: "Pricing Guide.pdf",
    type: "PDF",
    size: "3.1 MB",
    progress: 40,
    status: "processing",
    uploaded: "Just now",
  },
];

const Knowledge = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
            <p className="text-muted-foreground">
              Upload and manage documents for AI context
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-1" /> Upload Document
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex w-full max-w-lg items-center space-x-2">
          <Input placeholder="Search knowledge base..." className="flex-1" />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex space-x-3 text-xs text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Uploaded {doc.uploaded}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {doc.status !== "complete" && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Processing</span>
                        <span>{doc.progress}%</span>
                      </div>
                      <Progress value={doc.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {doc.status === "processing" ? 
                          "Analyzing document content..." : 
                          "Error processing document. Click to retry."}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Knowledge;
