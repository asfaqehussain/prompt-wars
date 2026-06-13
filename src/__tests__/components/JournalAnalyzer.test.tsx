import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JournalAnalyzer from "@/components/JournalAnalyzer";

global.fetch = jest.fn();

const mockAnalysisResult = {
  stressScore: 72,
  primaryEmotion: "Anxious",
  triggers: ["Mock Test Performance", "Syllabus Overwhelm"],
  copingStrategies: [
    "Take a deep breath and break tasks into small chunks.",
    "Review mistakes as learning opportunities.",
    "Talk to a friend or mentor.",
  ],
  encouragement: "You are doing your best, and that is enough.",
};

describe("JournalAnalyzer", () => {
  const onAnalysisSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the journal input area", () => {
    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);
    expect(screen.getByText(/Empathetic Journal/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/How is your JEE prep/i)).toBeInTheDocument();
  });

  it("should render template prompt buttons", () => {
    render(<JournalAnalyzer exam="NEET" onAnalysisSuccess={onAnalysisSuccess} />);
    expect(screen.getByText(/Mock Test Distress/i)).toBeInTheDocument();
    expect(screen.getByText(/Syllabus Overwhelm/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Expectations/i)).toBeInTheDocument();
  });

  it("should fill textarea when template button is clicked", () => {
    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);
    const templateBtn = screen.getByText(/Mock Test Distress/i);
    fireEvent.click(templateBtn);

    const textarea = screen.getByPlaceholderText(/How is your JEE prep/i);
    expect(textarea).toHaveValue();
    expect((textarea as HTMLTextAreaElement).value.length).toBeGreaterThan(0);
  });

  it("should show error for empty submission", () => {
    render(<JournalAnalyzer exam="NEET" onAnalysisSuccess={onAnalysisSuccess} />);
    fireEvent.click(screen.getByText(/Analyze Stress Triggers/i));
    expect(screen.getByText(/write down your thoughts/i)).toBeInTheDocument();
  });

  it("should call API on analyze and show results", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysisResult,
    });

    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);

    const textarea = screen.getByPlaceholderText(/How is your JEE prep/i);
    fireEvent.change(textarea, { target: { value: "I feel very stressed about my mock tests." } });
    fireEvent.click(screen.getByText(/Analyze Stress Triggers/i));

    await waitFor(() => {
      expect(screen.getByText("Anxious")).toBeInTheDocument();
      expect(screen.getByText("72%")).toBeInTheDocument();
      expect(screen.getByText(/Mock Test Performance/i)).toBeInTheDocument();
      expect(screen.getByText(/your best, and that is enough/i)).toBeInTheDocument();
    });

    expect(onAnalysisSuccess).toHaveBeenCalledWith({
      stressScore: 72,
      emotion: "Anxious",
      date: expect.any(String),
    });
  });

  it("should show error state on API failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<JournalAnalyzer exam="NEET" onAnalysisSuccess={onAnalysisSuccess} />);

    const textarea = screen.getByPlaceholderText(/How is your NEET prep/i);
    fireEvent.change(textarea, { target: { value: "I am overwhelmed." } });
    fireEvent.click(screen.getByText(/Analyze Stress Triggers/i));

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it("should clear the form on clear button click", () => {
    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);

    const textarea = screen.getByPlaceholderText(/How is your JEE prep/i);
    fireEvent.change(textarea, { target: { value: "Some text to clear" } });
    fireEvent.click(screen.getByText("Clear"));

    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("should have microphone dictation button", () => {
    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);
    const dictateBtn = screen.getByTitle(/Dictate your thoughts/i);
    expect(dictateBtn).toBeInTheDocument();
  });

  it("should render coping strategies in results", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysisResult,
    });

    render(<JournalAnalyzer exam="JEE" onAnalysisSuccess={onAnalysisSuccess} />);

    const textarea = screen.getByPlaceholderText(/How is your JEE prep/i);
    fireEvent.change(textarea, { target: { value: "I feel stressed." } });
    fireEvent.click(screen.getByText(/Analyze Stress Triggers/i));

    await waitFor(() => {
      expect(screen.getByText(/Strategy 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Strategy 2/i)).toBeInTheDocument();
    });
  });
});
