
import { MainLayout } from "@/components/layout/MainLayout";
import GHLIntegration from "@/components/settings/GHLIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="integrations">
          <TabsList className="mb-4">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations" className="space-y-6">
            <GHLIntegration />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <p className="text-gray-500">Account settings will be available soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">API Settings</h2>
              <p className="text-gray-500">API settings will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
