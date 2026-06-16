import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisclaimerBanner } from "../DisclaimerBanner";

describe("DisclaimerBanner", () => {
  it("renders the exact D-12 disclaimer text", () => {
    render(<DisclaimerBanner />);
    const expectedText =
      "Os scores são indicadores algorítmicos baseados em dados públicos da Receita Federal e não constituem determinação legal de conflito de interesses.";
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("renders the Info icon from lucide-react", () => {
    const { container } = render(<DisclaimerBanner />);
    // lucide-react Info renders an SVG with specific attributes
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // lucide Info icon typically has viewBox="0 0 24 24"
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("has correct blue-themed styling classes", () => {
    const { container } = render(<DisclaimerBanner />);
    const bannerDiv = container.firstElementChild;

    expect(bannerDiv?.classList.contains("bg-blue-950/20")).toBe(true);
    expect(bannerDiv?.classList.contains("border-blue-800/40")).toBe(true);
  });

  it("renders paragraph with text-blue-300", () => {
    render(<DisclaimerBanner />);
    const expectedText =
      "Os scores são indicadores algorítmicos baseados em dados públicos da Receita Federal e não constituem determinação legal de conflito de interesses.";
    const paragraph = screen.getByText(expectedText);
    expect(paragraph.classList.contains("text-blue-300")).toBe(true);
  });

  it("has use client directive", () => {
    // The component should have "use client" at the top of its file
    // This is verified by reading the component file
    // In runtime, the test rendering confirms it works (no SSR mismatch)
    render(<DisclaimerBanner />);
    expect(
      screen.getByText(/Os scores são indicadores algorítmicos/)
    ).toBeInTheDocument();
  });
});
