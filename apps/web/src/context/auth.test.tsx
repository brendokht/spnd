import { render, screen, act, waitFor } from "@testing-library/react";
import { supabase } from "@/lib/supabase";
import { AuthProvider, useAuth } from "./auth";

const mockUnsubscribe = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function TestConsumer() {
  const { user, session, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email ?? "null"}</span>
      <span data-testid="session">{session ? "session" : "null"}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
    mockOnAuthStateChange,
  );
});

describe("AuthProvider", () => {
  it("provides loading: true initially before session resolves", () => {
    (mockSupabase.auth.getSession as jest.Mock).mockReturnValue(
      new Promise(() => {}),
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });

  it("provides user and session after getSession resolves", async () => {
    const mockUser = { email: "auth@example.com" };
    const mockSession = { user: mockUser };
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("auth@example.com");
      expect(screen.getByTestId("session")).toHaveTextContent("session");
    });
  });

  it("updates user and session when onAuthStateChange fires", async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    let capturedCallback: ((event: string, session: unknown) => void) | null =
      null;
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const newUser = { email: "new@example.com" };
    const newSession = { user: newUser };

    act(() => {
      capturedCallback?.("SIGNED_IN", newSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("new@example.com");
      expect(screen.getByTestId("session")).toHaveTextContent("session");
    });
  });

  it("unsubscribes from auth state changes on unmount", async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
