import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, DollarSign, Calendar, CheckCircle, Clock, User } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/hooks/use-currency";
import type { GroupWithMembers } from "@shared/schema";

export default function GroupDetails() {
  const [, params] = useRoute("/groups/:id");
  const [, navigate] = useLocation();
  const { formatCurrency } = useCurrency();
  const groupId = params?.id;

  const { data: group, isLoading } = useQuery<GroupWithMembers>({
    queryKey: ['/api/groups', groupId],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      return response.json();
    },
    enabled: !!groupId
  });

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="bg-primary h-6" />
        <header className="bg-primary text-white px-4 py-3 flex items-center">
          <ArrowLeft 
            className="h-6 w-6 mr-3 cursor-pointer" 
            onClick={() => navigate("/groups")}
          />
          <div className="h-4 bg-white/30 rounded animate-pulse w-32" />
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg card-shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mobile-container">
        <div className="bg-primary h-6" />
        <header className="bg-primary text-white px-4 py-3 flex items-center">
          <ArrowLeft 
            className="h-6 w-6 mr-3 cursor-pointer" 
            onClick={() => navigate("/groups")}
          />
          <h1 className="text-lg font-medium">Group Not Found</h1>
        </header>
        <div className="p-4">
          <Card className="card-shadow">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">The requested group could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercent = (group.currentTurnIndex + 1) / group.memberCount * 100;
  
  const getStatusColor = (memberIndex: number) => {
    if (memberIndex < group.currentTurnIndex) return "text-green-600";
    if (memberIndex === group.currentTurnIndex) return "text-primary";
    return "text-blue-600";
  };

  const getStatusIcon = (memberIndex: number) => {
    if (memberIndex < group.currentTurnIndex) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (memberIndex === group.currentTurnIndex) return <Clock className="h-5 w-5 text-primary" />;
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = (memberIndex: number) => {
    if (memberIndex < group.currentTurnIndex) return "Completed";
    if (memberIndex === group.currentTurnIndex) return "Current Turn";
    return "Upcoming";
  };

  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 flex items-center">
        <ArrowLeft 
          className="h-6 w-6 mr-3 cursor-pointer" 
          onClick={() => navigate("/groups")}
        />
        <h1 className="text-lg font-medium">{group.name}</h1>
      </header>

      <div className="p-4 pb-20">
        {/* Group Summary */}
        <Card className="card-shadow mb-4">
          <CardContent className="pt-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-medium mb-1">{group.name}</h2>
              {group.description && (
                <p className="text-gray-600 text-sm">{group.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{group.memberCount}</div>
                <div className="text-xs text-gray-600">Members</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">${group.contributionAmount}</div>
                <div className="text-xs text-gray-600 capitalize">{group.frequency}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {group.currentTurnIndex + 1}/{group.memberCount}
                </div>
                <div className="text-xs text-gray-600">Round</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Round Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Turn Rotation */}
        <Card className="card-shadow mb-4">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">Turn Rotation</h3>
            <div className="space-y-3">
              {group.members.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index < group.currentTurnIndex ? 'bg-green-500' :
                      index === group.currentTurnIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      <span className="text-sm font-medium text-white">{member.turnOrder}</span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {member.user.fullName}
                        {member.isAdmin && (
                          <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                        )}
                      </div>
                      <div className={`text-xs ${getStatusColor(index)}`}>
                        {getStatusText(index)}
                      </div>
                    </div>
                  </div>
                  {getStatusIcon(index)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Turn Info */}
        {group.currentTurnMember && (
          <Card className="card-shadow mb-4">
            <CardContent className="pt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-primary">
                      Current Turn: {group.currentTurnMember.fullName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Collecting ${(parseFloat(group.contributionAmount) * group.memberCount).toFixed(2)} this round
                    </div>
                  </div>
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Stats */}
        <Card className="card-shadow">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-3">Group Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-lg font-bold text-green-600">${group.totalPaid.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Total Collected</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-600">{group.currentRound}</div>
                <div className="text-xs text-gray-600">Current Round</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
