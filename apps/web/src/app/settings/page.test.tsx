import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  duplicateEmailError,
  exampleUser,
  identityFetchFailed,
  identityFoundError,
  identityNotFoundError,
  newUser,
  signOutFailed,
  soleIdentityError,
  takenUser,
} from "@spnd/constants/tests";
import { User } from "@supabase/supabase-js";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "./page";

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/lib/supabase/server", () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
  };
  return {
    createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
  };
});

jest.mock("@/lib/supabase/client", () => {
  const mockSupabaseClient = {
    auth: {
      updateUser: jest.fn(),
      linkIdentity: jest.fn(),
      unlinkIdentity: jest.fn(),
      refreshSession: jest.fn(),
      getUserIdentities: jest.fn(),
      signOut: jest.fn(),
    },
  };
  return {
    createClient: jest.fn(() => mockSupabaseClient),
  };
});

const mockSupabase = createClient();

async function setMockUser({ user }: { user: RecursivePartial<User> }) {
  const { auth } = await (createServerClient as jest.Mock)();
  (auth.getUser as jest.Mock).mockResolvedValue({
    data: {
      user: user,
    },
    error: null,
  });
}

beforeEach(async () => {
  jest.clearAllMocks();
  // Reset to default: Google linked
  setMockUser(exampleUser);
});

describe("SettingsPage", () => {
  it("renders the Settings heading", async () => {
    render(await SettingsPage());
    expect(
      screen.getByRole("heading", { name: /settings/i }),
    ).toBeInTheDocument();
  });

  it("renders Account and Security tabs", async () => {
    render(await SettingsPage());

    expect(screen.getByRole("tab", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /security/i })).toBeInTheDocument();
  });

  describe("Change Email section", () => {
    it("renders the Change Email card heading", async () => {
      render(await SettingsPage());
      expect(screen.getByText(/change email/i)).toBeInTheDocument();
    });

    it("renders the email input pre-filled with the user's current email", async () => {
      render(await SettingsPage());
      const input = screen.getByLabelText(/email/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("user@example.com");
    });

    it("disables the Submit button when the email is unchanged", async () => {
      render(await SettingsPage());
      expect(screen.getByRole("button", { name: /^submit$/i })).toBeDisabled();
    });

    it("enables the Submit button when the email is changed", async () => {
      const user = userEvent.setup({ delay: null });
      render(await SettingsPage());

      const input = screen.getByLabelText(/email/i);
      await user.clear(input);
      await user.type(input, newUser.email);

      expect(screen.getByRole("button", { name: /^submit$/i })).toBeEnabled();
    });

    it("calls updateUser with the new email on Submit and shows success", async () => {
      (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: null,
      });
      const user = userEvent.setup({ delay: null });
      render(await SettingsPage());

      const input = screen.getByLabelText(/email/i);
      await user.clear(input);
      await user.type(input, newUser.email);
      await user.click(screen.getByRole("button", { name: /^submit$/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith(
          { email: newUser.email },
          { emailRedirectTo: "http://localhost:3000/settings" },
        );
        expect(
          screen.getByText(
            /emails have been sent to the old and new email address/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it("shows an error message when updateUser fails", async () => {
      (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: {
          message: duplicateEmailError,
        },
      });
      const user = userEvent.setup({ delay: null });
      render(await SettingsPage());

      const input = screen.getByLabelText(/email/i);
      await user.clear(input);
      await user.type(input, takenUser.email);
      await user.click(screen.getByRole("button", { name: /^submit$/i }));

      await waitFor(() => {
        expect(screen.getByText(duplicateEmailError)).toBeInTheDocument();
      });
    });
  });

  describe("Sign-in Methods section", () => {
    it("renders the Google sign-in method row", async () => {
      render(await SettingsPage());
      expect(screen.getByText("Google")).toBeInTheDocument();
    });

    it("shows Connected badge when Google is linked", async () => {
      render(await SettingsPage());
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    it("shows Not connected badge when Google is not linked", async () => {
      // TODO: FIX THIS STUFF WITH getMockUseAuth, change to getMockGetUser
      setMockUser({
        user: {
          email: "user@example.com",
          identities: [{ provider: "email" }],
        },
      });
      render(await SettingsPage());
      expect(screen.getByText("Not connected")).toBeInTheDocument();
    });

    it("shows Unlink button when Google is connected", async () => {
      render(await SettingsPage());
      expect(screen.getByTestId("google-unlink-btn")).toBeInTheDocument();
    });

    it("shows Link button when Google is not connected", async () => {
      setMockUser({
        user: {
          email: "user@example.com",
          identities: [{ provider: "email" }],
        },
      });
      render(await SettingsPage());
      expect(screen.getByTestId("google-link-btn")).toBeInTheDocument();
    });

    describe("Link Google dialog", () => {
      beforeEach(() => {
        setMockUser({
          user: {
            email: "user@example.com",
            identities: [{ provider: "email" }],
          },
        });
      });

      it("opens the Link Google dialog when the Link button is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-link-btn"));

        expect(
          screen.getByText(/would you like to link google\?/i),
        ).toBeInTheDocument();
      });

      it("calls linkIdentity on continue and closes the dialog", async () => {
        (mockSupabase.auth.linkIdentity as jest.Mock).mockResolvedValue({
          error: null,
        });
        (mockSupabase.auth.refreshSession as jest.Mock).mockResolvedValue({
          error: null,
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-link-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockSupabase.auth.linkIdentity).toHaveBeenCalledWith({
            provider: "google",
            options: { redirectTo: "http://localhost:3000/settings" },
          });
        });
      });

      it("shows an error in the dialog when linkIdentity fails", async () => {
        (mockSupabase.auth.linkIdentity as jest.Mock).mockResolvedValue({
          error: { message: identityFoundError },
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-link-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(screen.getByText(identityFoundError)).toBeInTheDocument();
        });
      });
    });

    describe("Unlink Google dialog", () => {
      it("opens the Unlink Google dialog when the Unlink button is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-unlink-btn"));

        expect(
          screen.getByText(/would you like to unlink google\?/i),
        ).toBeInTheDocument();
      });

      it("calls getUserIdentities and unlinkIdentity on Continue", async () => {
        const googleIdentity = { provider: "google", id: "gid-1" };

        (mockSupabase.auth.getUserIdentities as jest.Mock).mockResolvedValue({
          data: { identities: [googleIdentity] },
          error: null,
        });
        (mockSupabase.auth.unlinkIdentity as jest.Mock).mockResolvedValue({
          error: null,
        });

        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(mockSupabase.auth.getUserIdentities).toHaveBeenCalled();
          expect(mockSupabase.auth.unlinkIdentity).toHaveBeenCalledWith(
            googleIdentity,
          );
        });
      });

      it("shows an error when no Google identity is found during unlink", async () => {
        (mockSupabase.auth.getUserIdentities as jest.Mock).mockResolvedValue({
          data: { identities: [] },
          error: null,
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(screen.getByText(identityNotFoundError)).toBeInTheDocument();
        });
      });

      it("shows a friendly error for single_identity_not_deletable", async () => {
        const googleIdentity = { provider: "google", id: "gid-1" };
        (mockSupabase.auth.getUserIdentities as jest.Mock).mockResolvedValue({
          data: { identities: [googleIdentity] },
          error: null,
        });
        (mockSupabase.auth.unlinkIdentity as jest.Mock).mockResolvedValue({
          error: {
            code: "single_identity_not_deletable",
          },
        });

        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(screen.getByText(soleIdentityError)).toBeInTheDocument();
        });
      });

      it("shows a generic error when getUserIdentities fails", async () => {
        (mockSupabase.auth.getUserIdentities as jest.Mock).mockResolvedValue({
          data: null,
          error: { message: identityFetchFailed },
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());

        await user.click(screen.getByTestId("google-unlink-btn"));
        await user.click(screen.getByRole("button", { name: /continue/i }));

        await waitFor(() => {
          expect(screen.getByText(identityFetchFailed)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Security tab", () => {
    async function openSecurityTab(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole("tab", { name: /security/i }));
    }

    it("renders both session sign-out buttons", async () => {
      const user = userEvent.setup({ delay: null });
      render(await SettingsPage());
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
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
        await openSecurityTab(user);

        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );

        expect(
          screen.getByText(/this will sign you out of all other sessions/i),
        ).toBeInTheDocument();
      });

      it("calls signOut with scope 'others' and shows success message", async () => {
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
          error: null,
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
        await openSecurityTab(user);

        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({
            scope: "others",
          });
          expect(
            screen.getByText(/all other sessions have been signed out/i),
          ).toBeInTheDocument();
        });
      });

      it("shows an error message when signing out others fails", async () => {
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
          error: { message: "Network error" },
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
        await openSecurityTab(user);

        await user.click(
          screen.getByRole("button", { name: /sign out of other sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(screen.getByText("Network error")).toBeInTheDocument();
        });
      });
    });

    describe("Sign out of all sessions", () => {
      it("opens the confirmation dialog when the button is clicked", async () => {
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
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

      it("calls signOut with scope 'global' and redirects to /login", async () => {
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
          error: null,
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
        await openSecurityTab(user);

        await user.click(
          screen.getByRole("button", { name: /sign out of all sessions/i }),
        );
        await user.click(screen.getByRole("button", { name: /^continue$/i }));

        await waitFor(() => {
          expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({
            scope: "global",
          });
          expect(mockPush).toHaveBeenCalledWith("/login");
        });
      });

      it("shows an error message when signing out everywhere fails", async () => {
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
          error: { message: signOutFailed },
        });
        const user = userEvent.setup({ delay: null });
        render(await SettingsPage());
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
