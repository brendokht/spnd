import { createClient } from "@/lib/supabase/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock("@/lib/supabase/client", () => {
  const mockSupabaseClient = {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  };
  return {
    createClient: jest.fn(() => mockSupabaseClient),
  };
});

const mockSupabase = createClient();

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReturnValue(null);
});

describe("LoginPage", () => {
  it("renders email input, send magic link button, google button, and register link", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("shows error alert on mount when searchParams has an error", () => {
    mockGet.mockReturnValue("Invalid credentials");
    render(<LoginPage />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows OTP section after sending magic link successfully", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/6-digit code/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /verify/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows error alert when sending magic link fails", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: { message: "Email not found" },
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText("Email not found")).toBeInTheDocument();
    });
  });

  it("disables send button when email is empty", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeDisabled();
  });

  it("filters non-digits from OTP input", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

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
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

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
      error: { message: "Invalid OTP" },
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid OTP")).toBeInTheDocument();
    });
  });

  it("disables verify button until 6 digits are entered", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "12345");
    expect(screen.getByRole("button", { name: /verify/i })).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/6-digit code/i), "6");
    expect(screen.getByRole("button", { name: /verify/i })).not.toBeDisabled();
  });

  it("shows error alert when Google sign-in fails", async () => {
    (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      error: { message: "OAuth error" },
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("OAuth error")).toBeInTheDocument();
    });
  });

  it("triggers sendMagicLink on Enter key in email field", async () => {
    (mockSupabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
      error: null,
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com" }),
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
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByPlaceholderText(/6-digit code/i));
    await user.type(screen.getByPlaceholderText(/6-digit code/i), "123456");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalled();
    });
  });
});
