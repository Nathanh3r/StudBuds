import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../../src/app/signup/page';
import { useAuth } from '../../src/app/context/AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('../../src/app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SignupPage Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows validation error when email is not .edu", async () => {

    // mock signup function
    useAuth.mockReturnValue({
      signup: jest.fn(),
    });

    render(<SignupPage />);

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "John Doe" }});
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), { target: { value: "test@gmail.com" }});
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "password123" }});
    fireEvent.change(screen.getByPlaceholderText("Biology, Computer Science, etc."), { target: { value: "CS" }});

    // submit
    fireEvent.click(screen.getByText("Sign Up"));

    expect(await screen.findByText("Must use .edu email")).toBeInTheDocument();
  });


  test("calls signup() with correct values", async () => {

    const signupMock = jest.fn().mockResolvedValue({ success: false, error: "Test error" });

    useAuth.mockReturnValue({
      signup: signupMock,
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "John Doe" }});
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), { target: { value: "john@school.edu" }});
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "mypassword" }});
    fireEvent.change(screen.getByPlaceholderText("Biology, Computer Science, etc."), { target: { value: "Biology" }});

    fireEvent.click(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(signupMock).toHaveBeenCalledWith(
        "John Doe",
        "john@school.edu",
        "mypassword",
        "Biology"
      );
    });
  });

  test("redirects to dashboard on successful signup", async () => {
    
    useAuth.mockReturnValue({
      signup: jest.fn().mockResolvedValue({ success: true }),
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "John Doe" }});
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), { target: { value: "john@school.edu" }});
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "mypassword" }});
    fireEvent.change(screen.getByPlaceholderText("Biology, Computer Science, etc."), { target: { value: "CS" }});

    fireEvent.click(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });


  test("shows error message when signup fails", async () => {

    useAuth.mockReturnValue({
      signup: jest.fn().mockResolvedValue({ success: false, error: "Signup failed" }),
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "John Doe" }});
    fireEvent.change(screen.getByPlaceholderText("johndoe@university.edu"), { target: { value: "john@school.edu" }});
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "mypassword" }});
    fireEvent.change(screen.getByPlaceholderText("Biology, Computer Science, etc."), { target: { value: "CS" }});

    fireEvent.click(screen.getByText("Sign Up"));

    expect(await screen.findByText("Signup failed")).toBeInTheDocument();
  });

});
