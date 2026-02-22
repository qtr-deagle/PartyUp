import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface TrustSafetyProps {
  trustData?: {
    trustLevel: number;
    isVerified: boolean;
    reviewsCount: number;
    verificationBadges: string[];
  };
}

export default function TrustSafety({ trustData }: TrustSafetyProps) {
  const defaultData = trustData || {
    trustLevel: 0,
    isVerified: false,
    reviewsCount: 0,
    verificationBadges: [],
  };

  const getTrustColor = (level: number) => {
    if (level >= 80) return "text-accent dark:text-accent";
    if (level >= 60) return "text-primary dark:text-primary";
    if (level >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getTrustBgColor = (level: number) => {
    if (level >= 80) return "bg-accent/10 dark:bg-accent/20";
    if (level >= 60) return "bg-primary/10 dark:bg-primary/20";
    if (level >= 40) return "bg-yellow-100/30 dark:bg-yellow-900/30";
    return "bg-orange-100/30 dark:bg-orange-900/30";
  };

  const getTrustLabel = (level: number) => {
    if (level >= 80) return "Excellent";
    if (level >= 60) return "Good";
    if (level >= 40) return "Fair";
    return "Building";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Trust & Safety
        </h2>
        {defaultData.isVerified && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      {/* Trust Level Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-3">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted opacity-20"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - defaultData.trustLevel / 100)}`}
              className={getTrustColor(defaultData.trustLevel)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-3xl font-bold ${getTrustColor(defaultData.trustLevel)}`}>
              {defaultData.trustLevel}%
            </p>
            <p className="text-xs text-muted-foreground">{getTrustLabel(defaultData.trustLevel)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-foreground">Reviews</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{defaultData.reviewsCount}</span>
        </div>

        {defaultData.verificationBadges.length > 0 && (
          <div className="p-3 bg-background/50 rounded-lg">
            <p className="text-sm text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Verifications
            </p>
            <div className="flex flex-wrap gap-2">
              {defaultData.verificationBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <Link href="/trusted-circle">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold transition-all duration-300 hover:shadow-md group">
          <span className="flex-1">Improve Trust Score</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>

      {defaultData.trustLevel < 50 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Complete your profile and get verified to increase your trust score
        </p>
      )}
    </Card>
  );
}
