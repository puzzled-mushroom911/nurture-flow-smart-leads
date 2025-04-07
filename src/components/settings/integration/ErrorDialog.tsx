
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string | null;
}

export function ErrorDialog({ isOpen, onOpenChange, errorMessage }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Connection Error</DialogTitle>
          <DialogDescription>
            <div className="mt-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">The following error occurred:</p>
              <div className="bg-gray-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                {errorMessage || "Unknown error occurred during OAuth callback."}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">Possible solutions:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check that your GoHighLevel credentials are correct</li>
                  <li>Verify that your redirect URI is properly configured in the GoHighLevel Marketplace</li>
                  <li>Make sure your GoHighLevel account has appropriate permissions</li>
                  <li>Try clearing your browser cookies and cache</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
