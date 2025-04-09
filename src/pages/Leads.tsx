import { MainLayout } from "@/components/layout/MainLayout";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Filter, RefreshCcw, Loader2 } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { MessageWithLead } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Extracted MessageCard component
const MessageCard = ({ message }: { message: MessageWithLead }) => {
  const date = useMemo(() => {
    if (message.status === 'scheduled' && message.scheduled_for) {
      return format(new Date(message.scheduled_for), 'MMM d, yyyy');
    }
    if (message.status === 'sent' && message.sent_at) {
      return format(new Date(message.sent_at), 'MMM d, yyyy');
    }
    return format(new Date(message.updated_at), 'MMM d, yyyy');
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

  const leadName = [message.lead.first_name, message.lead.last_name]
    .filter(Boolean)
    .join(" ") || "Unknown Contact";

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border">
      <div className="space-y-1">
        <div className="font-medium">{leadName}</div>
        <div className="text-sm text-muted-foreground">
          {message.lead.email || "No email"}
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
  emptyMessage,
  isLoading,
  isError
}: { 
  messages: MessageWithLead[] | undefined;
  title: string;
  emptyMessage: string;
  isLoading: boolean;
  isError: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading messages. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {messages?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {messages?.map((message) => (
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
    generateMessages,
    refreshMessages
  } = useLeads();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const messageCounts = useMemo(() => ({
    pending: pendingMessages.data?.length || 0,
    scheduled: scheduledMessages.data?.length || 0,
    sent: sentMessages.data?.length || 0,
    rejected: rejectedMessages.data?.length || 0,
  }), [pendingMessages.data, scheduledMessages.data, sentMessages.data, rejectedMessages.data]);

  const handleGenerateMessages = async () => {
    try {
      await generateMessages.mutateAsync();
      toast({
        title: "Messages generated",
        description: "New messages have been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating messages:', error);
      toast({
        title: "Error",
        description: "Failed to generate messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshMessages.mutateAsync();
      toast({
        title: "Refreshed",
        description: "Messages have been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing messages:', error);
      toast({
        title: "Error",
        description: "Failed to refresh messages. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMessages.isPending}
            >
              {refreshMessages.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
            <Button 
              size="sm"
              onClick={handleGenerateMessages}
              disabled={generateMessages.isPending}
            >
              {generateMessages.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-1" />
              )}
              Generate Messages
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        )}

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
              isLoading={scheduledMessages.isLoading}
              isError={scheduledMessages.isError}
            />
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
            <MessagesList
              messages={sentMessages.data}
              title="Sent Messages"
              emptyMessage="No sent messages"
              isLoading={sentMessages.isLoading}
              isError={sentMessages.isError}
            />
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            <MessagesList
              messages={rejectedMessages.data}
              title="Rejected Messages"
              emptyMessage="No rejected messages"
              isLoading={rejectedMessages.isLoading}
              isError={rejectedMessages.isError}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Leads;
