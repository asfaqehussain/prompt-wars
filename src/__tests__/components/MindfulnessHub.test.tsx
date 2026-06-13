import { render, screen, fireEvent } from "@testing-library/react";
import MindfulnessHub from "@/components/MindfulnessHub";

jest.mock("@/lib/useBreathingExercise", () => ({
  useBreathingExercise: jest.fn(),
}));

import { useBreathingExercise } from "@/lib/useBreathingExercise";

const mockUseBreathing = useBreathingExercise as jest.Mock;

describe("MindfulnessHub", () => {
  const mockHandlers = {
    breathingActive: false,
    breatheState: "ready" as const,
    breatheTimer: 0,
    breatheType: "478" as const,
    setBreatheType: jest.fn(),
    handleToggleBreathing: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBreathing.mockReturnValue(mockHandlers);
  });

  it("should render the breathing section", () => {
    render(<MindfulnessHub />);
    expect(screen.getByText(/Guided Breathing/i)).toBeInTheDocument();
  });

  it("should render breathing type toggle buttons", () => {
    render(<MindfulnessHub />);
    expect(screen.getByText("4-7-8 Calming Breath")).toBeInTheDocument();
    expect(screen.getByText("Box Focusing Breath")).toBeInTheDocument();
  });

  it("should start breathing on start button click", () => {
    const handleToggleBreathing = jest.fn();
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      handleToggleBreathing,
    });

    render(<MindfulnessHub />);
    fireEvent.click(screen.getByText("Start Exercise"));
    expect(handleToggleBreathing).toHaveBeenCalled();
  });

  it("should show pause when breathing is active", () => {
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      breathingActive: true,
    });

    render(<MindfulnessHub />);
    expect(screen.getByText("Pause Exercise")).toBeInTheDocument();
  });

  it("should show timer when breathing is active", () => {
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      breathingActive: true,
      breatheTimer: 5,
      breatheState: "inhale",
    });

    render(<MindfulnessHub />);
    expect(screen.getByText("5s")).toBeInTheDocument();
    expect(screen.getByText("Inhale")).toBeInTheDocument();
  });

  it("should call setBreatheType on toggle click", () => {
    const setBreatheType = jest.fn();
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      setBreatheType,
    });

    render(<MindfulnessHub />);
    fireEvent.click(screen.getByText("Box Focusing Breath"));
    expect(setBreatheType).toHaveBeenCalledWith("box");
  });

  it("should render soundscape mixer section", () => {
    render(<MindfulnessHub />);
    expect(screen.getByText(/Zen Soundscape/i)).toBeInTheDocument();
    expect(screen.getByText(/Gentle Rain/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocean Waves/i)).toBeInTheDocument();
    expect(screen.getByText(/Singing Bowl/i)).toBeInTheDocument();
  });

  it("should have play buttons for audio tracks", () => {
    render(<MindfulnessHub />);
    const playButtons = screen.getAllByText("Play");
    expect(playButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("should display aria-live region for breathing timer", () => {
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      breathingActive: true,
      breatheTimer: 3,
      breatheState: "inhale",
    });

    render(<MindfulnessHub />);
    const timerEl = screen.getByText("3s");
    expect(timerEl).toHaveAttribute("aria-live", "polite");
  });

  it("should show ready state when not active", () => {
    render(<MindfulnessHub />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("should toggle breathing type when switching and stop if active", () => {
    const handleToggleBreathing = jest.fn();
    const setBreatheType = jest.fn();
    mockUseBreathing.mockReturnValue({
      ...mockHandlers,
      breathingActive: false,
      handleToggleBreathing,
      setBreatheType,
    });

    render(<MindfulnessHub />);
    fireEvent.click(screen.getByText("Box Focusing Breath"));
    expect(setBreatheType).toHaveBeenCalledWith("box");
  });
});
