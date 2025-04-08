import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extract the code and state from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        
        if (error) {
          setStatus("error");
          setErrorMessage(error);
          setTimeout(() => {
            navigate(`/settings?integration=error&message=${encodeURIComponent(error)}`);
          }, 2000);
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorMessage("No authorization code received");
          setTimeout(() => {
            navigate("/settings?integration=error&message=No authorization code received");
          }, 2000);
          return;
        }

        // Process the callback - this redirects to the backend which handles the OAuth token exchange
        window.location.href = `https://vxgvmmudspqwsaedcmsl.supabase.co/functions/v1/nurtureflow-callback?code=${code}${state ? `&state=${state}` : ''}`;
        
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Unknown error");
        setTimeout(() => {
          navigate(`/settings?integration=error&message=${encodeURIComponent(errorMessage || "Unknown error")}`);
        }, 2000);
      }
    }

    handleCallback();
  }, [location, navigate, errorMessage]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {status === "processing" && "Connecting your account..."}
            {status === "success" && "Connection successful!"}
            {status === "error" && "Connection failed"}
          </h1>
          
          <div className="mt-4">
            {status === "processing" && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {status === "error" && (
              <p className="text-destructive mt-2">{errorMessage || "An unknown error occurred"}</p>
            )}
            
            <p className="text-gray-500 mt-4">
              {status === "processing" && "Please wait while we connect your GoHighLevel account..."}
              {status === "success" && "Redirecting you back to the settings page..."}
              {status === "error" && "Redirecting you back to try again..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 