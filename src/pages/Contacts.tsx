
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  RefreshCw, 
  Users,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  intent: "high" | "medium" | "low";
  lastActivity: string;
  lastContact: string;
}

// Mock data for contacts
const contacts: Contact[] = [
  {
    id: "1",
    name: "Jessica Parker",
    email: "j.parker@example.com",
    phone: "+1 (555) 123-4567",
    intent: "high",
    lastActivity: "Viewed pricing page",
    lastContact: "2 days ago",
  },
  {
    id: "2",
    name: "David Williams",
    email: "d.williams@company.co",
    phone: "+1 (555) 234-5678",
    intent: "medium",
    lastActivity: "Downloaded whitepaper",
    lastContact: "5 days ago",
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex@startupinc.com",
    phone: "+1 (555) 345-6789",
    intent: "high",
    lastActivity: "Booked a demo",
    lastContact: "1 day ago",
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    email: "lisa.r@enterprise.org",
    phone: "+1 (555) 456-7890",
    intent: "low",
    lastActivity: "Opened email",
    lastContact: "1 week ago",
  },
  {
    id: "5",
    name: "Michael Smith",
    email: "michael.smith@bigcorp.com",
    phone: "+1 (555) 567-8901",
    intent: "medium",
    lastActivity: "Visited blog post",
    lastContact: "3 days ago",
  },
];

const Contacts = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
            <p className="text-muted-foreground">
              View and manage your lead contacts
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm">
              <Users className="h-4 w-4 mr-1" /> Import Contacts
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex w-full max-w-lg items-center space-x-2">
          <Input placeholder="Search contacts..." className="flex-1" />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" /> Contact List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center">
                      Name
                      <div className="flex flex-col ml-1">
                        <ChevronUp className="h-3 w-3" />
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 mr-1" /> {contact.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 mr-1" /> {contact.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          contact.intent === "high" 
                            ? "bg-success/20 text-success border-success/30" 
                            : contact.intent === "medium" 
                              ? "bg-warning/20 text-warning border-warning/30"
                              : "bg-muted text-muted-foreground"
                        }
                      >
                        {contact.intent === "high" ? "High Intent" : contact.intent === "medium" ? "Medium Intent" : "Low Intent"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Activity className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> 
                        <span className="text-sm">{contact.lastActivity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> 
                        <span className="text-sm">{contact.lastContact}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Profile</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Contacts;
