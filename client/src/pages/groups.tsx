import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { GroupCard } from "@/components/group-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import type { GroupWithMembers } from "@shared/schema";

// Demo user ID - in a real app this would come from auth context
const DEMO_USER_ID = "demo-user-1";

export default function Groups() {
  const [, navigate] = useLocation();

  const { data: groups, isLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ['/api/groups', { userId: DEMO_USER_ID }],
    queryFn: async () => {
      const response = await fetch(`/api/groups?userId=${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      return response.json();
    }
  });

  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      <Header title="My Groups" />

      <div className="p-4">
        {/* Create Group Button */}
        <Button
          onClick={() => navigate("/create-group")}
          className="w-full mb-4 btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Group
        </Button>

        {isLoading ? (
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
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Groups Yet</h3>
              <p className="text-gray-600 mb-6">
                Start your savings journey by creating your first group or joining an existing one.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/create-group")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would open a join group dialog or form
                    alert("Join group feature coming soon!");
                  }}
                >
                  Join Existing Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-800 mb-1">
                Active Groups ({groups.length})
              </h2>
              <p className="text-sm text-gray-600">
                Manage your savings circles and contributions
              </p>
            </div>

            <div className="space-y-3 pb-20">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab="groups" />
    </div>
  );
}
