import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AICoach from "@/components/AICoach";
import type { CoachPlan } from "@/lib/types";

global.fetch = jest.fn();

const mockPlan: CoachPlan = {
  coachTitle: "JEE Prep Plan",
  summary: "A 4-week roadmap",
  weeklySchedule: [
    {
      week: "Week 1: Basics",
      milestones: ["Review NCERT", "Practice calculus"],
      wellnessFocus: "Take breaks",
    },
  ],
  strengthMaximizer: "Leverage your math skills",
  weaknessMitigation: "Focus on chemistry",
  dailyRoutineSplits: {
    studyHours: 6,
    breakHours: 2,
    mindfulnessMinutes: 15,
    outline: ["9am-11am: Study", "11am-12pm: Break"],
  },
};

describe("AICoach", () => {
  const setActivePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show the onboarding wizard when no active plan", () => {
    render(<AICoach activePlan={null} setActivePlan={setActivePlan} />);
    expect(screen.getByText("Start Preparation Analysis")).toBeInTheDocument();
    expect(screen.getByText("Next Step")).toBeInTheDocument();
  });

  it("should show error for empty target goal on step advancement", () => {
    render(<AICoach activePlan={null} setActivePlan={setActivePlan} />);
    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText(/specify your target goal/i)).toBeInTheDocument();
  });

  it("should advance through wizard steps", () => {
    render(<AICoach activePlan={null} setActivePlan={setActivePlan} />);

    const input = screen.getByPlaceholderText(/e\.g\., UPSC Prelims/i);
    fireEvent.change(input, { target: { value: "JEE Advanced" } });

    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Target Date / Deadline:")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Your Main Strengths:")).toBeInTheDocument();

    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("should show loading state during submission", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<AICoach activePlan={null} setActivePlan={setActivePlan} />);

    const input = screen.getByPlaceholderText(/e\.g\., UPSC Prelims/i);
    fireEvent.change(input, { target: { value: "NEET" } });
    fireEvent.click(screen.getByText("Next Step"));
    fireEvent.click(screen.getByText("Next Step"));
    fireEvent.click(screen.getByText("Generate AI Roadmap"));

    expect(screen.getByText(/GenAI Coach Analysing/i)).toBeInTheDocument();
  });

  it("should show error state on API failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<AICoach activePlan={null} setActivePlan={setActivePlan} />);

    const input = screen.getByPlaceholderText(/e\.g\., UPSC Prelims/i);
    fireEvent.change(input, { target: { value: "NEET" } });
    fireEvent.click(screen.getByText("Next Step"));
    fireEvent.click(screen.getByText("Next Step"));

    fireEvent.click(screen.getByText("Generate AI Roadmap"));

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it("should render roadmap when plan is active", () => {
    render(<AICoach activePlan={mockPlan} setActivePlan={setActivePlan} />);
    expect(screen.getByText("JEE Prep Plan")).toBeInTheDocument();
    expect(screen.getByText("A 4-week roadmap")).toBeInTheDocument();
    expect(screen.getByText("Week 1: Basics")).toBeInTheDocument();
    expect(screen.getByText("Review NCERT")).toBeInTheDocument();
    expect(screen.getByText(/Leverage your math skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Focus on chemistry/i)).toBeInTheDocument();
  });

  it("should display daily routine splits", () => {
    render(<AICoach activePlan={mockPlan} setActivePlan={setActivePlan} />);
    expect(screen.getByText("Daily Allocation Budget")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("6h"))).toBeInTheDocument();
  });

  it("should toggle milestone checkboxes", () => {
    render(<AICoach activePlan={mockPlan} setActivePlan={setActivePlan} />);
    const checkbox = screen.getByLabelText("Review NCERT");
    expect(checkbox).not.toBeChecked();
    const checkboxDiv = screen.getByRole("checkbox", { name: "Review NCERT" });
    fireEvent.click(checkboxDiv);
    expect(checkbox).toBeChecked();
  });

  it("should show reset button and handle it", () => {
    window.confirm = jest.fn(() => true);
    render(<AICoach activePlan={mockPlan} setActivePlan={setActivePlan} />);
    const resetBtn = screen.getByText(/Reset Plan/i);
    fireEvent.click(resetBtn);
    expect(setActivePlan).toHaveBeenCalledWith(null);
  });

  it("should have accessible tabIndex on milestone items", () => {
    render(<AICoach activePlan={mockPlan} setActivePlan={setActivePlan} />);
    const milestones = document.querySelectorAll('[role="checkbox"]');
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach((m) => {
      expect(m).toHaveAttribute("tabIndex", "0");
    });
  });
});
