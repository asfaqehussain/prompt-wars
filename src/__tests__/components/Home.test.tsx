/**
 * Component tests for the main Home page.
 * Tests: rendering, navigation, theme toggling, accessibility.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";

// Mock all child components to isolate page-level logic
jest.mock("@/components/DashboardOverview", () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-view">Dashboard</div>;
  };
});
jest.mock("@/components/JournalAnalyzer", () => {
  return function MockJournal() {
    return <div data-testid="journal-view">Journal</div>;
  };
});
jest.mock("@/components/ZenChat", () => {
  return function MockChat() {
    return <div data-testid="chat-view">Chat</div>;
  };
});
jest.mock("@/components/MindfulnessHub", () => {
  return function MockMindfulness() {
    return <div data-testid="mindfulness-view">Mindfulness</div>;
  };
});
jest.mock("@/components/AICoach", () => {
  return function MockCoach() {
    return <div data-testid="coach-view">Coach</div>;
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Home Page", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should render the app title", () => {
    render(<Home />);
    expect(screen.getByText("Asha")).toBeInTheDocument();
  });

  it("should show dashboard by default", () => {
    render(<Home />);
    expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
  });

  it("should navigate to AI Coach tab on click", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("AI Study Coach"));
    expect(screen.getByTestId("coach-view")).toBeInTheDocument();
  });

  it("should navigate to Journal tab on click", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("AI Journal Analyzer"));
    expect(screen.getByTestId("journal-view")).toBeInTheDocument();
  });

  it("should navigate to Chat tab on click", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Asha Chat Companion"));
    expect(screen.getByTestId("chat-view")).toBeInTheDocument();
  });

  it("should navigate to Mindfulness tab on click", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Mindfulness Hub"));
    expect(screen.getByTestId("mindfulness-view")).toBeInTheDocument();
  });

  it("should have a theme toggle button", () => {
    render(<Home />);
    const toggle = screen.getByLabelText(/Switch to Light Mode/i);
    expect(toggle).toBeInTheDocument();
  });

  it("should toggle theme on button click", () => {
    render(<Home />);
    const toggle = screen.getByLabelText(/Switch to Light Mode/i);
    fireEvent.click(toggle);
    expect(localStorageMock.getItem("asha_theme")).toBe("light");
  });

  it("should have main content landmark with id", () => {
    render(<Home />);
    const main = document.getElementById("main-content");
    expect(main).toBeInTheDocument();
  });

  it("should have navigation with proper ARIA role", () => {
    render(<Home />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });

  it("should have unique IDs on all nav tabs", () => {
    render(<Home />);
    expect(document.getElementById("nav-tab-dashboard")).toBeInTheDocument();
    expect(document.getElementById("nav-tab-coach")).toBeInTheDocument();
    expect(document.getElementById("nav-tab-journal")).toBeInTheDocument();
    expect(document.getElementById("nav-tab-chat")).toBeInTheDocument();
    expect(document.getElementById("nav-tab-mindfulness")).toBeInTheDocument();
  });

  it("should mark active tab with aria-current", () => {
    render(<Home />);
    const dashTab = document.getElementById("nav-tab-dashboard");
    expect(dashTab).toHaveAttribute("aria-current", "page");
  });

  it("should render footer with copyright", () => {
    render(<Home />);
    expect(screen.getByText(/2026 Asha Mental Wellness/)).toBeInTheDocument();
  });
});
