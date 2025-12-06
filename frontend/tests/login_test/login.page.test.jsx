import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../src/app/login/page";


// mock useAuth
const loginMock = jest.fn();
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

// mock router
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("LoginPage Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = ({ email, password }) => {
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), {
      target: { value: email },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: password },
    });
  };

  test("shows .edu email validation error", async () => {
    render(<LoginPage />);

    fillForm({ email: "not-edu@gmail.com", password: "123456" });

    fireEvent.click(screen.getByText("Log In"));

    expect(
      await screen.findByText(/You must use a \.edu email address/i)
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();
  });

  test("calls login() on successful form submission", async () => {
    loginMock.mockResolvedValue({ success: false });

    render(<LoginPage />);

    fillForm({ email: "test@ucr.edu", password: "mypassword" });

    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("test@ucr.edu", "mypassword");
    });
  });

  test("redirects to dashboard on successful login", async () => {
    loginMock.mockResolvedValue({ success: true });

    render(<LoginPage />);

    fillForm({ email: "user@ucr.edu", password: "123456" });

    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows backend error when login fails", async () => {
    loginMock.mockResolvedValue({ success: false, error: "Incorrect password" });

    render(<LoginPage />);

    fillForm({ email: "user@ucr.edu", password: "wrong" });

    fireEvent.click(screen.getByText("Log In"));

    expect(await screen.findByText("Incorrect password")).toBeInTheDocument();
  });
});
