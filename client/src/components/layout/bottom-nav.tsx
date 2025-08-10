import { useLocation } from "wouter";
import { Home, Users, CreditCard, History, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "groups" | "payments" | "history" | "profile";
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const [, navigate] = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "groups", label: "Groups", icon: Users, path: "/groups" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/payments" },
    { id: "history", label: "History", icon: History, path: "/history" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-white border-t border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className="flex-1 py-2 px-3 text-center"
              onClick={() => navigate(tab.path)}
            >
              <Icon 
                className={`block mx-auto mb-1 h-5 w-5 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`} 
              />
              <span 
                className={`text-xs ${
                  isActive ? "text-primary font-medium" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
