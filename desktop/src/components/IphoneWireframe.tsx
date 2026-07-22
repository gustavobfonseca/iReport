export const IphoneWireframe = () => {
  return (
    <div className="relative w-20 h-36 flex items-center justify-center opacity-70">
      <svg viewBox="0 0 120 220" className="w-full h-full">
        {/* Corpo do celular (Visão Frontal) */}
        <rect
          x="4"
          y="4"
          width="112"
          height="212"
          rx="16"
          fill="#151b26"
          stroke="#4a5568"
          strokeWidth="2.5"
        />

        {/* Tela interna */}
        <rect
          x="9"
          y="9"
          width="102"
          height="202"
          rx="12"
          fill="none"
          stroke="#2d3748"
          strokeWidth="1.5"
        />

        {/* Ilha Dinâmica / Notch (Câmera frontal genérica) */}
        <rect x="42" y="14" width="36" height="8" rx="4" fill="#2d3748" />

        {/* Indicador de carregamento / tela (Visual minimalista) */}
        <line
          x1="30"
          y1="200"
          x2="90"
          y2="200"
          stroke="#4a5568"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
