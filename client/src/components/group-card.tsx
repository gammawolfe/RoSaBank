import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import type { GroupWithMembers } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";

interface GroupCardProps {
  group: GroupWithMembers;
}

export function GroupCard({ group }: GroupCardProps) {
  const [, navigate] = useLocation();
  const { formatCurrency } = useCurrency();

  const progressPercent = (group.currentTurnIndex + 1) / group.memberCount * 100;
  
  const getStatusInfo = () => {
    switch (group.userPaymentStatus) {
      case 'paid':
        return {
          color: 'success',
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Paid'
        };
      case 'overdue':
        return {
          color: 'warning',
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Overdue'
        };
      default:
        return {
          color: 'warning',
          icon: <Clock className="h-3 w-3" />,
          text: 'Payment Due'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getPaymentButtonClass = () => {
    switch (group.userPaymentStatus) {
      case 'paid':
        return 'bg-gray-300 text-gray-600 cursor-not-allowed';
      case 'overdue':
        return 'btn-warning';
      default:
        return 'btn-primary';
    }
  };

  const getPaymentButtonText = () => {
    if (group.userPaymentStatus === 'paid') {
      return 'Paid ✓';
    }
    return `Pay ${formatCurrency(group.contributionAmount, group.currency)}`;
  };

  return (
    <Card className="card-shadow overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800">{group.name}</h4>
          <div className="flex items-center">
            <div className={`status-indicator mr-2 ${
              group.userPaymentStatus === 'paid' ? 'status-success' :
              group.userPaymentStatus === 'overdue' ? 'status-warning' : 'status-warning'
            }`} />
            <Badge variant={statusInfo.color as any} className="text-xs">
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.text}</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{group.memberCount} members</span>
          <span>{formatCurrency(group.contributionAmount, group.currency)}/{group.frequency}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Round Progress</span>
            <span>{group.currentTurnIndex + 1}/{group.memberCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Turn Info */}
        <div className={`rounded p-3 mb-3 ${
          group.userPaymentStatus === 'paid' ? 'bg-green-50 dark:bg-green-900/20' :
          group.userPaymentStatus === 'overdue' ? 'bg-orange-50 dark:bg-orange-900/20' :
          'bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              {group.currentTurnMember && (
                <>
                  <div className="text-sm font-medium text-primary">
                    {group.currentTurnMember.fullName === "Demo User" ? "Your turn!" : `${group.currentTurnMember.fullName}'s turn`}
                  </div>
                  <div className="text-xs text-gray-600">
                    {group.currentTurnMember.fullName === "Demo User" 
                      ? `Receiving ${formatCurrency(parseFloat(group.contributionAmount) * group.memberCount, group.currency)}` 
                      : `Collecting ${formatCurrency(parseFloat(group.contributionAmount) * group.memberCount, group.currency)}`
                    }
                  </div>
                </>
              )}
            </div>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            className={`flex-1 text-sm font-medium ${getPaymentButtonClass()}`}
            disabled={group.userPaymentStatus === 'paid'}
            onClick={() => {
              // In a real app, this would handle payment
              alert("Payment processing would be implemented here");
            }}
          >
            {getPaymentButtonText()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
