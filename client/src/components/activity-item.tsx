import { CreditCard, Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import type { Activity } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
      case 'payment_made':
        return CreditCard;
      case 'member_joined':
      case 'group_created':
        return Users;
      case 'turn_next':
        return Clock;
      case 'turn_completed':
        return CheckCircle;
      default:
        return TrendingUp;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return 'text-green-600 bg-green-100';
      case 'payment_made':
        return 'text-blue-600 bg-blue-100';
      case 'member_joined':
      case 'group_created':
        return 'text-purple-600 bg-purple-100';
      case 'turn_next':
        return 'text-orange-600 bg-orange-100';
      case 'turn_completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const iconColorClass = getIconColor(activity.type);

  return (
    <div className={`p-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800">{activity.title}</div>
          {activity.description && (
            <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {activity.createdAt 
              ? new Date(activity.createdAt).toLocaleString() 
              : 'Recently'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
