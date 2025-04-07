
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConnectButtonsProps {
  isConnecting: boolean;
  onConnect: () => void;
}

export function ConnectButtons({ isConnecting, onConnect }: ConnectButtonsProps) {
  const { data: installations } = useQuery({
    queryKey: ['ghl-installations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ghl_installations')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

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
          installations && installations.length > 0 ? "Connect Another Location" : "Connect GoHighLevel"
        )}
      </Button>
    </div>
  );
}
