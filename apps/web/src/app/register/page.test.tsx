import { googleOAuthLogin, sendMagicLink, verifyOtp } from "@/app/actions/auth";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";

jest.mock("@/app/actions/auth", () => ({
  sendMagicLink: jest.fn(),
  verifyOtp: jest.fn(),
  googleOAuthLogin: jest.fn(),
}));

document.elementFromPoint = (): null => null;

const mockedSendMagicLink = jest.mocked(sendMagicLink);
const mockedVerifyOtp = jest.mocked(verifyOtp);
const mockedGoogleOAuthLogin = jest.mocked(googleOAuthLogin);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RegisterPage", () => {
  it("renders with correct title, email input, send button, and sign in link", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows OTP section after sending magic link successfully", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByTestId("otp-input")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /verify/i }),
      ).toBeInTheDocument();
    });
  });

  it("disables send button when email is empty", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeDisabled();
  });

  it("shows validation error when email is not valid", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example");

    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("filters non-digits from OTP input", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "ab12cd34ef56");

    expect(screen.getByTestId("otp-input")).toHaveValue("123456");
  });

  it("calls verifyOtp action on OTP form submission", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    mockedVerifyOtp.mockResolvedValue({
      success: true,
      message: "",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalled();
    });
  });

  it("shows error alert when OTP verification fails", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    mockedVerifyOtp.mockResolvedValue({
      success: false,
      message: "",
      errors: ["Token has expired or is invalid"],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "123456");
    await user.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/token has expired or is invalid/i),
      ).toBeInTheDocument();
    });
  });

  it("shows validation error when otp is not 6 digits", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "12345");

    await user.tab();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /otp code must contain only digits/i,
      ),
    );
  });

  it("disables verify button until 6 digits are entered", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "12345");
    expect(screen.getByRole("button", { name: /verify/i })).toBeDisabled();

    await user.type(screen.getByTestId("otp-input"), "6");
    expect(screen.getByRole("button", { name: /verify/i })).not.toBeDisabled();
  });

  it("triggers googleOAuthLogin on button click", async () => {
    mockedGoogleOAuthLogin.mockResolvedValue({
      success: true,
      message: "",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(googleOAuthLogin).toHaveBeenCalled();
    });
  });

  it("triggers sendMagicLink action on Enter key in email field", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(sendMagicLink).toHaveBeenCalled();
    });
  });

  it("triggers verifyOtp action on Enter key in OTP field when 6 digits entered", async () => {
    mockedSendMagicLink.mockResolvedValue({
      success: true,
      message: "Check your email for the magic link.",
      errors: [],
    });
    mockedVerifyOtp.mockResolvedValue({
      success: true,
      message: "",
      errors: [],
    });
    const user = userEvent.setup({ delay: null });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => screen.getByTestId("otp-input"));
    await user.type(screen.getByTestId("otp-input"), "123456");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalled();
    });
  });
});
