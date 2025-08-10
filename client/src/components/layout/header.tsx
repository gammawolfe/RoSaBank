import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [, navigate] = useLocation();

  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <h1 className="text-lg font-medium">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
          onClick={() => {
            // In a real app, this would show notifications
            alert("Notifications feature coming soon!");
          }}
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
          onClick={() => navigate("/profile")}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
