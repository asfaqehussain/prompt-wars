/**
 * Component tests for DashboardOverview.
 * Tests: rendering, accessibility attributes, interaction, stress categorization.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardOverview from "@/components/DashboardOverview";
import type { MoodLog } from "@/lib/types";

const mockLogs: MoodLog[] = [
  { date: "Jun 12", stressScore: 78, emotion: "Overwhelmed by Physics backlog" },
  { date: "Jun 11", stressScore: 62, emotion: "Anxious about Mock Test scores" },
  { date: "Jun 10", stressScore: 40, emotion: "Calmer after mindfulness session" },
];

const defaultProps = {
  exam: "JEE Main/Advanced",
  setExam: jest.fn(),
  logs: mockLogs,
  onNavigateToTab: jest.fn(),
  activePlan: null,
};

describe("DashboardOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the welcome header", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Aspirant")).toBeInTheDocument();
  });

  it("should display the exam selector with correct value", () => {
    render(<DashboardOverview {...defaultProps} />);
    const select = screen.getByLabelText("Select your target exam") as HTMLSelectElement;
    expect(select.value).toBe("JEE Main/Advanced");
  });

  it("should display the average stress score", () => {
    // Average of 78, 62, 40 = 60
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("should show moderate anxiety label for mid-range stress", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Moderate Exam Anxiety")).toBeInTheDocument();
  });

  it("should show high stress label for high average", () => {
    const highStressLogs: MoodLog[] = [
      { date: "Jun 12", stressScore: 90, emotion: "Burnout" },
      { date: "Jun 11", stressScore: 85, emotion: "Exhausted" },
    ];
    render(<DashboardOverview {...defaultProps} logs={highStressLogs} />);
    expect(screen.getByText("High Stress / Burnout Danger")).toBeInTheDocument();
  });

  it("should display the latest emotional state", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Overwhelmed by Physics backlog")).toBeInTheDocument();
  });

  it("should navigate to journal on 'Log New Entry' click", () => {
    render(<DashboardOverview {...defaultProps} />);
    const btn = screen.getByLabelText("Log a new journal entry");
    fireEvent.click(btn);
    expect(defaultProps.onNavigateToTab).toHaveBeenCalledWith("journal");
  });

  it("should show 'Start Analysis' when no active plan", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Start Analysis")).toBeInTheDocument();
  });

  it("should show 'View Active Roadmap' when plan is active", () => {
    const plan = {
      coachTitle: "NEET Prep Plan",
      summary: "Test",
      weeklySchedule: [],
      dailyRoutineSplits: { studyHours: 4, breakHours: 1, mindfulnessMinutes: 15, outline: [] },
    };
    render(<DashboardOverview {...defaultProps} activePlan={plan} />);
    expect(screen.getByText("View Active Roadmap")).toBeInTheDocument();
  });

  it("should have unique IDs on interactive elements", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(document.getElementById("exam-select")).toBeInTheDocument();
    expect(document.getElementById("dashboard-log-entry-btn")).toBeInTheDocument();
    expect(document.getElementById("dashboard-coach-btn")).toBeInTheDocument();
  });

  it("should have SVG chart with aria-label", () => {
    render(<DashboardOverview {...defaultProps} />);
    const chart = screen.getByLabelText(/stress level trend chart/i);
    expect(chart).toBeInTheDocument();
  });

  it("should navigate to mindfulness on breathing card click", () => {
    render(<DashboardOverview {...defaultProps} />);
    const card = screen.getByLabelText(/4-7-8 Breathing/i);
    fireEvent.click(card);
    expect(defaultProps.onNavigateToTab).toHaveBeenCalledWith("mindfulness");
  });
});
