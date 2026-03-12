import { render, screen } from "@testing-library/react";
import Home from "./page";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Home", () => {
  it("renders Yeahhhhhh boiiiiii", () => {
    render(<Home />);
    expect(screen.getByText("Yeahhhhhh boiiiiii")).toBeInTheDocument();
  });
});
