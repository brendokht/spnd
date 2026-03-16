import { googleOAuthLogin, sendMagicLink, verifyOtp } from "@/app/actions/auth";
import { dbRegisterError, exampleUser, newUser } from "@spnd/constants/tests";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import { act } from "react";
import RegisterPage from "./page";

jest.mock("@/app/actions/auth", () => ({
  sendMagicLink: jest.fn(),
  verifyOtp: jest.fn(),
  googleOAuthLogin: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

document.elementFromPoint = (): null => null;

const mockedSendMagicLink = jest.mocked(sendMagicLink);
const mockedVerifyOtp = jest.mocked(verifyOtp);
const mockedGoogleOAuthLogin = jest.mocked(googleOAuthLogin);
const mockedGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useSearchParams as jest.Mock).mockReturnValue({
    get: mockedGet,
  });

  mockedGet.mockReturnValue("");
});

describe("Register Page", () => {
  describe("Initial Rendering", () => {
    it("renders registration form and sign in link", async () => {
      await act(async () => {
        return render(RegisterPage());
      });
      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send magic link/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /continue with google/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it("shows error alert when search params receives error_description", async () => {
      mockedGet.mockReturnValue(dbRegisterError);

      await act(async () => {
        return render(RegisterPage());
      });

      await waitFor(() => screen.getByText(dbRegisterError));
    });
  });

  describe("Magic Link Submission", () => {
    it("disables send button when email is empty", async () => {
      await act(async () => {
        return render(RegisterPage());
      });
      expect(
        screen.getByRole("button", { name: /send magic link/i }),
      ).toBeDisabled();
    });

    it("shows validation error when email is not valid", async () => {
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), "new@example");

      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    it("triggers sendMagicLink action on Enter key in email field", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "Check your email for the magic link.",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(sendMagicLink).toHaveBeenCalled();
      });
    });

    it("reveals OTP input section after successful magic link request", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "Check your email for the magic link.",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("otp-input")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /verify/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("OTP Verification", () => {
    it("filters non-digit characters from OTP input", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "Check your email for the magic link.",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => screen.getByTestId("otp-input"));
      await user.type(screen.getByTestId("otp-input"), "ab12cd34ef56");

      expect(screen.getByTestId("otp-input")).toHaveValue("123456");
    });

    it("disables verify button until 6 digits are entered", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "Check your email for the magic link.",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => screen.getByTestId("otp-input"));
      await user.type(screen.getByTestId("otp-input"), "12345");
      expect(screen.getByRole("button", { name: /verify/i })).toBeDisabled();

      await user.type(screen.getByTestId("otp-input"), "6");
      expect(
        screen.getByRole("button", { name: /verify/i }),
      ).not.toBeDisabled();
    });

    it("shows validation error when otp code is not 6 digits", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), exampleUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => screen.getByTestId("otp-input"));
      await user.type(screen.getByTestId("otp-input"), "12345");

      await user.tab();

      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent(
          /otp code must contain only digits/i,
        ),
      );
    });

    it("triggers verifyOtp action on Enter key in OTP field with 6 digits", async () => {
      mockedSendMagicLink.mockResolvedValue({
        success: true,
        message: "",
        errors: [],
      });
      mockedVerifyOtp.mockResolvedValue({
        success: true,
        message: "",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => screen.getByTestId("otp-input"));
      await user.type(screen.getByTestId("otp-input"), "123456");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(verifyOtp).toHaveBeenCalled();
      });
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
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

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
      await act(async () => {
        return render(RegisterPage());
      });

      await user.type(screen.getByLabelText(/email/i), newUser.user.email);
      await user.click(
        screen.getByRole("button", { name: /send magic link/i }),
      );

      await waitFor(() => screen.getByTestId("otp-input"));
      await user.type(screen.getByTestId("otp-input"), "123456");
      await user.click(screen.getByRole("button", { name: /verify/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/token has expired or is invalid/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Third-Party Authentication", () => {
    it("triggers googleOAuthLogin action on button click", async () => {
      mockedGoogleOAuthLogin.mockResolvedValue({
        success: true,
        message: "",
        errors: [],
      });
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        return render(RegisterPage());
      });

      await user.click(
        screen.getByRole("button", { name: /continue with google/i }),
      );

      await waitFor(() => {
        expect(googleOAuthLogin).toHaveBeenCalled();
      });
    });
  });
});
