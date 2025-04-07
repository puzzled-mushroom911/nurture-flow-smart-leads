
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const uploadDocument = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // First, get available installations (we'll use the first one for now)
      const { data: installations, error: installationsError } = await supabase
        .from('ghl_installations')
        .select('id')
        .limit(1);
      
      if (installationsError || !installations || installations.length === 0) {
        throw new Error("No GoHighLevel installation found. Please connect an account first.");
      }
      
      const installationId = installations[0].id;
      
      // We'll simulate document processing with a direct database entry
      // In a production app, you'd send to a document processing service first
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          id: uuidv4(),
          installation_id: installationId,
          title: file.name,
          content: "Document content being processed...",
          source: "user_upload"
        });
      
      if (error) throw error;
      
      toast({
        title: "Document uploaded",
        description: "Your document is being processed and will be available soon.",
      });
      
      setFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="text-lg font-medium">Upload New Document</div>
      
      {!file ? (
        <div className="flex w-full items-center space-x-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.csv"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            disabled={!file}
            onClick={uploadDocument}
          >
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between border rounded-md p-3 bg-muted/20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              className="w-full" 
              onClick={uploadDocument} 
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Supported file types: PDF, DOC, DOCX, TXT, CSV
      </div>
    </div>
  );
}
