import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

// Mock do useAuth
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", role: "user" },
    isLoading: false,
    error: null,
  }),
}));

// Mock do useLocation
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
}));

describe("Home - Responsividade", () => {
  beforeEach(() => {
    // Reset viewport para cada teste
    global.innerWidth = 1024;
    global.innerHeight = 768;
  });

  it("deve renderizar corretamente em desktop (1024px)", () => {
    global.innerWidth = 1024;
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it("deve renderizar corretamente em tablet (768px)", () => {
    global.innerWidth = 768;
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it("deve renderizar corretamente em mobile (375px)", () => {
    global.innerWidth = 375;
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it("deve renderizar corretamente em mobile pequeno (320px)", () => {
    global.innerWidth = 320;
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it("deve ter layout responsivo com grid", () => {
    const { container } = render(<Home />);
    const grid = container.querySelector("[class*='grid']");
    expect(grid).toBeTruthy();
  });

  it("deve ter padding responsivo em containers", () => {
    const { container } = render(<Home />);
    const containers = container.querySelectorAll("[class*='px-']");
    expect(containers.length).toBeGreaterThan(0);
  });

  it("deve ter botões acessíveis em todos os tamanhos de tela", () => {
    const { container } = render(<Home />);
    const buttons = container.querySelectorAll("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("type");
      expect(button.textContent).toBeTruthy();
    });
  });

  it("deve ter texto legível em todos os tamanhos", () => {
    const { container } = render(<Home />);
    const headings = container.querySelectorAll("h1, h2, h3");
    headings.forEach((heading) => {
      const fontSize = window.getComputedStyle(heading).fontSize;
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThan(0);
    });
  });
});
