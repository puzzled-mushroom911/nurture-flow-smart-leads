
import { useState } from "react";
import { Check, X, MessageSquare, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalItem {
  id: string;
  leadName: string;
  messagePreview: string;
  timestamp: string;
  status: ApprovalStatus;
}

// Mock data for approval items
const initialApprovals: ApprovalItem[] = [
  {
    id: "1",
    leadName: "Sarah Johnson",
    messagePreview: "Thank you for your interest in our premium plan! Based on your recent website activity...",
    timestamp: "10 minutes ago",
    status: "pending",
  },
  {
    id: "2",
    leadName: "Michael Chen",
    messagePreview: "I noticed you've been exploring our analytics features. Would you like me to show you...",
    timestamp: "25 minutes ago",
    status: "pending",
  },
  {
    id: "3",
    leadName: "Emma Williams",
    messagePreview: "Your free trial is ending soon. I'd love to discuss how our enterprise features could help...",
    timestamp: "45 minutes ago",
    status: "pending",
  },
  {
    id: "4",
    leadName: "James Rodriguez",
    messagePreview: "Based on your recent questions about integrations, I thought I'd share how our API...",
    timestamp: "1 hour ago", 
    status: "pending",
  },
];

export function ApprovalQueue() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);

  const handleAction = (id: string, action: "approve" | "reject") => {
    setApprovals(
      approvals.map((item) =>
        item.id === id
          ? { ...item, status: action === "approve" ? "approved" : "rejected" }
          : item
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Pending Approvals</span>
          <Badge variant="outline">{approvals.filter(a => a.status === "pending").length} Pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        {approvals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages waiting for approval
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-lg p-4 ${
                  item.status === "pending" 
                    ? "border-warning/50" 
                    : item.status === "approved" 
                      ? "border-success/50 bg-success/5"
                      : "border-destructive/50 bg-destructive/5"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.leadName}</h4>
                    <div className="text-xs text-muted-foreground">{item.timestamp}</div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.status === "pending" 
                        ? "bg-warning/20 text-warning border-warning/30" 
                        : item.status === "approved" 
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-destructive/20 text-destructive border-destructive/30"
                    }
                  >
                    {item.status === "pending" ? "Needs Review" : item.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                </div>
                <p className="text-sm mt-2 line-clamp-2">{item.messagePreview}</p>
                
                {item.status === "pending" && (
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-success border-success/30 hover:bg-success/10"
                      onClick={() => handleAction(item.id, "approve")}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-muted hover:bg-accent/10"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleAction(item.id, "reject")}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                
                {item.status !== "pending" && (
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
