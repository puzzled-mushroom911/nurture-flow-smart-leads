
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function IntegrationSteps() {
  return (
    <div>
      <Separator className="my-6" />
      
      <h3 className="text-lg font-medium mb-2">Integration Steps</h3>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Connect your GoHighLevel account using the button below</li>
        <li>Select the location you want to integrate</li>
        <li>Authorize access to your contacts and messaging</li>
        <li>Start using AI-powered messaging for your leads</li>
      </ol>

      <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Troubleshooting Tips</AlertTitle>
        <AlertDescription className="text-blue-700">
          <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
            <li>Make sure you have admin access to your GoHighLevel account</li>
            <li>Ensure the redirect URI <code className="bg-blue-100 px-1 py-0.5 rounded">https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback</code> is registered in your GoHighLevel app</li>
            <li>If you encounter errors, try clearing your browser cookies or using a private/incognito window</li>
            <li>Check that your GoHighLevel account has the necessary scopes enabled for integration</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
