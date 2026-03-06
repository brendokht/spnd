import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/lib/supabase";
import RegisterPage from "./page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RegisterPage", () => {
  it("renders with correct title, email button, and sign in link", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows OTP section after sending magic link successfully", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/6-digit code/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /verify/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows error alert when sending magic link fails", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
    });
  });

  it("disables send button when email is empty", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("button", { name: /continue with email/i }),
    ).toBeDisabled();
  });

  it("filters non-digits from OTP input", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(
      screen.getByPlaceholderText(/6-digit code/i),
      "ab12cd34ef56",
    );

    expect(screen.getByPlaceholderText(/6-digit code/i)).toHaveValue("123456");
  });

  it("calls router.push and router.refresh on successful OTP verification", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    (mockSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error alert when OTP verification fails", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    (mockSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      error: { message: "Token expired" },
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
  });

  it("disables verify button until 6 digits are entered", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "12345");
    expect(screen.getByRole("button", { name: /verify/i })).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/6-digit code/i), "6");
    expect(screen.getByRole("button", { name: /verify/i })).not.toBeDisabled();
  });

  it("shows error alert when Google sign-up fails", async () => {
    (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      error: { message: "OAuth unavailable" },
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("OAuth unavailable")).toBeInTheDocument();
    });
  });

  it("triggers sendMagicLink on Enter key in email field", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com" }),
      );
    });
  });

  it("triggers verifyOtp on Enter key in OTP field when 6 digits entered", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    (mockSupabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "123456");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalled();
    });
  });
});
