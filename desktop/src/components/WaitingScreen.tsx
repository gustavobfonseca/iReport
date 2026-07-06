import { Smartphone, RefreshCw } from "lucide-react";

interface WaitingScreenProps {
  scanning: boolean;
  scanDevice: () => void;
}

export const WaitingScreen = ({ scanning, scanDevice }: WaitingScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto select-none">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-surface border border-border-md">
        <Smartphone className={`w-7 h-7 transition-colors ${ scanning ? 'text-indigo-400 animate-pulse' : 'text-text-muted' }`} />
        {scanning && (
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-40 border border-indigo-500" />
        )}
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-text-primary">Conecte o Dispositivo</h2>
        <p className="text-xs mt-2 leading-relaxed px-4 text-text-secondary">
          Conecte o iPhone na porta USB. Garanta que o celular está desbloqueado e clicou em{' '}
          <strong className="text-text-primary font-semibold">"Confiar"</strong> na tela do aparelho.
        </p>
      </div>
      <button
        onClick={scanDevice}
        disabled={scanning}
        className="mt-5 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white disabled:opacity-50 active:scale-95 transition-all bg-accent shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_12px_rgba(99,102,241,0.2)]"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
        {scanning ? 'Identificando...' : 'Verificar Dispositivo'}
      </button>
    </div>
  );
};
