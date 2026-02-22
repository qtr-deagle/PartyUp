import { Card } from "@/components/ui/card";
import { Plus, Search, Car, MapPin } from "lucide-react";
import { Link } from "wouter";

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
}

export default function QuickActionCards() {
  const actions: QuickAction[] = [
    {
      id: "create-trip",
      title: "Create Trip",
      icon: Plus,
      href: "/post-ride",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: "find-buddy",
      title: "Find Buddy",
      icon: Search,
      href: "/match",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: "carpool",
      title: "Offer Carpool",
      icon: Car,
      href: "/carpooling",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: "explore",
      title: "Explore Map",
      icon: MapPin,
      href: "/map",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.id} href={action.href}>
            <Card className="p-6 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
              <div
                className={`w-12 h-12 rounded-xl ${action.bgColor} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h3>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
