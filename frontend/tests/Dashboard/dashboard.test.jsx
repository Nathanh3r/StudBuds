import { render, screen } from "@testing-library/react";
import DashboardPage from "../../src/app/dashboard/page";

// Mock Context Hooks allows us to fully control data returned to component


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


// Mock Data Hooks isolates rendering logic from backend API behavior


const mockUseClasses = jest.fn();
jest.mock("../../src/app/hooks/useClasses", () => ({
  useClasses: (...args) => mockUseClasses(...args),
}));

const mockUseStudyGroups = jest.fn();
jest.mock("../../src/app/hooks/useStudyGroups", () => ({
  useStudyGroups: (...args) => mockUseStudyGroups(...args),
}));

// Mock Large Child Components we use minimal HTML to assert rendering


/** Wraps children so we can assert that protected routes render successfully */
jest.mock("../../src/app/components/ProtectedPage", () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="protected-page">{children}</div>
  ),
}));

/** Minimal PageHeader rendering to allow text assertions */
jest.mock("../../src/app/components/PageHeader", () => ({
  __esModule: true,
  default: ({ title, subtitle }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}));

/** Render a loading marker for async state */
jest.mock("../../src/app/components/LoadingScreen", () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

/** Dumb StatsCard stub  we only check values, not styling/layout */
jest.mock("../../src/app/components/StatsCard", () => ({
  __esModule: true,
  default: ({ stat }) => (
    <div data-testid="stats-card">{stat.label}: {stat.value}</div>
  ),
}));

/** Render enrolled courses so testing can count them */
jest.mock("../../src/app/components/DashboardCourseCard", () => ({
  __esModule: true,
  default: ({ course }) => (
    <div data-testid="dashboard-course-card">
      {course.name || course.code}
    </div>
  ),
}));

/** Used for no-data states */
jest.mock("../../src/app/components/EmptyState", () => ({
  __esModule: true,
  default: ({ title }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
    </div>
  ),
}));



// main tests
describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { name: "John Doe" },
      token: "fake-token",
    });

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

    mockUseDarkMode.mockReturnValue({
      darkMode: false,
    });

    mockUseClasses.mockReturnValue({
      classes: [],
      loading: false,
    });

    mockUseStudyGroups.mockReturnValue({
      groups: [],
      loading: false,
      error: null,
    });
  });



  // Test 1 — Loading State Handling

  test("shows LoadingScreen when any data is loading", () => {
    // Override default to simulate pending API response
    mockUseClasses.mockReturnValue({
      classes: [],
      loading: true,
    });

    render(<DashboardPage />);

    // Assert loading UI is visible
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });


 
  // Test 2 — Default Empty Dashboard Behavior

  test("renders dashboard layout, headers, and empty states when no data", () => {
    render(<DashboardPage />);

    // Ensure protected route wrapper is active
    expect(screen.getByTestId("protected-page")).toBeInTheDocument();

    // Ensure header rendered
    expect(screen.getByTestId("page-header")).toBeInTheDocument();

    // Ensure important section headings
    expect(screen.getByText("Your Courses")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Study Sessions")).toBeInTheDocument();

    // Empty state should appear for both sections
    const emptyStates = screen.getAllByTestId("empty-state");
    expect(emptyStates.length).toBeGreaterThanOrEqual(2);
  });



  // Test 3 — Rendering Limited Course Cards

  test("renders course cards when classes are present", () => {
    // Override default to simulate 3 enrolled classes
    mockUseClasses.mockReturnValue({
      classes: [
        { _id: "1", name: "CS 120B" },
        { _id: "2", name: "STAT 100A" },
        { _id: "3", name: "BIOL 5A" },
      ],
      loading: false,
    });

    render(<DashboardPage />);

    const cards = screen.getAllByTestId("dashboard-course-card");
    expect(cards.length).toBe(2);
  });


 
  // Test 4 — Study Groups Rendering

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

    // Session title visible
    expect(screen.getByText("Midterm Review Session")).toBeInTheDocument();

    // Session contains link/button
    expect(screen.getByText("View Session")).toBeInTheDocument();
  });



  // Test 5 — Error Rendering

  test("shows error message when study groups hook returns an error", () => {
    mockUseStudyGroups.mockReturnValue({
      groups: [],
      loading: false,
      error: "Failed to load groups",
    });

    render(<DashboardPage />);

    // Assert visual error indicator is present
    expect(screen.getByText("Failed to load groups")).toBeInTheDocument();
  });
});
