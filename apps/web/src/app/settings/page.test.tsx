import {
  changeEmailSuccess,
  duplicateEmailError,
  exampleUser,
  identityLinkFailedError,
  newUser,
  signOutFailed,
  soleIdentityError,
  takenUser,
} from "@spnd/constants/tests";
import { User } from "@supabase/supabase-js";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import {
  changeEmail,
  linkGoogleOAuth,
  signOut,
  unlinkGoogleOAuth,
} from "../actions/auth";
import SettingsPage from "./page";

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const mockGetUser = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => {
    return {
      auth: {
        getUser: mockGetUser,
      },
    };
  }),
}));

jest.mock("@/app/actions/auth", () => ({
  changeEmail: jest.fn(),
  linkGoogleOAuth: jest.fn(),
  unlinkGoogleOAuth: jest.fn(),
  signOut: jest.fn(),
}));

const mockedChangeEmail = jest.mocked(changeEmail);
const mockedLinkGoogleOAuth = jest.mocked(linkGoogleOAuth);
const mockedUnlinkGoogleOAuth = jest.mocked(unlinkGoogleOAuth);
const mockedSignOut = jest.mocked(signOut);

function setMockUser({ user }: { user: RecursivePartial<User> }) {
  mockGetUser.mockResolvedValue({
    data: { user },
    error: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockUser({
    user: {
      email: exampleUser.user.email,
      identities: [{ provider: "email" }, { provider: "google" }],
    },
  });
});

describe("SettingsPage", () => {
  it("renders the Settings heading", async () => {
    await act(async () => {
      return render(await SettingsPage());
    });
    expect(
      screen.getByRole("heading", { name: /settings/i }),
    ).toBeInTheDocument();
  });

  it("renders Account and Security tabs", async () => {
    await act(async () => {
      return render(await SettingsPage());
    });
    expect(screen.getByRole("tab", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /security/i })).toBeInTheDocument();
  });

  describe("Change Email section", () => {
    it("renders the Change Email card heading", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByText(/change email/i)).toBeInTheDocument();
    });

    it("renders the email input pre-filled with the user's current email", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      const input = screen.getByLabelText(/email/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(exampleUser.user.email);
    });

    it("disables the Submit button when the email is unchanged", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();
    });

    it("enables the Submit button when the email is changed", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      const user = userEvent.setup({ delay: null });

      const input = screen.getByLabelText(/email/i);

      await user.clear(input);
      await user.type(input, newUser.email);

      expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
    });

    it("calls changeEmail with the new email on Submit and shows success", async () => {
      mockedChangeEmail.mockResolvedValue({
        success: true,
        message: changeEmailSuccess,
        errors: [],
      });

      await act(async () => {
        return render(await SettingsPage());
      });

      const user = userEvent.setup({ delay: null });

      const input = screen.getByLabelText(/email/i);

      await user.clear(input);
      await user.type(input, newUser.email);
      await user.click(screen.getByRole("button", { name: /^submit$/i }));

      await waitFor(() => {
        expect(mockedChangeEmail).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(FormData),
        );

        const formData = mockedChangeEmail.mock.calls[0]![1] as FormData;
        expect(formData.get("email")).toBe(newUser.email);
        expect(screen.getByText(changeEmailSuccess)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /^submit$/i }),
        ).toBeDisabled();
      });
    });

    it("shows an error message when changeEmail fails", async () => {
      mockedChangeEmail.mockResolvedValue({
        success: false,
        message: "",
        errors: [duplicateEmailError],
      });

      await act(async () => {
        return render(await SettingsPage());
      });

      const user = userEvent.setup({ delay: null });

      const input = screen.getByLabelText(/email/i);

      await user.clear(input);
      await user.type(input, takenUser.email);
      await user.click(screen.getByRole("button", { name: /^submit$/i }));

      await waitFor(() => {
        expect(mockedChangeEmail).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(FormData),
        );

        const formData = mockedChangeEmail.mock.calls[0]![1] as FormData;
        expect(formData.get("email")).toBe(takenUser.email);
        expect(screen.getByText(duplicateEmailError)).toBeInTheDocument();
      });
    });
  });

  describe("Sign-in Methods section", () => {
    it("renders the Google sign-in method row", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByText("Google")).toBeInTheDocument();
    });

    it("shows Connected badge when Google is linked", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    it("shows Not connected badge when Google is not linked", async () => {
      setMockUser({
        user: {
          email: exampleUser.user.email,
          identities: [{ provider: "email" }],
        },
      });
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByText("Not connected")).toBeInTheDocument();
    });

    it("shows Unlink button when Google is connected", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByTestId("google-unlink-btn")).toBeInTheDocument();
    });

    it("shows Link button when Google is not connected", async () => {
      setMockUser({
        user: {
          email: exampleUser.user.email,
          identities: [{ provider: "email" }],
        },
      });
      await act(async () => {
        return render(await SettingsPage());
      });
      expect(screen.getByTestId("google-link-btn")).toBeInTheDocument();
    });

    describe("Link Google dialog", () => {
      beforeEach(() => {
        setMockUser({
          user: {
            email: exampleUser.user.email,
            identities: [{ provider: "email" }],
          },
        });
      });

      it("opens the Link Google dialog when the Link button is clicked", async () => {
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });

        await user.click(screen.getByTestId("google-link-btn"));

        expect(
          screen.getByText(/would you like to link google\?/i),
        ).toBeInTheDocument();
      });

      it("calls linkGoogleOAuth on continue and closes the dialog", async () => {
        mockedLinkGoogleOAuth.mockResolvedValue({
          success: true,
          message: "",
          errors: [],
        });

        const user = userEvent.setup({ delay: null });
        await act(async () => {
          return render(await SettingsPage());
        });

        await user.click(screen.getByTestId("google-link-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockedLinkGoogleOAuth).toHaveBeenCalled();
        });
      });

      it("shows an error in the dialog when linkGoogleOAuth fails", async () => {
        mockedLinkGoogleOAuth.mockResolvedValue({
          success: false,
          message: "",
          errors: [identityLinkFailedError],
        });

        const user = userEvent.setup({ delay: null });
        await act(async () => {
          return render(await SettingsPage());
        });

        await user.click(screen.getByTestId("google-link-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockedLinkGoogleOAuth).toHaveBeenCalled();
          expect(screen.getByText(identityLinkFailedError)).toBeInTheDocument();
        });
      });
    });

    describe("Unlink Google dialog", () => {
      it("opens the Unlink Google dialog when the Link button is clicked", async () => {
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });

        await user.click(screen.getByTestId("google-unlink-btn"));

        expect(
          screen.getByText(/would you like to unlink google\?/i),
        ).toBeInTheDocument();
      });

      it("calls unlinkGoogleOAuth on continue and closes the dialog", async () => {
        mockedUnlinkGoogleOAuth.mockResolvedValue({
          success: true,
          message: "",
          errors: [],
        });

        const user = userEvent.setup({ delay: null });
        await act(async () => {
          return render(await SettingsPage());
        });

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockedUnlinkGoogleOAuth).toHaveBeenCalled();
        });
      });

      it("shows an error in the dialog when unlinkGoogleOAuth fails", async () => {
        mockedUnlinkGoogleOAuth.mockResolvedValue({
          success: false,
          message: "",
          errors: [soleIdentityError],
        });

        const user = userEvent.setup({ delay: null });
        await act(async () => {
          return render(await SettingsPage());
        });

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockedUnlinkGoogleOAuth).toHaveBeenCalled();
          expect(screen.getByText(soleIdentityError)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Security tab", () => {
    async function openSecurityTab(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("tab", { name: /security/i }));
    }

    it("renders both session sign-out buttons", async () => {
      await act(async () => {
        return render(await SettingsPage());
      });

      const user = userEvent.setup({ delay: null });

      await openSecurityTab(user);

      expect(
        screen.getByRole("button", { name: /sign out of other sessions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign out of all sessions/i }),
      ).toBeInTheDocument();
    });

    describe("Sign out of other sessions", () => {
      it("opens the confirmation dialog when the button is clicked", async () => {
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });
        await openSecurityTab(user);

        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );

        expect(
          screen.getByText(/this will sign you out of all other sessions/i),
        ).toBeInTheDocument();
      });

      it("calls signOut with scope 'others'", async () => {
        mockedSignOut.mockResolvedValue({
          success: true,
          message: "",
          errors: [],
        });
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });

        await openSecurityTab(user);
        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(mockedSignOut).toHaveBeenCalledWith({ scope: "others" });
        });
      });

      it("shows an error message when signing out others fails", async () => {
        mockedSignOut.mockResolvedValue({
          success: false,
          message: "",
          errors: [signOutFailed],
        });

        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });
        await openSecurityTab(user);
        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(screen.getByText(signOutFailed)).toBeInTheDocument();
        });
      });
    });

    describe("Sign out of all sessions", () => {
      it("opens the confirmation dialog when the button is clicked", async () => {
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });
        await openSecurityTab(user);
        await user.click(
          screen.getByRole("button", { name: /sign out of all sessions/i }),
        );

        expect(
          screen.getByText(
            /this will sign you out of all sessions, including your current one/i,
          ),
        ).toBeInTheDocument();
      });

      it("calls signOut with scope 'global'", async () => {
        mockedSignOut.mockResolvedValue({
          success: true,
          message: "",
          errors: [],
        });
        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });
        await openSecurityTab(user);
        await user.click(
          screen.getByRole("button", { name: /sign out of all sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(mockedSignOut).toHaveBeenCalledWith({ scope: "global" });
        });
      });

      it("shows an error message when signing out everywhere fails", async () => {
        mockedSignOut.mockResolvedValue({
          success: false,
          message: "",
          errors: [signOutFailed],
        });

        await act(async () => {
          return render(await SettingsPage());
        });

        const user = userEvent.setup({ delay: null });
        await openSecurityTab(user);
        await user.click(
          screen.getByRole("button", { name: /sign out of all sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(screen.getByText(signOutFailed)).toBeInTheDocument();
        });
      });
    });
  });
});
