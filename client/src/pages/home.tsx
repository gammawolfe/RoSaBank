import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { GroupCard } from "@/components/group-card";
import { ActivityItem } from "@/components/activity-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Users, Plus, CreditCard, TrendingUp } from "lucide-react";
import type { GroupWithMembers, Activity } from "@shared/schema";

// Demo user ID - in a real app this would come from auth context
const DEMO_USER_ID = "demo-user-1";

export default function Home() {
  const [, navigate] = useLocation();

  const { data: groups, isLoading: groupsLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ['/api/groups', { userId: DEMO_USER_ID }],
    queryFn: async () => {
      const response = await fetch(`/api/groups?userId=${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      return response.json();
    }
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { userId: DEMO_USER_ID }],
    queryFn: async () => {
      const response = await fetch(`/api/activities?userId=${DEMO_USER_ID}&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  const totalSaved = groups?.reduce((sum, group) => sum + group.totalPaid, 0) || 0;

  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      <Header title="RotaSave" />

      {/* Dashboard Summary Card */}
      <div className="p-4">
        <Card className="card-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-800">My Dashboard</h2>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {groups?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Groups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  ${totalSaved.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Groups List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-800">My Groups</h3>
          <Button 
            variant="ghost" 
            className="text-primary text-sm font-medium"
            onClick={() => navigate("/groups")}
          >
            View All
          </Button>
        </div>

        {groupsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg card-shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : groups?.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-800 mb-2">No Groups Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create or join your first savings group to get started
              </p>
              <Button onClick={() => navigate("/create-group")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groups?.slice(0, 3).map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 card-shadow"
            onClick={() => navigate("/create-group")}
          >
            <Plus className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">Create Group</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2 card-shadow"
            onClick={() => navigate("/groups")}
          >
            <Users className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">Join Group</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 pb-20">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Activity</h3>
        <Card className="card-shadow">
          <CardContent className="p-0">
            {activities?.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-500 text-sm">No recent activity</div>
              </div>
            ) : (
              activities?.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === activities.length - 1}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full fab"
        onClick={() => navigate("/payments")}
      >
        <CreditCard className="h-6 w-6" />
      </Button>

      <BottomNav activeTab="home" />
    </div>
  );
}
