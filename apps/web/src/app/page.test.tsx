import { createClient } from "@/lib/supabase/server";
import {
  exampleUser,
  unauthorizedError,
  userNotFoundError,
} from "@spnd/constants/tests";
import { render, screen } from "@testing-library/react";
import { act } from "react";
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

describe("Home Page", () => {
  describe("User State Rendering", () => {
    it("renders welcome message for authenticated user", async () => {
      const { auth } = await (createClient as jest.Mock)();
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: exampleUser,
        error: null,
      });

      await act(async () => {
        return render(await Home());
      });
      expect(
        screen.getByText(`Welcome back, ${exampleUser.user.email}`),
      ).toBeInTheDocument();
    });

    it("renders 'User not found' when no user is returned", async () => {
      const { auth } = await (createClient as jest.Mock)();
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await act(async () => {
        return render(await Home());
      });
      expect(screen.getByText(userNotFoundError)).toBeInTheDocument();
    });

    it("renders 'Unauthorized' when auth error occurs", async () => {
      const { auth } = await (createClient as jest.Mock)();
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "" },
      });

      await act(async () => {
        return render(await Home());
      });
      expect(screen.getByText(unauthorizedError)).toBeInTheDocument();
    });
  });
});
