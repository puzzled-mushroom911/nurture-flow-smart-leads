
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConnectedLocationsProps {
  integrationStatus: 'none' | 'success' | 'error' | 'loading';
}

export default function ConnectedLocations({ integrationStatus }: ConnectedLocationsProps) {
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

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading integration status...</div>;
  }

  if (installations && installations.length > 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Connected Locations</h3>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
    );
  }

  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium mb-2">No Connections</h3>
      <p className="text-gray-500 mb-4">
        Connect your GoHighLevel account to get started with AI messaging.
      </p>
    </div>
  );
}
