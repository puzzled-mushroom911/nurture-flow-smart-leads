
import { MainLayout } from "@/components/layout/MainLayout";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Filter, RefreshCcw } from "lucide-react";

const Leads = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lead Inbox</h2>
            <p className="text-muted-foreground">
              Review and approve AI-generated messages before sending
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-1" /> Generate Messages
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval (12)</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled (5)</TabsTrigger>
            <TabsTrigger value="sent">Sent (45)</TabsTrigger>
            <TabsTrigger value="rejected">Rejected (8)</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <ApprovalQueue />
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This is where scheduled messages will appear.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This is where sent messages history will appear.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This is where rejected messages will appear.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Leads;
