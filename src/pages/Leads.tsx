import { MainLayout } from "@/components/layout/MainLayout";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Filter, RefreshCcw } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { useMemo } from "react";
import { MessageWithLead } from "@/lib/types";

// Extracted MessageCard component
const MessageCard = ({ message }: { message: MessageWithLead }) => {
  const date = useMemo(() => {
    if (message.status === 'scheduled' && message.scheduledFor) {
      return format(new Date(message.scheduledFor), 'MMM d, yyyy');
    }
    if (message.status === 'sent' && message.sentAt) {
      return format(new Date(message.sentAt), 'MMM d, yyyy');
    }
    return format(new Date(message.updatedAt), 'MMM d, yyyy');
  }, [message]);

  const statusText = useMemo(() => {
    switch (message.status) {
      case 'scheduled':
        return 'Scheduled for';
      case 'sent':
        return 'Sent';
      case 'rejected':
        return 'Rejected';
      default:
        return '';
    }
  }, [message.status]);

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border">
      <div className="space-y-1">
        <div className="font-medium">{message.lead.name}</div>
        <div className="text-sm text-muted-foreground">
          {message.lead.email}
        </div>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs text-muted-foreground">
          {statusText} {date}
        </div>
      </div>
    </div>
  );
};

// Extracted MessagesList component
const MessagesList = ({ 
  messages, 
  title,
  emptyMessage 
}: { 
  messages: MessageWithLead[] | undefined;
  title: string;
  emptyMessage: string;
}) => {
  if (!messages) return <div>Loading...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Leads = () => {
  const {
    pendingMessages,
    scheduledMessages,
    sentMessages,
    rejectedMessages,
  } = useLeads();

  const messageCounts = useMemo(() => ({
    pending: pendingMessages.data?.length || 0,
    scheduled: scheduledMessages.data?.length || 0,
    sent: sentMessages.data?.length || 0,
    rejected: rejectedMessages.data?.length || 0,
  }), [pendingMessages.data, scheduledMessages.data, sentMessages.data, rejectedMessages.data]);

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
            <TabsTrigger value="pending">
              Pending Approval ({messageCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({messageCounts.scheduled})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({messageCounts.sent})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({messageCounts.rejected})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <ApprovalQueue />
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            <MessagesList
              messages={scheduledMessages.data}
              title="Scheduled Messages"
              emptyMessage="No scheduled messages"
            />
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
            <MessagesList
              messages={sentMessages.data}
              title="Sent Messages"
              emptyMessage="No sent messages"
            />
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            <MessagesList
              messages={rejectedMessages.data}
              title="Rejected Messages"
              emptyMessage="No rejected messages"
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Leads;
