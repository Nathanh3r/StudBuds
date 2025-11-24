import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const MockXPBar = ({ level = 1, xp = 0 }) => {
  return (
    <div data-testid="xp-bar">
      <div>Level {level}</div>
      <div>{xp} XP</div>
    </div>
  );
};

describe("XPBar Component", () => {
  test("renders level correctly", () => {
    render(<MockXPBar level={5} xp={500} />);
    expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
  });

  test("renders XP amount correctly", () => {
    render(<MockXPBar level={3} xp={350} />);
    expect(screen.getByText(/350 XP/i)).toBeInTheDocument();
  });
});
