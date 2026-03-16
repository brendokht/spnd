/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { appUrl } from "@/lib/config";

const mockExchangeCodeForSession = jest.fn();
const mockGetAll = jest.fn().mockReturnValue([]);
const mockSet = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

// Mock next/headers cookies (not used in route but guard against import errors)
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ getAll: mockGetAll, set: mockSet })),
}));

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Auth Callback Route", () => {
  it("redirects to home page on successful code exchange", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const req = makeRequest(`${appUrl}/auth/callback?code=abc123`);
    const res = await GET(req);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${appUrl}/`);
  });

  describe("Error Handling", () => {
    it("redirects to login page when no code parameter is present", async () => {
      const req = makeRequest(`${appUrl}/auth/callback`);
      const res = await GET(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${appUrl}/login`);
    });

    it("redirects to login page with error when code exchange fails", async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: "Invalid code" },
      });
      const req = makeRequest(`${appUrl}/auth/callback?code=badcode`);
      const res = await GET(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("/login?error=");
      expect(decodeURIComponent(location)).toContain("Invalid code");
    });
  });
});
