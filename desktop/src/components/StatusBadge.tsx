import { RowStatus } from "../types/device";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: RowStatus;
  label: string;
}

export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  switch (status) {
    case 'success':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[10px] font-semibold tracking-[0.15px] uppercase whitespace-nowrap bg-bg-green text-status-green border border-border-green">
          <CheckCircle2 className="w-3 h-3" />
          {label || 'Aprovado'}
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[10px] font-semibold tracking-[0.15px] uppercase whitespace-nowrap bg-bg-orange text-status-orange border border-border-orange">
          <AlertCircle className="w-3 h-3" />
          {label || 'Atenção'}
        </span>
      );
    case 'danger':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[10px] font-semibold tracking-[0.15px] uppercase whitespace-nowrap bg-bg-red text-status-red border border-border-red">
          <XCircle className="w-3 h-3" />
          {label || 'Falhou'}
        </span>
      );
    default:
      return null;
  }
};
