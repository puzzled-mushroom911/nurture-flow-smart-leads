
import { Separator } from "@/components/ui/separator";

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
    </div>
  );
}
