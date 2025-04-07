
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntegrationSteps() {
  const openGHLMarketplace = () => {
    window.open("https://marketplace.gohighlevel.com/oauth-apps", "_blank");
  };

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

      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          onClick={openGHLMarketplace}
          className="flex items-center text-xs"
          size="sm"
        >
          GoHighLevel OAuth Settings <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Required Configuration</AlertTitle>
        <AlertDescription className="text-blue-700">
          <p className="mb-2 text-sm">Before connecting, make sure you've configured these settings in your GoHighLevel OAuth app:</p>
          <div className="bg-white p-3 rounded-md border border-blue-100 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-xs">Redirect URI</span>
              <code className="bg-blue-50 px-2 py-0.5 rounded text-xs">https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs">Required Scopes</span>
              <code className="bg-blue-50 px-2 py-0.5 rounded text-xs break-all text-[10px]">locations.readonly contacts.write conversations.readonly conversations/message.write opportunities.write opportunities.readonly</code>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
            <li>Make sure you have admin access to your GoHighLevel account</li>
            <li>If you encounter errors, try clearing your browser cookies or using a private/incognito window</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
