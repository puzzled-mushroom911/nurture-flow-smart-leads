import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import IntegrationAlerts from "./integration/IntegrationAlerts";
import ConnectedLocations from "./integration/ConnectedLocations";
import IntegrationSteps from "./integration/IntegrationSteps";
import { ErrorDialog } from "./integration/ErrorDialog";
import { ConnectButtons } from "./integration/ConnectButtons";
import { useGHL } from "@/hooks/useGHL";
import { Button } from "@/components/ui/button";
import { Loader2, Bug, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GHLIntegration() {
  const { toast } = useToast();
  const location = useLocation();
  const { connectGHL, connectionStatus, refreshConnection, installations } = useGHL();
  const [integrationStatus, setIntegrationStatus] = useState<'none' | 'success' | 'error' | 'loading'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Parse query parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const integration = searchParams.get('integration');
    const message = searchParams.get('message');
    
    if (integration === 'success') {
      setIntegrationStatus('success');
      // Force refresh connection status to ensure we show the latest data
      refreshConnection();
      
      // Only show toast if not already connected
      if (!connectionStatus.data?.connected) {
        toast({
          title: "Integration Successful",
          description: "Your GoHighLevel account has been connected.",
        });
      }
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
  }, [location.search, toast, refreshConnection, connectionStatus.data?.connected]);

  // Fetch connection status diagnostic info when requested
  useEffect(() => {
    if (showDebug) {
      fetchDiagnosticInfo();
    }
  }, [showDebug]);

  // Run diagnostic and try auto-repair if we have consistent connection issues
  useEffect(() => {
    // If we've had repeated failures in connection status
    if (
      connectionStatus.isError || 
      (installations.isError && connectionStatus.data && !connectionStatus.data.connected)
    ) {
      console.log("Connection issues detected, fetching diagnostics...");
      fetchDiagnosticInfo(false);
    }
  }, [connectionStatus.isError, installations.isError, connectionStatus.data]);

  const fetchDiagnosticInfo = async (showOutput = true) => {
    try {
      // Fetch diagnostic info from our endpoint
      const response = await fetch("https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/ghl-diagnostic");
      const data = await response.json();
      
      if (showOutput) {
        setDebugInfo(data);
      }
      
      // If we have a database issue, try to fix it automatically
      if (
        data?.results?.diagnostics?.schema?.error || 
        data?.results?.diagnostics?.installations?.error || 
        data?.results?.diagnostics?.installations?.count === 0
      ) {
        console.log("Attempting auto-repair...");
        
        // Call diagnostic with fix mode
        const fixResponse = await fetch("https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/ghl-diagnostic?mode=fix");
        const fixData = await fixResponse.json();
        
        if (fixData?.results?.fixed) {
          console.log("Auto-repair successful, refreshing connection status");
          refreshConnection();
          
          if (showOutput) {
            setDebugInfo(fixData);
            toast({
              title: "Auto-repair Successful",
              description: "Connection issues were detected and automatically fixed.",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching diagnostic info:", error);
      if (showOutput) {
        setDebugInfo({ error: error.message });
      }
    }
  };

  const handleRunRepair = async () => {
    try {
      // Clear any existing debug info
      setDebugInfo(null);
      
      // Show loading state
      setDebugInfo({ loading: true });
      
      // Call diagnostic with recreate mode
      const response = await fetch("https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/ghl-diagnostic?mode=recreate");
      const data = await response.json();
      
      setDebugInfo(data);
      
      if (data?.results?.fixed) {
        toast({
          title: "Repair Successful",
          description: "Connection has been reset. Refreshing data...",
        });
        
        // Refresh connection status
        refreshConnection();
      } else {
        toast({
          title: "Repair Failed",
          description: "Check the debug info for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running repair:", error);
      setDebugInfo({ error: error.message });
      
      toast({
        title: "Repair Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setIntegrationStatus('loading');
    connectGHL();
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
          <IntegrationAlerts 
            integrationStatus={integrationStatus} 
            onErrorClick={() => setIsErrorDialogOpen(true)} 
          />
          
          <div className="space-y-6">
            <ConnectedLocations 
              integrationStatus={integrationStatus}
            />
            
            <IntegrationSteps />
            
            {/* Debug features */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  {showDebug ? "Hide" : "Show"} Diagnostics
                </Button>
                
                {showDebug && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchDiagnosticInfo()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRunRepair}
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                      Reset Connection
                    </Button>
                  </div>
                )}
              </div>
              
              {showDebug && (
                <div className="mt-4">
                  {debugInfo?.loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading diagnostic info...</span>
                    </div>
                  ) : debugInfo?.error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{debugInfo.error}</AlertDescription>
                    </Alert>
                  ) : debugInfo ? (
                    <div className="bg-secondary p-4 rounded overflow-auto max-h-96">
                      <pre className="text-xs">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click "Refresh" to run diagnostics.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <ConnectButtons 
            isConnecting={isConnecting}
            onConnect={handleConnect}
          />
        </CardFooter>
      </Card>

      <ErrorDialog 
        isOpen={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        errorMessage={errorMessage}
      />
    </>
  );
}
