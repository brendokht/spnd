import { supabase } from "@/lib/supabase";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";

const mockUnsubscribe = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Re-usable test consumer that exposes all AuthContext values
function TestConsumer() {
  const { user, session, userIdentities, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email ?? "null"}</span>
      <ul data-testid="userIdentities">
        {userIdentities.map((identity) => (
          <li key={identity} data-testid={identity}>
            {identity}
          </li>
        ))}
      </ul>
      <span data-testid="session">{session ? "session" : "null"}</span>
    </div>
  );
}

// Capture the callback registered with onAuthStateChange so tests can fire events
type AuthCallback = (event: string, session: unknown) => void;
let capturedCallback: AuthCallback | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  capturedCallback = null;

  // onAuthStateChange captures the callback and returns a subscription stub
  (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
    (cb: AuthCallback) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    },
  );

  // getUser resolves with no user by default (overridden per-test as needed)
  (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: null },
  });

  mockPush.mockClear();
});

describe("AuthProvider", () => {
  it("provides loading: true with empty state before any auth event fires", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // The callback has not been called yet, so loading stays at its initial true
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("userIdentities")).toBeEmptyDOMElement();
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });

  it("sets loading: false after a SIGNED_IN event with no session", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    act(() => {
      capturedCallback?.("SIGNED_IN", null);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("userIdentities")).toBeEmptyDOMElement();
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });

  it("updates user, session, and userIdentities on SIGNED_IN with a session", async () => {
    const mockIdentities = [{ provider: "email" }, { provider: "google" }];
    const mockUser = {
      email: "auth@example.com",
      identities: mockIdentities,
    };
    const mockSession = { user: mockUser };

    // getUser resolves with the authoritative user (same as session user here)
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    act(() => {
      capturedCallback?.("SIGNED_IN", mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("auth@example.com");
    expect(screen.getByTestId("session")).toHaveTextContent("session");

    // Both identities should appear in the list
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("google")).toBeInTheDocument();
  });

  it("sets loading: true during the auth event and false after it resolves", async () => {
    // Use a controlled promise so we can observe the intermediate loading state
    let resolveGetUser!: (value: unknown) => void;
    (mockSupabase.auth.getUser as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveGetUser = resolve;
      }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    act(() => {
      capturedCallback?.("SIGNED_IN", {
        user: { email: "a@b.com", identities: [] },
      });
    });

    // Now resolve getUser — loading should drop to false
    await act(async () => {
      resolveGetUser({ data: { user: { email: "a@b.com", identities: [] } } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("clears user, session, and userIdentities on SIGNED_OUT", async () => {
    const mockUser = {
      email: "auth@example.com",
      identities: [{ provider: "google" }],
    };
    const mockSession = { user: mockUser };

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // Sign in first
    act(() => {
      capturedCallback?.("SIGNED_IN", mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("auth@example.com");
    });

    // Now sign out
    act(() => {
      capturedCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(screen.getByTestId("userIdentities")).toBeEmptyDOMElement();
      expect(screen.getByTestId("session")).toHaveTextContent("null");
    });
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
