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
  Activity,
  Loader2,
  AlertTriangle
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
import { useContacts } from "@/hooks/useContacts";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Lead } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGHL } from "@/hooks/useGHL";

const Contacts = () => {
  const { contacts, importContacts, forceImportContacts, searchContacts } = useContacts();
  const { connectionStatus } = useGHL();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[] | null>(null);
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchContacts.mutateAsync(query);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const handleImport = async () => {
    // Reset error state
    setImportError(null);
    
    try {
      // Try normal import first
      if (connectionStatus.data?.connected) {
        await importContacts.mutateAsync();
        toast({
          title: "Contacts imported",
          description: "Contacts have been imported successfully.",
        });
      } else {
        // If not connected, use force import automatically
        console.log("No GHL connection detected, using force import automatically");
        await handleForceImport();
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      
      // Store the error message
      setImportError(error.message || "Failed to import contacts");
      
      // Show the force import dialog
      setShowForceDialog(true);
    }
  };

  const handleForceImport = async () => {
    try {
      await forceImportContacts.mutateAsync();
      setShowForceDialog(false);
      
      toast({
        title: "Contacts imported",
        description: "Demo contacts have been imported successfully.",
      });
    } catch (error) {
      console.error('Error force importing contacts:', error);
      
      toast({
        title: "Error",
        description: "Failed to import demo contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayContacts = searchResults || contacts.data || [];

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => contacts.refetch()}
              disabled={contacts.isFetching}
            >
              {contacts.isFetching ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
            <Button 
              size="sm"
              onClick={handleImport}
              disabled={importContacts.isPending || forceImportContacts.isPending}
            >
              {importContacts.isPending || forceImportContacts.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : !connectionStatus.data?.connected ? (
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
              ) : (
                <Users className="h-4 w-4 mr-1" />
              )}
              {!connectionStatus.data?.connected ? "Import Demo Contacts" : "Import Contacts"}
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex w-full max-w-lg items-center space-x-2">
          <Input 
            placeholder="Search contacts..." 
            className="flex-1"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button 
            type="submit"
            disabled={searchContacts.isPending}
          >
            {searchContacts.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            Search
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
            {contacts.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading contacts...</span>
              </div>
            ) : contacts.isError ? (
              <div className="text-center py-8 text-destructive">
                Error loading contacts. Please try refreshing the page.
              </div>
            ) : displayContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contacts found.
              </div>
            ) : (
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
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
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
                            contact.status === "qualified" 
                              ? "bg-success/20 text-success border-success/30" 
                              : contact.status === "contacted" 
                                ? "bg-warning/20 text-warning border-warning/30"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Activity className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> 
                          <span className="text-sm">
                            {contact.last_activity || 'No activity'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> 
                          <span className="text-sm">
                            {format(new Date(contact.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Force Import Dialog */}
      <Dialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection Error</DialogTitle>
            <DialogDescription>
              There was an error importing contacts from GoHighLevel: 
              <p className="text-destructive mt-2">{importError}</p>
            </DialogDescription>
          </DialogHeader>
          <p className="py-2">
            Would you like to import demo contacts instead? This will create example contacts
            for testing purposes.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowForceDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleForceImport}
              disabled={forceImportContacts.isPending}
            >
              {forceImportContacts.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-1" />
              )}
              Import Demo Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Contacts;
