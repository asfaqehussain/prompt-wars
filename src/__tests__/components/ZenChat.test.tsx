import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ZenChat from "@/components/ZenChat";

global.fetch = jest.fn();

describe("ZenChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the initial bot message with exam name", () => {
    render(<ZenChat exam="JEE" />);
    expect(screen.getAllByText("Asha").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/JEE/i)).toBeInTheDocument();
    expect(screen.getByText(/how are you holding up/i)).toBeInTheDocument();
  });

  it("should render starter prompt buttons", () => {
    render(<ZenChat exam="NEET" />);
    expect(screen.getByText(/overwhelmed by my syllabus/i)).toBeInTheDocument();
    expect(screen.getByText(/can't sleep/i)).toBeInTheDocument();
  });

  it("should send user message on starter prompt click", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: "I hear you." }),
    });

    render(<ZenChat exam="JEE" />);
    const starterBtn = screen.getByText(/overwhelmed by my syllabus/i);
    fireEvent.click(starterBtn);

    await waitFor(() => {
      expect(screen.getByText("I hear you.")).toBeInTheDocument();
    });
  });

  it("should show loading dots during API call", () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ZenChat exam="CAT" />);
    const starterBtn = screen.getByText(/overwhelmed by my syllabus/i);
    fireEvent.click(starterBtn);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should show fallback message on API error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<ZenChat exam="UPSC" />);
    const starterBtn = screen.getByText(/overwhelmed by my syllabus/i);
    fireEvent.click(starterBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/having a slight trouble connecting/i)
      ).toBeInTheDocument();
    });
  });

  it("should send message on Enter key", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: "Take a deep breath." }),
    });

    render(<ZenChat exam="GATE" />);
    const input = screen.getByPlaceholderText(/share your concerns/i);
    fireEvent.change(input, { target: { value: "I feel anxious" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Take a deep breath.")).toBeInTheDocument();
    });
  });

  it("should not send empty message", () => {
    render(<ZenChat exam="JEE" />);
    const sendBtn = screen.getByText("Send");
    expect(sendBtn).toBeDisabled();
  });

  it("should have accessible loading indicator label", () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ZenChat exam="NEET" />);
    const starterBtn = screen.getByText(/overwhelmed by my syllabus/i);
    fireEvent.click(starterBtn);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Asha is typing a response");
  });
});
