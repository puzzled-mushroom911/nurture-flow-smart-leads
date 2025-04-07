
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface IntegrationAlertsProps {
  integrationStatus: 'none' | 'success' | 'error' | 'loading';
  onErrorClick: () => void;
}

export default function IntegrationAlerts({ integrationStatus, onErrorClick }: IntegrationAlertsProps) {
  if (integrationStatus === 'none') return null;

  if (integrationStatus === 'success') {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
        <AlertDescription className="text-green-700">
          Your GoHighLevel account has been successfully connected.
        </AlertDescription>
      </Alert>
    );
  }

  if (integrationStatus === 'error') {
    return (
      <Alert 
        className="mb-4 bg-red-50 border-red-200 cursor-pointer" 
        variant="destructive"
        onClick={onErrorClick}
      >
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
        <AlertDescription className="text-red-700">
          An error occurred while connecting to GoHighLevel. Click for details.
        </AlertDescription>
      </Alert>
    );
  }

  if (integrationStatus === 'loading') {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <AlertTitle className="text-blue-800">Connecting...</AlertTitle>
        <AlertDescription className="text-blue-700">
          Please wait while we connect to your GoHighLevel account.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
