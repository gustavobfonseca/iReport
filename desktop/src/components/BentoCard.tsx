import { ReactNode } from "react";

interface BentoCardProps {
  title: string;
  icon: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

export const BentoCard = ({ title, icon, badge, children }: BentoCardProps) => {
  return (
    <div className="p-5 rounded-xl bg-surface border border-border-strong hover:border-text-muted transition-colors flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
          {icon} {title}
        </span>
        {badge}
      </div>
      {children}
    </div>
  );
};
