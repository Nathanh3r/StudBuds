'use client'; 


import { useState } from 'react'; // React hook to store and update input form values.
import { useRouter } from 'next/navigation'; // Next.js router for going to signup
import Link from 'next/link'; // Clients to login page.
import { useAuth } from '../context/AuthContext'; // Custom authentication context for signup/login

//main signup page 
export default function SignupPage() {

  /* name input field */
  const [name, setName] = useState('');

  /*  email input field */
  const [email, setEmail] = useState('');

  /*  password input field */
  const [password, setPassword] = useState('');

  /*  major input field */
  const [major, setMajor] = useState('');

  /* displays error messages on screen */
  const [error, setError] = useState('');

  /* for redirecting user after successful signup */
  const router = useRouter();

  /* Pull signup() function from AuthContext */
  const { signup } = useAuth();

 //submission handeling
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents full page reload when form is submitted.
    setError(''); // Reset any previous errors.

    /* .edu validation: requires university email */
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Must use .edu email'); // Set error and stop.
      return;
    }

    // Call the signup() function with fields from the form
    const result = await signup(name, email, password, major);

    // If signup successful go to dashboard
    if (result.success) {
      router.push('/dashboard');
    } else {
      // If signup failed go to error
      setError(result.error);
    }
  };

  /* signup page ui*/
  return (
    <div className="min-h-screen bg-slate-50 flex"> {/* grey background */}

      {/* on the left Gradient background and picture */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-purple-700 via-indigo-600 to-pink-500 justify-center items-center relative">
        
        {/* glow blobs layered under the pictures */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-10 w-72 h-72 bg-indigo-400/40 blur-3xl rounded-full" /> {/* Top-left glow */}
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-400/40 blur-3xl rounded-full" /> {/* Bottom-right glow */}
        </div>

        {/* on the left we got  picture logo and text */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">

          <h1 className="text-3xl font-semibold text-white">StudBuds</h1> {/* name */}

          <img
            src="/peeps.svg" // Loads signup pic
            alt="Signup pic"
            className="w-72 h-72 object-contain drop-shadow-xl" // Large clean pic
          />

          {/* Text block under image */}
          <div className="space-y-2 text-white">
            <p className="text-lg font-semibold">
              Join a community of focused learners {/* Tagline */}
            </p>
            <p className="text-xs text-indigo-100 max-w-xs mx-auto">
              Match with study partners, share notes, and build better habits. {/* Description */}
            </p>
          </div>
        </div>
      </div>

      {/* on the right: Signup Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md"> {/* form box */}

          {/* Heading above the form */}
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Create your <br className="hidden sm:block" />
            StudBuds Account
          </h2>

          {/* Display error message if error exists */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2">
              {error}
            </div>
          )}

          {/* SIGNUP FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* enter name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                type="text" // Plain text input
                required // Required field
                value={name} // State value
                onChange={(e) => setName(e.target.value)} // Update state on type
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black" // Styling
                placeholder="John Doe" // Placeholder
              />
            </div>

            {/* enter email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Email (.edu)</label>
              <input
                type="email" // Email format checker (browser)
                required // Must fill in
                value={email} // Controlled component
                onChange={(e) => setEmail(e.target.value)} // Handles user typing
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black"
                placeholder="johndoe@university.edu" // Example .edu email
              />
            </div>

            {/* enter password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input
                type="password" // Hidden text format
                required // Must fill
                value={password} // Controlled value
                onChange={(e) => setPassword(e.target.value)} // Update password
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black"
                placeholder="••••••••" // Hidden characters placeholder
              />
            </div>

            {/* enter major  */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Major</label>
              <input
                type="text" // Text input
                required // Required field
                value={major} // Controlled field
                onChange={(e) => setMajor(e.target.value)} // Update state
                className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm outline-none focus:border-indigo-500 text-black"
                placeholder="Biology, Computer Science, etc." // Example majors
              />
            </div>

            {/* SUBMIT  */}
            <button
              type="submit" // Submits the form
              className="mt-2 w-32 rounded-full bg-indigo-500 text-white py-2.5 text-sm font-semibold shadow-md hover:bg-indigo-400 transition ml-auto block text-center"
            >
              Sign Up {/* Button text */}
            </button>
          </form>

          {/* LOGIN REDIRECT LINK for login below*/}
          <p className="mt-8 text-xs text-slate-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-black">
              Login {/* Link to login page */}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
