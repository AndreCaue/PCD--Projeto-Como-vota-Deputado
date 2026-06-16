import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBreakdownBar } from "../ScoreBreakdownBar";

describe("ScoreBreakdownBar", () => {
  describe("zero-score rendering", () => {
    it('renders "Sem fatores de conflito" text when scoreConflito is 0', () => {
      render(
        <ScoreBreakdownBar
          scoreConflito={0}
          altaExposicao={false}
          relationshipType={null}
        />
      );
      expect(
        screen.getByText("Sem fatores de conflito")
      ).toBeInTheDocument();
    });

    it("does not render bar segments when scoreConflito is 0", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={0}
          altaExposicao={false}
          relationshipType={null}
        />
      );
      // The bar container has bg-gray-800 — should not exist when score is 0
      expect(container.querySelector(".rounded-full")).toBeNull();
    });
  });

  describe("normal score rendering", () => {
    it("renders bar segments with correct active colors when all factors contribute", () => {
      // altaExposicao=true → capitalScore=50, relationshipType=false → cpfScore=20, cnaeScore=30
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      // 3 segments inside the bar (capital, cnae, cpf)
      expect(segments.length).toBe(3);
    });

    it("shows Capital segment as active (bg-emerald-500) when altaExposicao is true", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[0].classList.contains("bg-emerald-500")).toBe(true);
    });

    it("shows Capital segment as inactive (bg-gray-700/50) when altaExposicao is false", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={false}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[0].classList.contains("bg-gray-700/50")).toBe(true);
    });

    it("shows CPF segment as active (bg-blue-500) when relationshipType is false", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[2].classList.contains("bg-blue-500")).toBe(true);
    });

    it("shows CPF segment as inactive when relationshipType is true or null", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={50}
          altaExposicao={true}
          relationshipType={null}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[2].classList.contains("bg-gray-700/50")).toBe(true);
    });

    it("shows CNAE segment as active when cnaeScore > 0", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      // cnaeScore = 100 - 50 - 20 = 30 > 0
      expect(segments[1].classList.contains("bg-amber-500")).toBe(true);
    });

    it("shows CNAE segment as inactive when cnaeScore is 0", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={50}
          altaExposicao={true}
          relationshipType={null}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      // cnaeScore = 50 - 50 - 0 = 0
      expect(segments[1].classList.contains("bg-gray-700/50")).toBe(true);
    });
  });

  describe("score derivation logic", () => {
    it("derives capitalScore=50 when altaExposicao=true and all factors present", () => {
      // with altaExposicao=true → 50 active
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[0].classList.contains("bg-emerald-500")).toBe(true);
    });

    it("derives capitalScore=0 when altaExposicao=false", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={20}
          altaExposicao={false}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[0].classList.contains("bg-gray-700/50")).toBe(true);
    });

    it("derives cpfScore=20 when relationshipType is false", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={20}
          altaExposicao={false}
          relationshipType={false}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[2].classList.contains("bg-blue-500")).toBe(true);
    });

    it("derives cpfScore=0 when relationshipType is true or null", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={50}
          altaExposicao={false}
          relationshipType={true}
        />
      );

      const segments = container.querySelectorAll(".h-full");
      expect(segments[2].classList.contains("bg-gray-700/50")).toBe(true);
    });
  });

  describe("legend rendering", () => {
    it("renders legend with three items", () => {
      render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      expect(screen.getByText("Capital (50pts)")).toBeInTheDocument();
      expect(screen.getByText("CNAE (30pts)")).toBeInTheDocument();
      expect(screen.getByText("CPF (20pts)")).toBeInTheDocument();
    });

    it("renders legend with correct colored swatches", () => {
      const { container } = render(
        <ScoreBreakdownBar
          scoreConflito={100}
          altaExposicao={true}
          relationshipType={false}
        />
      );

      // Find all swatch spans (w-2 h-2 rounded-sm)
      const swatches = container.querySelectorAll(".rounded-sm");
      expect(swatches.length).toBe(3);
      expect(swatches[0].classList.contains("bg-emerald-500")).toBe(true);
      expect(swatches[1].classList.contains("bg-amber-500")).toBe(true);
      expect(swatches[2].classList.contains("bg-blue-500")).toBe(true);
    });
  });
});
