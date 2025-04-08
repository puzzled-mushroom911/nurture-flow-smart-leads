import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { useGHL } from "@/hooks/useGHL";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ConnectedLocationsProps {
  integrationStatus: 'none' | 'success' | 'error' | 'loading';
}

export default function ConnectedLocations({ integrationStatus }: ConnectedLocationsProps) {
  const { installations, disconnectIntegration } = useGHL();

  if (installations.isLoading) {
    return <div className="text-sm text-gray-500">Loading integration status...</div>;
  }

  if (installations.data && installations.data.length > 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Connected Locations</h3>
          <Button 
            variant="outline" 
            onClick={() => installations.refetch()}
            className="flex items-center"
            disabled={installations.isLoading || installations.isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${installations.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {installations.data.map((install) => (
            <div key={install.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Location ID: {install.location_id}</div>
                <div className="text-sm text-gray-500">Company ID: {install.company_id}</div>
                <div className="text-xs text-gray-400">Connected: {new Date(install.created_at).toLocaleString()}</div>
                <div className="text-xs text-gray-400">Token Expires: {new Date(install.token_expires_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Integration</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect this GoHighLevel location? This action cannot be undone, and all linked data will be unlinked.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => disconnectIntegration.mutate(install.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
