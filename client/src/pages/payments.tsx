import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { PaymentWithDetails } from "@shared/schema";

// Demo user ID - in a real app this would come from auth context
const DEMO_USER_ID = "demo-user-1";

export default function Payments() {
  const { data: payments, isLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ['/api/payments', { userId: DEMO_USER_ID }],
    queryFn: async () => {
      const response = await fetch(`/api/payments?userId=${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const totalPaid = payments?.filter(p => p.status === 'completed' && p.type === 'contribution')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      <Header title="Payments" />

      <div className="p-4 pb-20">
        {/* Payment Summary */}
        <Card className="card-shadow mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-800">Payment Summary</h2>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${totalPaid.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingPayments}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Payment History</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg card-shadow p-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : payments?.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-800 mb-2">No Payments Yet</h3>
                <p className="text-sm text-gray-600">
                  Your payment history will appear here once you start making contributions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card key={payment.id} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getStatusIcon(payment.status)}
                          <h4 className="font-medium ml-2">
                            {payment.type === 'contribution' ? 'Contribution' : 'Payout'}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {payment.group.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </div>
                        <Badge variant={getStatusColor(payment.status) as any} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {payment.status === 'pending' && (
                      <Button size="sm" className="w-full mt-3">
                        Complete Payment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="payments" />
    </div>
  );
}
