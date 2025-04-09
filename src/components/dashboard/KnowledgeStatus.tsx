import { BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/lib/services/leadService';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  status: number;
  created_at: string;
}

export function KnowledgeStatus() {
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: knowledgeItems, isLoading, error } = useQuery({
    queryKey: ['knowledge-status'],
    queryFn: async () => {
      // In a real implementation, this would come from your backend
      // For now, we'll generate some sample data
      return [
        {
          id: "1",
          name: "Product Catalog.pdf",
          type: "PDF",
          status: 100,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          name: "Service Offerings.docx",
          type: "Document",
          status: 100,
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          name: "Customer Testimonials.csv",
          type: "CSV",
          status: 75,
          created_at: new Date().toISOString()
        },
        {
          id: "4",
          name: "Pricing Guide.pdf",
          type: "PDF",
          status: 40,
          created_at: new Date().toISOString()
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleManageClick = () => {
    navigate('/knowledge');
  };

  const handleUploadComplete = () => {
    setIsUploadOpen(false);
    // In a real implementation, we would invalidate the query here
    // queryClient.invalidateQueries({ queryKey: ['knowledge-status'] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Base</span>
            <Button size="sm" variant="outline" disabled>Manage</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading knowledge base status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Base</span>
            <Button size="sm" variant="outline" disabled>Manage</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading knowledge base status. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Knowledge Base</span>
          <Button size="sm" variant="outline" onClick={handleManageClick}>Manage</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {knowledgeItems?.map((item) => (
            <div key={item.id} className="space-y-2">
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
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4" variant="outline">
                Upload Documents
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document to your knowledge base. We support PDF, DOC, DOCX, and TXT files.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {/* In a real implementation, you would add a file upload component here */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your files here, or click to select files
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadComplete}>
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
