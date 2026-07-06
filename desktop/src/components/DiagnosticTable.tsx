import { TableRow, DataRow } from "../types/device";
import { Check, X, AlertTriangle, HelpCircle } from "lucide-react";

interface DiagnosticTableProps {
  rows: TableRow[];
}

export const DiagnosticTable = ({ rows }: DiagnosticTableProps) => {
  const countSectionRows = (sectionName: string) => {
    let count = 0;
    let activeSection = "";
    for (const r of rows) {
      if ('section' in r) {
        activeSection = r.section;
      } else if (activeSection === sectionName) {
        count++;
      }
    }
    return `${count} ${count === 1 ? 'VETOR' : 'VETORES'} ESCANEADO${count === 1 ? '' : 'S'}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-base p-6 md:p-8">
      <div className="w-full bg-surface border border-border-strong rounded-2xl overflow-x-auto shadow-lg">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-20 bg-[#1c2431] border-b border-border-strong shadow-sm">
            <tr>
              <th className="py-4 px-6 font-sans text-[11px] font-bold tracking-widest uppercase text-text-primary w-[320px]">
                Item Inspecionado
              </th>
              <th className="py-4 px-6 font-sans text-[11px] font-bold tracking-widest uppercase text-text-primary min-w-[320px]">
                Leitura do Sistema
              </th>
              <th className="py-4 px-6 font-sans text-[11px] font-bold tracking-widest uppercase text-text-primary">
                Resultado da Inspeção
              </th>
            </tr>
          </thead>
          <tbody className="bg-base divide-y divide-border-subtle">
            {rows.map((row, i) => {
              if ('section' in row) {
                return (
                  <tr key={`section-${i}`} className="bg-[#121215]/40">
                    <td colSpan={3} className="pt-8 pb-3 px-6">
                      <div className="flex justify-between items-center text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted">
                        <span>{row.section === "Segurança e Contas" ? "VERIFICAÇÕES CRÍTICAS DO SISTEMA" : row.section}</span>
                        <span className="text-[10px] font-mono text-text-muted/70">
                          {countSectionRows(row.section)}
                        </span>
                      </div>
                      <div className="h-[1px] bg-border-subtle/50 w-full mt-2" />
                    </td>
                  </tr>
                );
              }
              
              const dataRow = row as DataRow;
              const ItemIcon = dataRow.icon;
              const isDanger = dataRow.status === 'danger';
              const isWarning = dataRow.status === 'warning';
              const isInfo = dataRow.status === 'info';
              
              // Filosofia "Quiet Dark Cockpit" no modo técnico:
              // Sempre destacamos falhas (vermelho) e alertas (laranja).
              // Componentes conformes (success/info) ficam totalmente neutros e escuros para não poluir a tela.
              const highlightDanger = isDanger;
              const highlightWarning = isWarning;
              const highlightInfo = isInfo;

              // Zebra Striping & Status Backgrounds
              const baseBg = highlightDanger ? 'bg-status-red/5' : highlightWarning ? 'bg-status-orange/5' : highlightInfo ? 'bg-surface/10' : i % 2 === 0 ? 'bg-surface/30' : 'bg-base';
              const hoverBg = highlightDanger ? 'hover:bg-status-red/10' : highlightWarning ? 'hover:bg-status-orange/10' : 'hover:bg-elevated';

              return (
                <tr key={i} className={`transition-all duration-200 group ${baseBg} ${hoverBg}`}>
                  {/* Ícone e Nome do Componente (com faixa lateral de alerta se houver falha) */}
                  <td className={`py-5 px-6 align-middle transition-all w-[320px] ${
                    highlightDanger ? 'border-l-4 border-status-red' : highlightWarning ? 'border-l-4 border-status-orange' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 flex flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        highlightDanger ? 'bg-bg-red border-border-red shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 
                        highlightWarning ? 'bg-bg-orange border-border-orange' : 
                        isInfo ? 'bg-[#1b1b1f] border-[#313136]' :
                        'bg-elevated border-border-strong group-hover:border-text-muted'
                      }`}>
                        <ItemIcon className={`w-4.5 h-4.5 ${
                          highlightDanger ? 'text-status-red' : 
                          highlightWarning ? 'text-status-orange' : 
                          'text-text-muted group-hover:text-text-primary transition-colors'
                        }`} />
                      </div>
                      <span className={`font-sans text-sm tracking-tight ${
                        highlightDanger ? 'text-status-red font-black' : 
                        highlightWarning ? 'text-status-orange font-black' : 
                        'text-text-primary font-bold'
                      }`}>
                        {dataRow.item}
                      </span>
                    </div>
                  </td>

                  {/* Leitura da API */}
                  <td className="py-5 px-6 align-middle min-w-[320px]">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
                      <span className="text-text-muted font-mono font-bold">&gt;</span>
                      {dataRow.read.split(" | ").map((part, index) => {
                        const colonIndex = part.indexOf(":");
                        if (colonIndex === -1) {
                          return (
                            <span key={index} className={`text-sm font-mono font-bold ${
                              highlightDanger ? 'text-status-red' : 'text-text-primary'
                            }`}>
                              {part}
                            </span>
                          );
                        }
                        const key = part.slice(0, colonIndex + 1); // "Campo:"
                        const value = part.slice(colonIndex + 1); // " Valor"
                        return (
                          <span key={index} className="text-sm font-mono flex items-center">
                            <span className="text-text-muted font-sans font-medium mr-1">{key}</span>
                            <span className={`font-bold ${
                              highlightDanger ? 'text-status-red font-mono' : 'text-text-primary font-mono'
                            }`}>{value}</span>
                          </span>
                        );
                      })}
                    </div>
                    {dataRow.note && (
                      <div className={`mt-2 text-xs font-mono font-medium leading-relaxed p-3 rounded-lg border-l-4 ${
                        highlightDanger ? 'bg-bg-red border-status-red text-status-red' : 
                        highlightWarning ? 'bg-bg-orange border-status-orange text-status-orange' :
                        'bg-[#1b1b1f] border-[#313136] text-text-muted'
                      }`}>
                        {dataRow.note}
                      </div>
                    )}
                  </td>

                  {/* Status do Resultado Técnico */}
                  <td className="py-5 px-6 align-middle w-[150px]">
                    <div className="flex flex-col items-start justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-mono font-black uppercase tracking-wider w-full justify-center ${
                        isDanger ? 'bg-bg-red border-border-red text-status-red shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 
                        isWarning ? 'bg-bg-orange border-border-orange text-status-orange' : 
                        isInfo ? 'bg-[#1b1b1f] border-[#313136] text-text-muted' :
                        'bg-bg-green border-border-green text-status-green'
                      }`}>
                        {isDanger ? (
                          <X className="w-3 h-3 text-status-red" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-3 h-3 text-status-orange" />
                        ) : isInfo ? (
                          <HelpCircle className="w-3 h-3 text-text-muted" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-status-green" />
                        )}
                        <span className="opacity-30">|</span>
                        {dataRow.result.toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
