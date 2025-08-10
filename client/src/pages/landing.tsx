import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Users, TrendingUp, Shield, Globe, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="bg-primary h-6" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white px-6 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PiggyBank className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">RotaSave</h1>
          <p className="text-lg mb-8 opacity-90">
            Join rotating savings groups with friends and family. Save together, reach your goals faster.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-medium px-8"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Why Choose RotaSave?
        </h2>
        
        <div className="grid gap-4">
          <Card className="card-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">Social Savings</h3>
                  <p className="text-sm text-gray-600">
                    Create or join savings groups with people you trust. Make saving a shared journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">Smart Rotation</h3>
                  <p className="text-sm text-gray-600">
                    Automated turn management ensures everyone gets their payout fairly and on time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">Secure Wallets</h3>
                  <p className="text-sm text-gray-600">
                    Integrated wallet system keeps your funds safe and tracks all transactions transparently.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">Multi-Currency</h3>
                  <p className="text-sm text-gray-600">
                    Support for 10 major currencies including USD, EUR, GBP, and more.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">Easy Setup</h3>
                  <p className="text-sm text-gray-600">
                    Create your first savings group in minutes. Invite friends and start saving today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 pb-4">
          <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Ready to start saving?
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Join thousands of users who are reaching their financial goals together.
              </p>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/api/login'}
              >
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}