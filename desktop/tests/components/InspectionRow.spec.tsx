import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InspectionRow } from "../../src/components/InspectionRow";
import { TOOLTIPS_DICTIONARY } from "../../src/constants/tooltipsDictionary";

describe("InspectionRow", () => {
  it("não renderiza o gatilho de tooltip quando a chave não existe no dicionário", () => {
    const { container } = render(
      <InspectionRow title="Item" value="Valor" status="conforme" tooltipKey="chave.inexistente" />,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(1); // apenas o ícone de status
  });

  it("exibe o conteúdo do tooltip ao passar o mouse e some ao tirar o mouse", () => {
    const { container } = render(
      <InspectionRow
        title="Fusing Status"
        value="Integridade Confirmada"
        status="conforme"
        tooltipKey="dealbreakers.fusing"
      />,
    );

    expect(screen.queryByText(TOOLTIPS_DICTIONARY.dealbreakers.fusing)).not.toBeInTheDocument();

    const trigger = container.querySelectorAll("svg")[0].parentElement!;
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText(TOOLTIPS_DICTIONARY.dealbreakers.fusing)).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText(TOOLTIPS_DICTIONARY.dealbreakers.fusing)).not.toBeInTheDocument();
  });

  it("exibe o ícone de alerta apenas quando é um dealbreaker em estado crítico", () => {
    const { container: withoutFlag } = render(
      <InspectionRow title="Item" value="Valor" status="critico" tooltipKey="" />,
    );
    const svgsWithoutFlag = withoutFlag.querySelectorAll("svg").length;

    const { container: withFlag } = render(
      <InspectionRow title="Item" value="Valor" status="critico" tooltipKey="" isDealbreaker />,
    );
    const svgsWithFlag = withFlag.querySelectorAll("svg").length;

    expect(svgsWithFlag).toBe(svgsWithoutFlag + 1);
  });
});
