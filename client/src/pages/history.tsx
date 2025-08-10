import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { ActivityItem } from "@/components/activity-item";
import { Card, CardContent } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";
import type { Activity } from "@shared/schema";

// Demo user ID - in a real app this would come from auth context
const DEMO_USER_ID = "demo-user-1";

export default function History() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { userId: DEMO_USER_ID }],
    queryFn: async () => {
      const response = await fetch(`/api/activities?userId=${DEMO_USER_ID}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      <Header title="Activity History" />

      <div className="p-4 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg card-shadow p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="pt-6 text-center">
              <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-800 mb-2">No Activity Yet</h3>
              <p className="text-sm text-gray-600">
                Your activity history will appear here as you interact with your savings groups.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-medium text-gray-800">
                  Recent Activity ({activities.length})
                </h2>
              </div>
              {activities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === activities.length - 1}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav activeTab="history" />
    </div>
  );
}
