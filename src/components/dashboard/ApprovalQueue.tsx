import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export const ApprovalQueue = () => {
  const {
    pendingMessages,
    approveMessage,
    rejectMessage,
    scheduleMessage
  } = useLeads();

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  if (pendingMessages.isLoading) {
    return <div>Loading...</div>;
  }

  if (pendingMessages.isError) {
    return <div>Error loading messages</div>;
  }

  const messages = pendingMessages.data || [];

  const handleSchedule = (messageId: string) => {
    if (selectedDate) {
      scheduleMessage.mutate({
        messageId,
        scheduledFor: selectedDate
      });
      setSelectedMessage(null);
      setSelectedDate(undefined);
    }
  };

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
                    Created {format(new Date(message.createdAt), 'MMM d, yyyy')}
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
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end" role="dialog">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => {
                          // Disable past dates
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
                          Confirm
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectMessage.mutate(message.id)}
                    disabled={rejectMessage.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approveMessage.mutate(message.id)}
                    disabled={approveMessage.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
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
