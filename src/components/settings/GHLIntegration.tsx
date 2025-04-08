import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import IntegrationAlerts from "./integration/IntegrationAlerts";
import ConnectedLocations from "./integration/ConnectedLocations";
import IntegrationSteps from "./integration/IntegrationSteps";
import { ErrorDialog } from "./integration/ErrorDialog";
import { ConnectButtons } from "./integration/ConnectButtons";
import { useGHL } from "@/hooks/useGHL";

export default function GHLIntegration() {
  const { toast } = useToast();
  const location = useLocation();
  const { connectGHL, connectionStatus } = useGHL();
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
