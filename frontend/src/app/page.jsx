"use client"; 

import Link from "next/link"; 
import { useState, useEffect } from "react"; 

/* NAVBAR COMPONENT white bar  
  the top section of the frontpage 
*/
function Navbar() {
  
  return (
    // top element with border, make the background transparent, add bluring effect
    <header className="border-b bg-white/20 backdrop-blur-md text-slate-900 sticky top-0 z-20">
      {/* amke a container */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        {/* on the left side logo and brand name */}
        <div className="flex items-center gap-2">
          {/* dog inside the top of the menu bar */}
          <img
            src="/doggy.png" // doggy image
            alt="StudBuds Logo" // logo
            className="h-10 w-10 object-contain drop-shadow-md" //size
          />
          {/* brand name*/}
          <span className="font-semibold text-sm text-slate-900">
            StudBuds
          </span>
        </div>

        {/* links Sign In Sign Up */}
        <nav className="flex items-center gap-3 text-sm">
          {/* Link to login page */}
          <Link
            href="/login" // Route for login
            className="text-slate-900 hover:text-slate-700 cursor-pointer" // Styling for link text and hover state
          >
            {/* Text for login link */}
            Sign In
          </Link>

          {/* Link to signup page */}
          <Link
            href="/signup" // Route for signup
            className="px-4 py-1.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-400 transition cursor-pointer" // Button size, color, border radius, and hover behavior
          >
            {/* sign up button */}
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* HERO component
  main page section
*/
function Hero() {
  // array for the images inside of the carousel 
  const carouselImages = ["/study2.png", "/study3.png", "/study4.png"];
  // keeps track of current image inside of the carousel
  const [currentImage, setCurrentImage] = useState(0);
  // useEffect allows for the image to be cycled
  useEffect(() => {
    // Create an interval that updates the currentImage every 3 seconds
    const interval = setInterval(
      () => setCurrentImage((prev) => (prev + 1) % carouselImages.length), // Advance index 
      3000 // Interval duration (3 seconds)
    );
    // Cleanup function to clear interval 
    return () => clearInterval(interval);
  }, []); // Empty dependency array = run once on mount only

  //  defines hero area
  return (
    //grid with two columns
    <section className="max-w-6xl mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2 text-white">
      {/* on the left side */}
      <div className="space-y-6">
        {/* Big StudBuds logo doggy with book */}
        <img
          src="/studbudslogo.png" // logo in public
          alt="StudBuds Logo" // alternate
          className="studbuds-logo-wag h-40 w-40 mb-4 drop-shadow-xl" // Size
        />

        {/* built for students badge */}
        <span className="inline-block text-sm font-medium px-4 py-1.5 bg-white/20 rounded-full backdrop-blur">
          🎓 Built for students
        </span>

        {/* Main hero heading with line break */}
        <h1 className="text-5xl font-semibold leading-tight">
          {/* First line of heading text */}
          Level up <br /> {/* Manual line break */}
          {/* Second line of heading text */}
          your learning experience.
        </h1>

        {/* Supporting hero description text */}
        <p className="text-sm max-w-xl text-white/90">
          A smarter way for students to connect, collaborate, and level up their
          learning — all in one place.
        </p>

        {/* linking to signup */}
        <Link
          href="/signup" // going towards the signup page
          className="inline-block mt-3 px-6 py-3 bg-white text-indigo-600 rounded-full shadow 
                     transition transform hover:-translate-y-1 hover:scale-[1.04] hover:shadow-xl" // Size+color
        >
          {/* Text inside signup */}
          Sign Up for Free
        </Link>

        {/* Stats block below  */}
        <div className="mt-6">
          {/* Label above stats */}
          <p className="text-xs uppercase text-white/70">A growing library of</p>
          {/* Stats values stacked vertically */}
          <div className="text-xl font-semibold space-y-1">
            {/* Number of schools */}
            <p>1,560 schools</p>
            {/* Number of students */}
            <p>25,000 students</p>
            {/* Number of courses */}
            <p>16,000 courses</p>
          </div>
        </div>
      </div>

      {/* right card side made shorter vertically */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-7 rounded-3xl shadow-2xl text-white self-start">
        {/* Card heading text */}
        <p className="font-semibold text-center">Study sessions, reimagined</p>

        {/* subheading of the card */}
        <p className="text-[11px] text-white/80 text-center mt-2">
          Find classmates, make study groups, and keep track of your courses.
        </p>

        {/* fixing carousel height and spacing  */}
        <div className="relative w-full h-50 overflow-hidden rounded-2xl mt-4">
          {/* Loop through carouselImages array and make each image in the same position */}
          {carouselImages.map((src, index) => (
            <img
              key={index} // make a unique key for each image based on each image
              src={src} // carousel image
              alt="Study carousel" // Alt text 
              className={`absolute inset-0 w-full h-full object-cover rounded-xl 
                border-4 border-white/30 
                shadow-[0_0_14px_2px_rgba(255,255,255,0.18)]
                transition-opacity duration-700 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`} // Position images on top of each other for each new image and fade out on currentImage
            />
          ))}
        </div>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-left text-[11px]">
          {/* First feature card Find your people */}
          <div className="bg-white/10 border border-white/20 p-3 rounded-xl">
            {/* Feature card title */}
            <p className="font-semibold mb-1">Find your people</p>
            {/* Feature card description */}
            <p className="text-white/70">Filter by course or major.</p>
          </div>

          {/* Stay motivated */}
          <div className="bg-white/10 border border-white/20 p-3 rounded-xl">
            {/* title */}
            <p className="font-semibold mb-1">Stay motivated</p>
            {/* description */}
            <p className="text-white/70">Track streaks and earn XP.</p>
          </div>
        </div>

        {/* tightened spacing & slightly smaller */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Share resources */}
          <Link
            href="/signup" // Link to signup page again
            className="p-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur text-center 
                       transition transform hover:-translate-y-1 hover:scale-[1.04] 
                       hover:shadow-xl hover:bg-white/15 hover:border-white/40" // hover animation
          >
            {/* Icon image */}
            <img
              src="/sharing.svg" // adding image in
              alt="Sharing" // alternate
              className="w-full h-20 object-contain mx-auto drop-shadow-md opacity-90" // size and adjustment
            />
            {/* under sharing icon */}
            <p className="text-[11px] text-white/70 mt-2">Share resources</p>
          </Link>

          {/* Study together */}
          <Link
            href="/signup" // directs to signup page
            className="p-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur text-center 
                       transition transform hover:-translate-y-1 hover:scale-[1.04] 
                       hover:shadow-xl hover:bg-white/15 hover:border-white/40" 
          >
            {/* image for working together */}
            <img
              src="/worktogether.svg" // image included
              alt="Work Together" 
              className="w-full h-20 object-contain mx-auto drop-shadow-md opacity-90" // Size and styling
            />
            {/* Caption under work together icon */}
            <p className="text-[11px] text-white/70 mt-2">Study together</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

/*  MISSION  
  explaining the mission in this section
*/
function Mission() {
  
  return (
    // Section with blurred white background + white text
    <section className="backdrop-blur bg-white/20 py-14 text-white">
      {/* Centered plus max width */}
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Section for mission */}
        <h2 className="text-2xl font-semibold mb-3">Our mission</h2>

        {/* Mission description text */}
        <p className="text-sm max-w-2xl mx-auto text-white/90">
          StudBuds was built to make studying less isolating and more
          collaborative. Join classmates, share notes, and stay motivated.
        </p>

        {/* Grid of three mission cards, active columns */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8 text-sm">
          {/* go through mission card titles to render cards */}
          {["Connect with classmates", "Share resources", "Stay motivated"].map(
            (title, i) => (
              // solo mission card
              <div
                key={i} // Use index as key 
                className="bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-lg" // Card styling
              >
                {/* Card title text */}
                <p className="font-semibold mb-1 text-white">{title}</p>
                {/* Card description text changes based on index */}
                <p className="text-xs text-white/80">
                  {/* If first card: description about classmates */}
                  {i === 0 && "See who’s in your lectures and labs."}
                  {/* If second card: description about resources */}
                  {i === 1 && "Swap notes and study materials."}
                  {/* If third card: description about motivation */}
                  {i === 2 && "Earn XP and keep streaks alive."}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/*  FOOTER HOMEPAGE  
    footer seection
*/
function Footer() {
  
  return (
    //  dark translucent background and blur 
    <footer className="bg-slate-950/60 backdrop-blur py-10 mt-10 text-indigo-100 border-t border-white/10">
      {/*  brand column + 3 nav columns */}
      <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-4 gap-8 text-sm">
        {/* First column with brand name and tagline */}
        <div>
          {/* Brand name */}
          <p className="font-semibold mb-2">StudBuds</p>
          {/* Brand tagline text */}
          <p className="text-xs text-indigo-100/80">
            Study smarter with your campus.
          </p>
        </div>

        {/* Additional columns for Product, Resources, Company */}
        {["Product", "Resources", "Company"].map((section, idx) => (
          // Column container for each section
          <div key={idx}>
            {/* Section title in uppercase with small text */}
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-indigo-200">
              {section}
            </p>
            {/* Unordered list of placeholder nav links */}
            <ul className="space-y-1 text-xs text-indigo-100/80">
              {/* Dashboard */}
              <li>Dashboard</li>
              {/* Courses */}
              <li>Courses</li>
              {/* Study groups */}
              <li>Study groups</li>
            </ul>
          </div>
        ))}
      </div>

      {/* copyright and links  */}
      <div className="max-w-6xl mx-auto px-4 mt-6 border-t border-indigo-700 pt-4 text-[11px] text-indigo-200/80 flex justify-between">
        {/* copyright line */}
        <p>© {new Date().getFullYear()} StudBuds</p>
        {/*  mini links */}
        <div className="flex gap-4">
          {/* Privacy text */}
          <span>Privacy</span>
          {/* Terms text */}
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
}

/* HOMEPAGE  
   -  allows the navbar,hero,mission,and footer to be maade 
*/
export default function HomePage() {
 
  return (
    <>
      {/* Main layout with animated gradient background */}
      <div className="min-h-screen flex flex-col animate-gradient overflow-hidden">
        {/* Top navigation bar */}
        <Navbar />
        {/* Hero section with carousel */}
        <Hero />
        {/* Mission section explaining app purpose */}
        <Mission />
        {/* Footer for links and branding */}
        <Footer />
      </div>

      {/* dog logo animation jiggly setting pivots to be able to add jiggle physics to the dog*/}
      <style jsx global>{`
        .studbuds-logo-wag {
          transform-origin: 70% 70%; /* Set pivot point for rotation, approximating the tail area */
          transition: transform 0.2s ease-out; /* Smooth transition for small transform changes */
        }
        .studbuds-logo-wag:hover {
          animation: studbuds-wag 0.35s ease-in-out infinite alternate; /* Apply wag animation repeatedly on hover */
        }
        @keyframes studbuds-wag {
          0% {
            transform: rotate(0deg); /* Start with no rotation */
          }
          100% {
            transform: rotate(8deg); /* End at a slight 8-degree rotation */
          }
        }
      `}</style>
    </>
  );
}