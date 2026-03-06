import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { supabase } from "@/lib/supabase";
import Home from "./page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

jest.mock("@/context/auth", () => ({
  useAuth: () => ({
    user: { email: "user@example.com" },
    session: {},
    loading: false,
  }),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Home", () => {
  it("renders the Spnd heading", () => {
    render(<Home />);
    expect(screen.getByText("Spnd")).toBeInTheDocument();
  });

  it("renders the authenticated user's email", () => {
    render(<Home />);
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("renders the sign out button", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("calls signOut, refresh, and redirects to /login on sign out", async () => {
    (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({});
    const user = userEvent.setup({ delay: null });
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
