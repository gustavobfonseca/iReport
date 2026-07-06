export const IphoneWireframe = () => {
  return (
    <div className="relative w-20 h-36 flex items-center justify-center opacity-85">
      <svg viewBox="0 0 120 220" className="w-full h-full">
        {/* Borda externa / Frame do iPhone */}
        <rect x="2" y="2" width="116" height="216" rx="18" fill="none" stroke="#666" strokeWidth="2.5" />
        
        {/* Câmera Traseira Genérica (Outline) */}
        <g transform="translate(10, 10)">
          {/* Vidro da câmera */}
          <rect x="0" y="0" width="38" height="38" rx="8" fill="none" stroke="#555" strokeWidth="1.5" />
          
          {/* Câmeras Padrão */}
          <circle cx="11" cy="11" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
          <circle cx="27" cy="19" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
          <circle cx="11" cy="27" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
          
          {/* LiDAR + Flash */}
          <circle cx="27" cy="7" r="2" fill="none" stroke="#555" strokeWidth="1" />
          <circle cx="27" cy="29" r="1.5" fill="none" stroke="#555" strokeWidth="1" />
        </g>

        {/* Logo Apple (Outline) */}
        <g transform="translate(60, 110) scale(0.6)">
          <path
            d="M-6.5,-10 C-6,-15 -2,-17 2,-16 C4.5,-15.5 7.5,-12.5 7.5,-9 C7.5,-6 6.5,-3 8,-0.5 C9.5,2 10.5,5 9,8 C7.5,11 4,14 1.5,14 C-1,14 -2.5,12.5 -5.5,12.5 C-8.5,12.5 -10.5,14.5 -12.5,14.5 C-15,14.5 -18,11.5 -19.5,8 C-21,-4.5 -15.5,-10 -11,-10 C-9,-10 -7.5,-9 -6.5,-10 Z"
            fill="none"
            stroke="#555"
            strokeWidth="2"
          />
          <path
            d="M0,-17.5 C1.5,-21 4.5,-23 7.5,-22.5 C7.5,-19.5 5.5,-16.5 3,-15.5 C1.5,-15 0,-16.5 0,-17.5 Z"
            fill="none"
            stroke="#555"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
};
