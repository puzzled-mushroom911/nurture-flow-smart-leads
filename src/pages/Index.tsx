
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { KnowledgeStatus } from "@/components/dashboard/KnowledgeStatus";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { BarChart3, MessageSquare, Users, FileText } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your lead nurturing effectiveness and approval workflow
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Leads" 
            value="1,204"
            description="Active contacts"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard 
            title="Messages Generated" 
            value="4,805"
            description="This month"
            icon={<MessageSquare className="h-5 w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatsCard 
            title="Pending Approvals" 
            value="12" 
            description="Waiting for review"
            icon={<FileText className="h-5 w-5" />}
          />
          <StatsCard 
            title="Usage" 
            value="68%"
            description="Of monthly allowance"
            icon={<BarChart3 className="h-5 w-5" />}
            trend={{ value: 3, positive: false }}
          />
        </div>
        
        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <ApprovalQueue />
            <KnowledgeStatus />
          </div>
          <div className="space-y-4">
            <UsageChart />
            <RecentLeads />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
