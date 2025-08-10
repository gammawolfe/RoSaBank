import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Settings, HelpCircle, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="mobile-container">
        <div className="bg-primary h-6" />
        <Header title="Profile" />
        <div className="p-4">
          <div className="text-center">
            <p className="text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      <Header title="Profile" />

      <div className="p-4 pb-20">
        {/* User Info Card */}
        <Card className="card-shadow mb-4">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </h2>
              <p className="text-gray-600">{user.email || 'No email'}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-gray-600">{user.email || 'No email provided'}</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Account Status</div>
                  <div className="text-sm text-green-600">Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <Card className="card-shadow mb-4">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Settings</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              <button className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Settings className="h-5 w-5 text-gray-500 mr-3" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Account Settings</div>
                  <div className="text-xs text-gray-600">Manage your account preferences</div>
                </div>
              </button>
              
              <button className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <HelpCircle className="h-5 w-5 text-gray-500 mr-3" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Help & Support</div>
                  <div className="text-xs text-gray-600">Get help and contact support</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-800 mb-4">Account Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  // In a real app, this would handle logout
                  alert("Logout functionality would be implemented here");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>RotaSave v1.0.0</p>
          <p>© 2024 RotaSave. All rights reserved.</p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
