import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../src/app/login/page";


// Mock the AuthContext so we control what login() returns during the tests

const loginMock = jest.fn();
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));


// Mock Next.js Router so we can assert navigation behavior

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock, // this is checked when redirecting
  }),
}));

describe("LoginPage Tests", () => {
  
  // Reset mocks between each test to avoid cross-test contamination
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper function:
   * Simulates typing into the email and password fields
   * so we keep our tests clean and avoid repeating code.
   */
  const fillForm = ({ email, password }) => {
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), {
      target: { value: email },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: password },
    });
  };


  // Test 1: Email validation
  
  test("shows .edu email validation error", async () => {
    render(<LoginPage />);

    // Enter invalid email (not ending in `.edu`)
    fillForm({ email: "not-edu@gmail.com", password: "123456" });

    fireEvent.click(screen.getByText("Log In"));

    // Expect UI error to appear
    expect(
      await screen.findByText(/You must use a \.edu email address/i)
    ).toBeInTheDocument();

    // Expect backend not to be called at all
    expect(loginMock).not.toHaveBeenCalled();
  });


  // Test 2: check Login called with correct credentials

  test("calls login() on successful form submission", async () => {
    // Return failed login to avoid redirect in this test
    loginMock.mockResolvedValue({ success: false });

    render(<LoginPage />);

    fillForm({ email: "test@ucr.edu", password: "mypassword" });
    fireEvent.click(screen.getByText("Log In"));

    // Wait for async updates
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("test@ucr.edu", "mypassword");
    });
  });


  // Test 3: redirect on good login

  test("redirects to dashboard on successful login", async () => {
    // Simulate a "successful login" response
    loginMock.mockResolvedValue({ success: true });

    render(<LoginPage />);

    fillForm({ email: "user@ucr.edu", password: "123456" });
    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      // Assert navigation happened with correct destination
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

    // Test 4: Backend error display
 
  test("shows backend error when login fails", async () => {
    // Simulate backend sending an error
    loginMock.mockResolvedValue({ success: false, error: "Incorrect password" });

    render(<LoginPage />);

    fillForm({ email: "user@ucr.edu", password: "wrong" });
    fireEvent.click(screen.getByText("Log In"));

    // Assert UI displays backend error message
    expect(await screen.findByText("Incorrect password")).toBeInTheDocument();
  });
});
