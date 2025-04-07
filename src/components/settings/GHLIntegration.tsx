
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function GHLIntegration() {
  const { toast } = useToast();
  const location = useLocation();
  const [integrationStatus, setIntegrationStatus] = useState<'none' | 'success' | 'error'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Parse query parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const integration = searchParams.get('integration');
    const message = searchParams.get('message');
    
    if (integration === 'success') {
      setIntegrationStatus('success');
      toast({
        title: "Integration Successful",
        description: "Your GoHighLevel account has been connected.",
      });
    } else if (integration === 'error') {
      setIntegrationStatus('error');
      setErrorMessage(message || "An unknown error occurred during integration.");
      toast({
        title: "Integration Failed",
        description: message || "Failed to connect your GoHighLevel account.",
        variant: "destructive",
      });
    }
  }, [location.search, toast]);

  // Get installations
  const { data: installations, isLoading } = useQuery({
    queryKey: ['ghl-installations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ghl_installations')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleConnect = () => {
    window.location.href = 'https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/ghl-auth';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GoHighLevel Integration</CardTitle>
        <CardDescription>
          Connect your GoHighLevel account to enable AI-powered messaging and lead management.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {integrationStatus === 'success' && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Your GoHighLevel account has been successfully connected.
            </AlertDescription>
          </Alert>
        )}
        
        {integrationStatus === 'error' && (
          <Alert className="mb-4 bg-red-50 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              {errorMessage || "An error occurred while connecting to GoHighLevel."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading integration status...</div>
          ) : installations && installations.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-2">Connected Locations</h3>
              <div className="space-y-4">
                {installations.map((install) => (
                  <div key={install.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Location ID: {install.location_id}</div>
                      <div className="text-sm text-gray-500">Company ID: {install.company_id}</div>
                      <div className="text-xs text-gray-400">Connected: {new Date(install.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Connections</h3>
              <p className="text-gray-500 mb-4">
                Connect your GoHighLevel account to get started with AI messaging.
              </p>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Integration Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Connect your GoHighLevel account using the button below</li>
              <li>Select the location you want to integrate</li>
              <li>Authorize access to your contacts and messaging</li>
              <li>Start using AI-powered messaging for your leads</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => window.open("https://marketplace.gohighlevel.com/", "_blank")}
          className="flex items-center"
        >
          GoHighLevel Dashboard <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={handleConnect}>
          {installations && installations.length > 0 ? "Connect Another Location" : "Connect GoHighLevel"}
        </Button>
      </CardFooter>
    </Card>
  );
}
