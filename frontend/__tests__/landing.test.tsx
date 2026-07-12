import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
  it("renders the product name and primary actions", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { name: "StadiumGPT AI" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open command center/i })).toBeInTheDocument();
    expect(screen.getByText(/Live Crowd Heatmap/i)).toBeInTheDocument();
  });
});

