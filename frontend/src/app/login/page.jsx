"use client"; 

import { useState } from "react"; //for use of form state
import { useRouter } from "next/navigation"; // router for navigation to login
import Link from "next/link"; // Link for clients navigation to signup page.
import { useAuth } from "../context/AuthContext"; // Custom context hook to access login function.

/* MAIN LOGIN PAGE */
export default function LoginPage() {
  /* Email: stores the user input for the email field */
  const [email, setEmail] = useState("");

  /* Password: stores the password input */
  const [password, setPassword] = useState("");

  /* error: stores any error returned by backend login */
  const [error, setError] = useState("");

  /* loading: shows loading text */
  const [loading, setLoading] = useState(false);

  /* router: guieds to login  */
  const router = useRouter();

  /* gives us the login() function */
  const { login } = useAuth();

  /*  triggered when user submits the login form */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submission.
    setError(""); // Clear previous errors.
    setLoading(true); // Start loading animation.

    /* .edu validation checks if email ends in .edu school accounts only */
    if (!email.toLowerCase().endsWith(".edu")) {
      setError("You must use a .edu email address to log in."); // show error
      setLoading(false); // stop loading
      return; // stop form submitting
    }

    const result = await login(email, password); // Call login function from AuthContext.

    setLoading(false); // Stop loading.

    // If login succeeded go to dashboard
    if (result.success) {
      router.push("/dashboard");
    } else {
      // If login failed go to display error message
      setError(result.error || "Login failed");
    }
  };

  /* JSX UI FOR LOGIN PAGE */
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* on the left gradient background and the picture */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-purple-700 via-indigo-600 to-pink-500 justify-center items-center relative">
        
        {/* glow blobs layered under the picture */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Indigo glow circle */}
          <div className="absolute -top-24 -left-10 w-72 h-72 bg-indigo-400/40 blur-3xl rounded-full" />
          {/* Pink glow circle */}
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-400/40 blur-3xl rounded-full" />
        </div>

        {/* on the left side logo + picture + tagline */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
          {/* Page title on the left side */}
          <h1 className="text-3xl font-semibold text-white">StudBuds</h1>

          {/*  image */}
          <img
            src="/study.svg" // takes in image from public
            alt="Studying pic"
            className="w-72 h-72 object-contain drop-shadow-xl"
          />

          {/* Text under picture*/}
          <div className="space-y-2 text-white">
            {/* Subheading */}
            <p className="text-lg font-semibold">
              Find your study crew. Stay accountable.
            </p>

            {/* Supporting description text */}
            <p className="text-xs text-indigo-100 max-w-xs mx-auto">
              StudBuds helps you connect with motivated students, match by
              major or classes, and conquer your workload together.
            </p>
          </div>
        </div>
      </div>

      {/* on the right side Login Form Section */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12">
        {/* Container for the login box */}
        <div className="w-full max-w-md">
          {/* Heading text above login form */}
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Welcome back to the <br className="hidden sm:block" />
            StudBuds Community
          </h2>

          {/* shows up only if error is set */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL FIELD */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Email or Username
              </label>
              <input
                type="email" // Input validation for email format
                required // Prevents empty submissions
                value={email} // Controlled input value
                onChange={(e) => setEmail(e.target.value)} // Update email state
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black"
                placeholder="johndoe@university.edu" // Input placeholder text
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>
              <input
                type="password" // Masks the text visually
                required // Prevents empty submissions
                value={password} // Controlled password state
                onChange={(e) => setPassword(e.target.value)} // Update password state
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black"
                placeholder="••••••••" // Styled placeholder
              />
            </div>

            {/* REMEMBER ME CHECKBOX */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" // Checkbox input
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit" // Makes this button submit the form
              disabled={loading} // Disables button when loading is true
              className="mt-2 w-32 rounded-full bg-indigo-500 text-white py-2.5 text-sm font-semibold shadow-md hover:bg-indigo-400 transition disabled:bg-indigo-400/70 ml-auto block text-center"
            >
              {/* Show different text based on loading state */}
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* BOTTOM SIGN-UP LINK */}
          <p className="mt-8 text-xs text-slate-500 text-center">
            No Account yet?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
