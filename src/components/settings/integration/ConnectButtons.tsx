import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useGHL } from "@/hooks/useGHL";

interface ConnectButtonsProps {
  isConnecting: boolean;
  onConnect: () => void;
}

export function ConnectButtons({ isConnecting, onConnect }: ConnectButtonsProps) {
  const { installations } = useGHL();

  return (
    <div className="flex justify-between w-full">
      <Button 
        variant="outline" 
        onClick={() => window.open("https://marketplace.gohighlevel.com/", "_blank")}
        className="flex items-center"
      >
        GoHighLevel Dashboard <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
      
      <Button 
        onClick={onConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          installations.data && installations.data.length > 0 ? "Connect Another Location" : "Connect GoHighLevel"
        )}
      </Button>
    </div>
  );
}
