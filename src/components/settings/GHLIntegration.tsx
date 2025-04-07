
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GHLIntegration() {
  const { toast } = useToast();
  const location = useLocation();
  const [integrationStatus, setIntegrationStatus] = useState<'none' | 'success' | 'error' | 'loading'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState<boolean>(false);
  
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
      setIsErrorDialogOpen(true);
      toast({
        title: "Integration Failed",
        description: "Failed to connect your GoHighLevel account. Click for details.",
        variant: "destructive",
      });
    }
  }, [location.search, toast]);

  // Get installations
  const { data: installations, isLoading, refetch } = useQuery({
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
    setIsConnecting(true);
    setIntegrationStatus('loading');
    window.location.href = 'https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-auth';
  };

  return (
    <>
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
            <Alert 
              className="mb-4 bg-red-50 border-red-200 cursor-pointer" 
              variant="destructive"
              onClick={() => setIsErrorDialogOpen(true)}
            >
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                An error occurred while connecting to GoHighLevel. Click for details.
              </AlertDescription>
            </Alert>
          )}

          {integrationStatus === 'loading' && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertTitle className="text-blue-800">Connecting...</AlertTitle>
              <AlertDescription className="text-blue-700">
                Please wait while we connect to your GoHighLevel account.
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
                        <div className="text-xs text-gray-400">Token Expires: {new Date(install.token_expires_at).toLocaleString()}</div>
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
          <div className="flex gap-2">
            {installations && installations.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="flex items-center"
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                installations && installations.length > 0 ? "Connect Another Location" : "Connect GoHighLevel"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Connection Error</DialogTitle>
            <DialogDescription>
              <div className="mt-4 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">The following error occurred:</p>
                <div className="bg-gray-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                  {errorMessage || "Unknown error occurred during OAuth callback."}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-semibold">Possible solutions:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check that your GoHighLevel credentials are correct</li>
                    <li>Verify that your redirect URI is properly configured in the GoHighLevel Marketplace</li>
                    <li>Make sure your GoHighLevel account has appropriate permissions</li>
                    <li>Try clearing your browser cookies and cache</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
