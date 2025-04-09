import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/lib/services/leadService';
import { Lead } from '@/lib/types';
import { format } from 'date-fns';

export function RecentLeads() {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: () => leadService.getLeads(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading leads...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading leads. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentLeads = leads?.slice(0, 5) || [];

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
                    {[lead.first_name, lead.last_name]
                      .filter(Boolean)
                      .map(n => n?.[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown Contact"}
                  </p>
                  <p className="text-xs text-muted-foreground">{lead.email || "No email"}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline"
                  className={
                    lead.status === "qualified" 
                      ? "bg-success/20 text-success border-success/30" 
                      : lead.status === "contacted" 
                        ? "bg-warning/20 text-warning border-warning/30"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Added {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
