import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge?: {
    text: string;
    color: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
}) => {
  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft hover:shadow-soft-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-forest-950 dark:text-cream-50">
            {value}
          </span>
          {badge && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
