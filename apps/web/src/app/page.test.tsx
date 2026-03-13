import { createClient } from "@/lib/supabase/server";
import { render, screen } from "@testing-library/react";
import Home from "./page";

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Home", () => {
  it("renders welcome message for authenticated user", async () => {
    const mockUser = { email: "test@example.com" };
    const { auth } = await (createClient as jest.Mock)();
    (auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    render(await Home());
    expect(
      screen.getByText(`Welcome back, ${mockUser.email}`),
    ).toBeInTheDocument();
  });

  it("renders 'User not found' when no user is returned", async () => {
    const { auth } = await (createClient as jest.Mock)();
    (auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    render(await Home());
    expect(screen.getByText("User not found")).toBeInTheDocument();
  });

  it("renders 'Unauthorized' when an error is returned", async () => {
    const { auth } = await (createClient as jest.Mock)();
    (auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: "Auth error" },
    });

    render(await Home());
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });
});
