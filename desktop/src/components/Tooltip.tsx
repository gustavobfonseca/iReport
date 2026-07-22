import { HelpCircle } from "lucide-react";
import { useState, useRef } from "react";

interface TooltipProps {
  content: string;
}

const TOOLTIP_HEIGHT_ESTIMATE = 90; // px — estimativa conservadora da altura do balão

export const Tooltip = ({ content }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [flipDown, setFlipDown] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const shouldFlip = spaceAbove < TOOLTIP_HEIGHT_ESTIMATE + 16;

      setFlipDown(shouldFlip);
      setCoords({
        top: shouldFlip ? rect.bottom + 8 : rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  return (
    <div
      ref={triggerRef}
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-indigo-400 transition-colors cursor-help" />

      {isVisible && (
        <div
          className="fixed z-[9999] w-64 p-3 bg-[#1b2330] border border-border-strong rounded-xl shadow-2xl pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform: flipDown ? "translate(-50%, 0)" : "translate(-50%, -100%)",
          }}
        >
          {/* Seta aponta para cima quando tooltip está abaixo, e para baixo quando está acima */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1b2330] border-border-strong rotate-45"
            style={
              flipDown
                ? { top: "-6px", borderTopWidth: "1px", borderLeftWidth: "1px" }
                : { bottom: "-6px", borderBottomWidth: "1px", borderRightWidth: "1px" }
            }
          />
          <p className="relative text-xs font-sans font-medium text-text-secondary leading-relaxed z-10 text-center">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};
