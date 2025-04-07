
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: "high" | "medium" | "low";
  lastActivity: string;
}

// Mock data for recent leads
const recentLeads: Lead[] = [
  {
    id: "1",
    name: "Jessica Parker",
    email: "j.parker@example.com",
    status: "high",
    lastActivity: "Viewed pricing page",
  },
  {
    id: "2",
    name: "David Williams",
    email: "d.williams@company.co",
    status: "medium",
    lastActivity: "Downloaded whitepaper",
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex@startupinc.com",
    status: "high",
    lastActivity: "Booked a demo",
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    email: "lisa.r@enterprise.org",
    status: "low",
    lastActivity: "Opened email",
  },
];

export function RecentLeads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Leads</span>
          <Badge variant="outline">New Activity</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-muted">
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline"
                  className={
                    lead.status === "high" 
                      ? "bg-success/20 text-success border-success/30" 
                      : lead.status === "medium" 
                        ? "bg-warning/20 text-warning border-warning/30"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {lead.status === "high" ? "High Intent" : lead.status === "medium" ? "Medium Intent" : "Low Intent"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{lead.lastActivity}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
