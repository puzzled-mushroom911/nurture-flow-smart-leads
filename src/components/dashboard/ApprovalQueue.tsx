import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';

export const ApprovalQueue = () => {
  const {
    pendingMessages,
    approveMessage,
    rejectMessage,
    scheduleMessage
  } = useLeads();

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleApprove = async (messageId: string) => {
    try {
      await approveMessage.mutateAsync(messageId);
      toast({
        title: "Message approved",
        description: "The message has been approved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (messageId: string) => {
    try {
      await rejectMessage.mutateAsync(messageId);
      toast({
        title: "Message rejected",
        description: "The message has been rejected successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = async (messageId: string) => {
    if (!selectedDate) return;

    try {
      await scheduleMessage.mutateAsync({
        messageId,
        scheduledFor: selectedDate
      });
      setSelectedMessage(null);
      setSelectedDate(undefined);
      toast({
        title: "Message scheduled",
        description: `The message has been scheduled for ${format(selectedDate, 'PPP')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (pendingMessages.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
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

  if (pendingMessages.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading messages. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  const messages = pendingMessages.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approval</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages pending approval
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-start justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="font-medium">{message.lead.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {message.lead.email}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-muted-foreground">
                    Created {format(parseISO(message.created_at), 'PPP')}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Popover
                    open={selectedMessage === message.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedMessage(null);
                      } else {
                        setSelectedMessage(message.id);
                        setSelectedDate(undefined);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={scheduleMessage.isPending}
                      >
                        {scheduleMessage.isPending && selectedMessage === message.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CalendarIcon className="h-4 w-4 mr-1" />
                        )}
                        Schedule
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                      <div className="flex justify-end p-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleSchedule(message.id)}
                          disabled={!selectedDate || scheduleMessage.isPending}
                        >
                          {scheduleMessage.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(message.id)}
                    disabled={rejectMessage.isPending}
                  >
                    {rejectMessage.isPending && rejectMessage.variables === message.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(message.id)}
                    disabled={approveMessage.isPending}
                  >
                    {approveMessage.isPending && approveMessage.variables === message.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
