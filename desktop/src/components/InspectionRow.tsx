import { Check, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { TOOLTIPS_DICTIONARY } from "../constants/tooltipsDictionary";

export type RowStatus = "conforme" | "atencao" | "critico" | "info";

interface InspectionRowProps {
  title: string;
  value: string;
  status: RowStatus;
  tooltipKey: string;
  isDealbreaker?: boolean;
}

const getTooltipText = (key: string): string => {
  const parts = key.split(".");
  let current: unknown = TOOLTIPS_DICTIONARY;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return "";
    }
  }
  return typeof current === "string" ? current : "";
};

export const InspectionRow = ({
  title,
  value,
  status,
  tooltipKey,
  isDealbreaker,
}: InspectionRowProps) => {
  const isDanger = status === "critico";
  const isWarning = status === "atencao";
  const isSuccess = status === "conforme";

  const baseBg = isDanger ? "bg-status-red/5" : isWarning ? "bg-status-orange/5" : "bg-surface/30";
  const hoverBg = isDanger
    ? "hover:bg-status-red/10"
    : isWarning
      ? "hover:bg-status-orange/10"
      : "hover:bg-elevated";
  const borderLeft = isDanger
    ? "border-l-4 border-l-status-red"
    : isWarning
      ? "border-l-4 border-l-status-orange"
      : "border-l-4 border-transparent";

  const tooltipText = getTooltipText(tooltipKey);

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-border-subtle transition-all ${baseBg} ${hoverBg} ${borderLeft}`}
    >
      <div className="flex items-center gap-3 w-1/3">
        {isDealbreaker && isDanger ? (
          <ShieldAlert className="w-4 h-4 text-status-red shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0" /> // Spacer
        )}
        <span
          className={`text-sm font-sans font-bold tracking-tight ${isDanger ? "text-status-red" : isWarning ? "text-status-orange" : "text-text-primary"}`}
        >
          {title}
        </span>
        {tooltipText && <Tooltip content={tooltipText} />}
      </div>

      <div className="flex-1 flex items-center">
        <span className="text-text-muted font-mono font-bold mr-3">&gt;</span>
        <span
          className={`text-sm font-mono ${isDanger ? "text-status-red font-bold" : "text-text-primary font-medium"}`}
        >
          {value}
        </span>
      </div>

      <div className="w-32 flex justify-end shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-mono font-black uppercase tracking-wider ${
            isDanger
              ? "bg-bg-red border-border-red text-status-red shadow-[0_0_10px_rgba(239,68,68,0.15)]"
              : isWarning
                ? "bg-bg-orange border-border-orange text-status-orange"
                : isSuccess
                  ? "bg-bg-green border-border-green text-status-green"
                  : "bg-[#1b1b1f] border-[#313136] text-text-muted"
          }`}
        >
          {isDanger ? (
            <X className="w-3 h-3" />
          ) : isWarning ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          <span className="opacity-30">|</span>
          {status}
        </span>
      </div>
    </div>
  );
};
