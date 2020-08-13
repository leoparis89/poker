import React from "react";

import "@testing-library/jest-dom";
import { render, fireEvent, screen } from "@testing-library/react";

import { Home } from "./Home";

describe("<Home />", () => {
  it("should display join game modal when we click on join", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(screen.getByText(/join game/i)).toBeInTheDocument();
  });
});
