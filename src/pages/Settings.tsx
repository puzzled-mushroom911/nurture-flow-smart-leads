
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  Key,
  MessageSquare,
  User
} from "lucide-react";

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account and configuration
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" defaultValue="Admin User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" defaultValue="admin@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your company name" defaultValue="AI Lead Nurture Inc." />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ghl-key">GoHighLevel API Key</Label>
                  <div className="flex space-x-2">
                    <Input id="ghl-key" type="password" value="••••••••••••••••••••••••" readOnly className="flex-1" />
                    <Button variant="outline">Reveal</Button>
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex space-x-2">
                    <Input id="openai-key" type="password" value="••••••••••••••••••••••••" readOnly className="flex-1" />
                    <Button variant="outline">Reveal</Button>
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Webhook URL</h4>
                      <p className="text-sm text-muted-foreground">For GoHighLevel integration</p>
                    </div>
                    <Button variant="outline" size="sm">Copy</Button>
                  </div>
                  <Input value="https://api.nurtureflow.app/webhook/ghl" readOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Settings</CardTitle>
                <CardDescription>Configure AI-generated message behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Message Default Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-length">Maximum Message Length</Label>
                      <Input id="max-length" type="number" defaultValue="500" />
                      <p className="text-xs text-muted-foreground mt-1">Characters per message</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tone">Default Message Tone</Label>
                      <select id="tone" className="w-full h-10 px-3 border rounded-md">
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Casual</option>
                        <option>Formal</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Approval Workflow</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="require-approval">Require approval for all messages</Label>
                        <p className="text-sm text-muted-foreground">Messages won't be sent without approval</p>
                      </div>
                      <Switch id="require-approval" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-approve">Auto-approve low-risk messages</Label>
                        <p className="text-sm text-muted-foreground">Standard follow-ups may be sent automatically</p>
                      </div>
                      <Switch id="auto-approve" />
                    </div>
                  </div>
                </div>
                
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your subscription and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Current Plan</h4>
                      <p className="text-sm text-muted-foreground">Pro Plan</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly base fee</span>
                      <span className="font-medium">$99.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Message credits (1,000)</span>
                      <span className="font-medium">$29.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Analysis credits (500)</span>
                      <span className="font-medium">$19.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total per month</span>
                      <span>$147.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Usage This Month</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Message Credits</span>
                        <span>412 / 1,000</span>
                      </div>
                      <div className="bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '41%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analysis Credits</span>
                        <span>287 / 500</span>
                      </div>
                      <div className="bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '57%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button>Upgrade Plan</Button>
                  <Button variant="outline">Billing History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-approvals">Message approval requests</Label>
                        <p className="text-sm text-muted-foreground">Get notified when messages need approval</p>
                      </div>
                      <Switch id="email-approvals" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-leads">New lead alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about high-intent leads</p>
                      </div>
                      <Switch id="email-leads" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-usage">Usage reports</Label>
                        <p className="text-sm text-muted-foreground">Weekly summary of your account usage</p>
                      </div>
                      <Switch id="email-usage" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">In-App Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-approvals">Message approval requests</Label>
                        <p className="text-sm text-muted-foreground">Show notifications for pending approvals</p>
                      </div>
                      <Switch id="app-approvals" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-leads">Lead activity alerts</Label>
                        <p className="text-sm text-muted-foreground">Show notifications for important lead activities</p>
                      </div>
                      <Switch id="app-leads" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-system">System notifications</Label>
                        <p className="text-sm text-muted-foreground">Updates and important system messages</p>
                      </div>
                      <Switch id="app-system" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
