"use client";

import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  active: number;
  completed: number;
  disputed: number;
}

export default function StatsCards({
  active,
  completed,
  disputed,
}: StatsCardsProps) {
  const stats = [
    {
      icon: Clock,
      number: active,
      label: "Active Orders",
      color: "primary",
    },
    {
      icon: CheckCircle,
      number: completed,
      label: "Completed",
      color: "success",
    },
    {
      icon: AlertTriangle,
      number: disputed,
      label: "Disputed",
      color: "warning",
    },
  ] as const;

  const colorClasses = {
    primary: {
      bg: "bg-primary-50",
      text: "text-primary-600",
    },
    success: {
      bg: "bg-success-50",
      text: "text-success-600",
    },
    warning: {
      bg: "bg-warning-50",
      text: "text-warning-600",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[480px] md:max-w-none">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];

        return (
          <div
            key={stat.label}
            className="bg-white border border-[#e5e5e5] rounded-xl p-6 text-center"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-full p-3 mx-auto mb-4 flex items-center justify-center`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Number */}
            <p
              className={`font-space-grotesk text-4xl font-bold ${colors.text} mb-1`}
            >
              {stat.number}
            </p>

            {/* Label */}
            <p className="font-dm-sans text-sm font-medium text-gray-600">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
