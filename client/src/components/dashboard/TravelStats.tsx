import { Card } from "@/components/ui/card";
import { Briefcase, Users, Star, TrendingUp } from "lucide-react";

interface TravelStatsProps {
  stats?: {
    tripsCreated: number;
    buddiesJoined: number;
    reviewsReceived: number;
    trustScore: number;
  };
}

export default function TravelStats({ stats }: TravelStatsProps) {
  const defaultStats = stats || {
    tripsCreated: 0,
    buddiesJoined: 0,
    reviewsReceived: 0,
    trustScore: 0,
  };

  const statItems = [
    {
      label: "Trips Created",
      value: defaultStats.tripsCreated,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Buddies Joined",
      value: defaultStats.buddiesJoined,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Reviews",
      value: defaultStats.reviewsReceived,
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "Trust Score",
      value: `${defaultStats.trustScore}%`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Travel Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-4 border border-border rounded-xl hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>

      {defaultStats.tripsCreated === 0 && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Start creating trips and connecting with travelers to grow your stats! 🚀
          </p>
        </div>
      )}
    </Card>
  );
}
