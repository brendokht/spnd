import { exampleUser } from "@spnd/constants/tests";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import Home from "./page";
import { checkUserSession } from "@/lib/validation-utils";
import { makeUser } from "@/lib/test-utils";

jest.mock("@/lib/validation-utils", () => ({
  checkUserSession: jest.fn(),
}));

const mockedCheckUserSession = jest.mocked(checkUserSession);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Home Page", () => {
  describe("User State Rendering", () => {
    it("renders welcome message for authenticated user", async () => {
      mockedCheckUserSession.mockResolvedValue(makeUser(exampleUser));

      await act(async () => {
        return render(await Home());
      });
      expect(
        screen.getByText(`Welcome back, ${exampleUser.email}`),
      ).toBeInTheDocument();
    });
  });
});
