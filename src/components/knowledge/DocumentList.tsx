
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  created_at: string;
  status: "processing" | "complete" | "error";
  progress?: number;
}

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform to UI model and add mock processing state
      // In a real app, this would come from the backend
      const transformedData: Document[] = data.map(doc => {
        const randomStatus = Math.random() > 0.7 ? 
          (Math.random() > 0.5 ? "processing" : "error") : 
          "complete";
          
        return {
          id: doc.id,
          title: doc.title,
          created_at: doc.created_at,
          status: randomStatus as "processing" | "complete" | "error",
          progress: randomStatus === "processing" ? Math.floor(Math.random() * 100) : undefined
        };
      });
      
      setDocuments(transformedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Failed to load documents",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      // Confirm before delete
      if (!window.confirm("Are you sure you want to delete this document?")) {
        return;
      }
      
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update UI
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been removed from your knowledge base",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getDocumentSize = (title: string) => {
    // Mock function to generate realistic file sizes
    const size = ((title.length * 100) + Math.random() * 5000) / 1024;
    return `${size.toFixed(1)} MB`;
  };

  const getDocumentType = (title: string) => {
    if (title.endsWith('.pdf')) return 'PDF';
    if (title.endsWith('.docx') || title.endsWith('.doc')) return 'Document';
    if (title.endsWith('.csv')) return 'CSV';
    if (title.endsWith('.txt')) return 'Text';
    return 'File';
  };

  const getUploadTime = (created_at: string) => {
    const date = new Date(created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    
    return 'Just now';
  };

  const retryProcessing = (id: string) => {
    // In a real app, this would call a backend API to retry processing
    // For now, we'll just simulate it by changing the status
    setDocuments(documents.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          status: "processing",
          progress: 10
        };
      }
      return doc;
    }));
    
    toast({
      title: "Processing restarted",
      description: "Document processing has been restarted",
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Your Documents</h3>
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? "Loading documents..." : "No documents found. Upload a document to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex space-x-3 text-xs text-muted-foreground">
                        <span>{getDocumentType(doc.title)}</span>
                        <span>{getDocumentSize(doc.title)}</span>
                        <span>Uploaded {getUploadTime(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {doc.status !== "complete" && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">
                        {doc.status === "processing" ? "Processing" : "Error"}
                      </span>
                      {doc.status === "processing" && doc.progress !== undefined && (
                        <span>{doc.progress}%</span>
                      )}
                    </div>
                    
                    {doc.status === "processing" && doc.progress !== undefined && (
                      <Progress value={doc.progress} className="h-1.5" />
                    )}
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {doc.status === "processing" ? 
                          "Analyzing document content..." : 
                          "Error processing document."}
                      </p>
                      
                      {doc.status === "error" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => retryProcessing(doc.id)}
                          className="h-7 text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {doc.status === "complete" && (
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <Check className="h-3 w-3 mr-1" /> Document processed successfully
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
