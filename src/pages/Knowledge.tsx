import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Book, Plus } from "lucide-react";
import { useState } from "react";
import { DocumentUploader } from "@/components/knowledge/DocumentUploader";
import { DocumentList } from "@/components/knowledge/DocumentList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DocumentUpload } from '@/components/knowledge/DocumentUpload'

const Knowledge = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would search the knowledge base
    console.log("Searching for:", searchQuery);
  };
  
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
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to your knowledge base. We support PDF, DOC, DOCX, and TXT files.
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload 
                  onUploadComplete={() => {
                    setIsUploadOpen(false)
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
          <Input 
            placeholder="Search knowledge base..." 
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </form>
        
        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Knowledge;
