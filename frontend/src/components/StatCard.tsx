import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = "text-blue-400", iconBg = "bg-blue-900/30", sub }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
          </div>
          <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
