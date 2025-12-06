// tests/dashboard/dashboard.page.test.jsx

import { render, screen } from "@testing-library/react";
import DashboardPage from "../../src/app/dashboard/page";

// ---- Mocks for context hooks ----

const mockUseAuth = jest.fn();
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseGamification = jest.fn();
jest.mock("../../src/app/context/GamificationContext", () => ({
  useGamification: () => mockUseGamification(),
}));

const mockUseDarkMode = jest.fn();
jest.mock("../../src/app/context/DarkModeContext", () => ({
  useDarkMode: () => mockUseDarkMode(),
}));

// ---- Mocks for data hooks ----

const mockUseClasses = jest.fn();
jest.mock("../../src/app/hooks/useClasses", () => ({
  useClasses: (...args) => mockUseClasses(...args),
}));

const mockUseStudyGroups = jest.fn();
jest.mock("../../src/app/hooks/useStudyGroups", () => ({
  useStudyGroups: (...args) => mockUseStudyGroups(...args),
}));

// ---- Component mocks ----

// ProtectedPage: just render children, tagged for testing
jest.mock("../../src/app/components/ProtectedPage", () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="protected-page">{children}</div>
  ),
}));

// PageHeader: we don't care about its UI, just render a marker
jest.mock("../../src/app/components/PageHeader", () => ({
  __esModule: true,
  default: ({ title, subtitle }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}));

// LoadingScreen: simple marker
jest.mock("../../src/app/components/LoadingScreen", () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

// StatsCard: simple stub
jest.mock("../../src/app/components/StatsCard", () => ({
  __esModule: true,
  default: ({ stat }) => (
    <div data-testid="stats-card">{stat.label}: {stat.value}</div>
  ),
}));

// DashboardCourseCard: show course name so we can assert
jest.mock("../../src/app/components/DashboardCourseCard", () => ({
  __esModule: true,
  default: ({ course }) => (
    <div data-testid="dashboard-course-card">
      {course.name || course.code}
    </div>
  ),
}));

// EmptyState: generic stub, we’ll only assert that it renders
jest.mock("../../src/app/components/EmptyState", () => ({
  __esModule: true,
  default: ({ title }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
    </div>
  ),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: user is logged in
    mockUseAuth.mockReturnValue({
      user: { name: "John Doe" },
      token: "fake-token",
    });

    // Default: gamification stats loaded
    mockUseGamification.mockReturnValue({
      stats: {
        streak: 3,
        totalStudyMinutes: 120,
        achievements: [{ id: 1 }],
        level: 2,
        xp: 500,
      },
      loading: false,
    });

    // Default: light mode
    mockUseDarkMode.mockReturnValue({
      darkMode: false,
    });

    // Default: no classes yet
    mockUseClasses.mockReturnValue({
      classes: [],
      loading: false,
    });

    // Default: no study groups yet, no error
    mockUseStudyGroups.mockReturnValue({
      groups: [],
      loading: false,
      error: null,
    });
  });

  test("shows LoadingScreen when any data is loading", () => {
    // Simulate classes still loading
    mockUseClasses.mockReturnValue({
      classes: [],
      loading: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders dashboard layout, headers, and empty states when no data", () => {
    render(<DashboardPage />);

    // Wrapped in ProtectedPage
    expect(screen.getByTestId("protected-page")).toBeInTheDocument();

    // Page header exists
    expect(screen.getByTestId("page-header")).toBeInTheDocument();

    // Main section headings
    expect(screen.getByText("Your Courses")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Study Sessions")).toBeInTheDocument();

    // Two EmptyState components: one for courses, one for study sessions
    const emptyStates = screen.getAllByTestId("empty-state");
    expect(emptyStates.length).toBeGreaterThanOrEqual(2);
  });

  test("renders course cards when classes are present", () => {
    mockUseClasses.mockReturnValue({
      classes: [
        { _id: "1", name: "CS 120B" },
        { _id: "2", name: "STAT 100A" },
        { _id: "3", name: "BIOL 5A" },
      ],
      loading: false,
    });

    render(<DashboardPage />);

    // DashboardCourseCard should be rendered for at most 2 courses (slice(0, 2))
    const cards = screen.getAllByTestId("dashboard-course-card");
    expect(cards.length).toBe(2);
  });

  test("renders study group card when there are upcoming study sessions", () => {
    mockUseStudyGroups.mockReturnValue({
      groups: [
        {
          _id: "g1",
          name: "Midterm Review Session",
          members: [{ id: 1 }, { id: 2 }],
          class: { _id: "c1", code: "CS 120B", name: "Embedded Systems" },
          scheduledAt: "2025-12-05T18:00:00.000Z",
          location: "Orbach Library",
        },
      ],
      loading: false,
      error: null,
    });

    render(<DashboardPage />);

    expect(
      screen.getByText("Midterm Review Session")
    ).toBeInTheDocument();
    expect(screen.getByText("View Session")).toBeInTheDocument();
  });

  test("shows error message when study groups hook returns an error", () => {
    mockUseStudyGroups.mockReturnValue({
      groups: [],
      loading: false,
      error: "Failed to load groups",
    });

    render(<DashboardPage />);

    expect(
      screen.getByText("Failed to load groups")
    ).toBeInTheDocument();
  });
});
