import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CnaeLabel } from "../CnaeLabel";

describe("CnaeLabel", () => {
  describe("null/empty handling", () => {
    it("returns null when cnaePrincipal is null", () => {
      const { container } = render(
        <CnaeLabel cnaePrincipal={null} cnaeDescricao={null} />
      );
      expect(container.innerHTML).toBe("");
    });

    it("returns null when cnaePrincipal is empty string", () => {
      const { container } = render(
        <CnaeLabel cnaePrincipal="" cnaeDescricao={null} />
      );
      expect(container.innerHTML).toBe("");
    });
  });

  describe("conflict CNAE coloring", () => {
    it("uses amber text for description of conflict CNAE 41204", () => {
      render(
        <CnaeLabel
          cnaePrincipal="41204"
          cnaeDescricao="Construção de edifícios"
        />
      );
      const desc = screen.getByText("Construção de edifícios");
      expect(desc.classList.contains("text-amber-300")).toBe(true);
    });

    it("uses amber text for code of conflict CNAE 41204", () => {
      render(
        <CnaeLabel
          cnaePrincipal="41204"
          cnaeDescricao="Construção de edifícios"
        />
      );
      const code = screen.getByText("41204");
      expect(code.classList.contains("text-amber-400")).toBe(true);
    });

    it("uses amber for conflict CNAE 70204", () => {
      render(
        <CnaeLabel
          cnaePrincipal="70204"
          cnaeDescricao="Atividades de consultoria"
        />
      );
      expect(screen.getByText("Atividades de consultoria").classList.contains("text-amber-300")).toBe(true);
      expect(screen.getByText("70204").classList.contains("text-amber-400")).toBe(true);
    });

    it("uses amber for conflict CNAE 73190", () => {
      render(
        <CnaeLabel
          cnaePrincipal="73190"
          cnaeDescricao="Publicidade"
        />
      );
      expect(screen.getByText("Publicidade").classList.contains("text-amber-300")).toBe(true);
      expect(screen.getByText("73190").classList.contains("text-amber-400")).toBe(true);
    });

    it("uses amber for conflict CNAE 86101", () => {
      render(
        <CnaeLabel
          cnaePrincipal="86101"
          cnaeDescricao="Atividades de atendimento hospitalar"
        />
      );
      expect(screen.getByText("Atividades de atendimento hospitalar").classList.contains("text-amber-300")).toBe(true);
      expect(screen.getByText("86101").classList.contains("text-amber-400")).toBe(true);
    });
  });

  describe("non-conflict CNAE coloring", () => {
    it("uses gray text for description and code of non-conflict CNAE", () => {
      render(
        <CnaeLabel
          cnaePrincipal="47113"
          cnaeDescricao="Comércio varejista"
        />
      );
      const desc = screen.getByText("Comércio varejista");
      expect(desc.classList.contains("text-gray-300")).toBe(true);

      const code = screen.getByText("47113");
      expect(code.classList.contains("text-gray-500")).toBe(true);
    });

    it("uses gray for code even when description is null", () => {
      render(
        <CnaeLabel
          cnaePrincipal="47113"
          cnaeDescricao={null}
        />
      );
      const code = screen.getByText("47113");
      expect(code.classList.contains("text-gray-500")).toBe(true);
    });
  });

  describe("description and code rendering", () => {
    it("renders both description and code when both provided", () => {
      render(
        <CnaeLabel
          cnaePrincipal="41204"
          cnaeDescricao="Construção de edifícios"
        />
      );
      expect(screen.getByText("Construção de edifícios")).toBeInTheDocument();
      expect(screen.getByText("41204")).toBeInTheDocument();
    });

    it("renders only code when description is null", () => {
      render(
        <CnaeLabel
          cnaePrincipal="41204"
          cnaeDescricao={null}
        />
      );
      expect(screen.getByText("41204")).toBeInTheDocument();
      // Description should not be rendered
      expect(screen.queryByText("Construção de edifícios")).toBeNull();
    });

    it("renders code in font-mono class", () => {
      render(
        <CnaeLabel
          cnaePrincipal="41204"
          cnaeDescricao="Construção de edifícios"
        />
      );
      const code = screen.getByText("41204");
      expect(code.classList.contains("font-mono")).toBe(true);
    });
  });
});
