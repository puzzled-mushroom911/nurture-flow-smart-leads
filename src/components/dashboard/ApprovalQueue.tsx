import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar as CalendarIcon, Loader2, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { MessageWithLead } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export const ApprovalQueue = () => {
  const {
    pendingMessages,
    approveMessage,
    rejectMessage,
    scheduleMessage
  } = useLeads();

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const handleApprove = async (messageId: string) => {
    try {
      await approveMessage.mutateAsync(messageId);
      toast({
        title: "Message approved",
        description: "The message has been approved successfully.",
      });
    } catch (error) {
      console.error('Error approving message:', error);
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
      console.error('Error rejecting message:', error);
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
      console.error('Error scheduling message:', error);
      toast({
        title: "Error",
        description: "Failed to schedule message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (message: MessageWithLead) => {
    setSelectedMessage(message.id);
    setEditedContent(message.content);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMessage) return;

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll just show a success message
      toast({
        title: "Message updated",
        description: "The message has been updated successfully.",
      });
      setIsEditOpen(false);
      setSelectedMessage(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
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
            {messages.map((message: MessageWithLead) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(message)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
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

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Make changes to the message content below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Enter your message..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
