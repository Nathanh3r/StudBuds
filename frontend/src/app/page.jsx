"use client";

import Link from "next/link";
import { 
  Users, BookOpen, Trophy, MessageSquare, FileText,
  Target, Sparkles, Calendar, Bell, Share2, Heart,
  Lightbulb, Rocket, Star, Zap, TrendingUp, Award
} from "lucide-react";

/* NAVBAR COMPONENT
  Clean top navigation bar - transparent and not sticky
*/
function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Brand logo and name */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-gray-900">StudBuds</span>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition font-medium shadow-lg shadow-indigo-500/30"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* HERO SECTION
  Main landing section with centered content
*/
function Hero() {
  return (
    <section className="h-screen snap-start flex items-center justify-center px-6 relative">
      <div className="text-center max-w-4xl">
        {/* Main heading */}
        <h1 className="text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Level up
          <br />
          your learning experience.
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A smarter way for students to connect, collaborate, and level up their
          learning, all in one place.
        </p>

        {/* CTA Button with animated gradient */}
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-full hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 transition font-medium text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transform animate-horizontal-gradient"
        >
          Sign Up For Free
        </Link>
      </div>
    </section>
  );
}

/* STATS SECTION
  Stats with scattered university logos
*/
function StatsSection() {
  return (
    <section className="h-screen snap-start flex items-center justify-center px-6 relative">
      {/* University logos scattered randomly */}
      <div className="absolute inset-0 max-w-7xl mx-auto">
        {/* UCLA - top left */}
        <img 
          className="logo-float-1 absolute top-20 left-12 md:left-60 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/UCLA.svg" 
          alt="UCLA"
        />
        
        {/* UCR - top right */}
        <img 
          src="/UCR.svg" 
          className="logo-float-2 absolute top-32 right-12 md:right-70 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          alt="UCR"
        />
        
        {/* NYU - middle left */}
        <img 
          className="logo-float-3 absolute top-1/2 left-4 md:left-20 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/NYU.svg" 
          alt="NYU"
        />
        
        {/* Harvard - upper middle right */}
        <img 
          className="logo-float-4 absolute top-1/3 right-4 md:right-16 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/Harvard.svg" 
          alt="Harvard"
        />
        
        {/* Berkeley - bottom left */}
        <img 
          className="logo-float-5 absolute bottom-32 left-4 md:left-16 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/berkeley.svg" 
          alt="Berkeley"
        />
        
        {/* Stanford - bottom middle */}
        <img 
          className="logo-float-6 absolute bottom-10 left-140 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/Stanford.svg" 
          alt="Stanford"
        />
        
        {/* Duke - bottom right */}
        <img 
          className="logo-float-7 absolute bottom-40 right-4 md:right-20 w-16 h-16 md:w-28 md:h-28 hover:scale-110 transition-transform cursor-pointer" 
          src="/Duke.svg" 
          alt="Duke"
        />
      </div>

      {/* Stats content */}
      <div className="relative z-10 text-center">
        <p className="text-sm md:text-lg text-gray-500 uppercase tracking-wide mb-4 md:mb-8">
          A growing library of
        </p>
        <div className="space-y-2 md:space-y-4">
          <h2 className="text-7xl font-bold text-gray-900">
            1,560 schools
          </h2>
          <h2 className="text-7xl font-bold text-gray-900">
            25,000 students
          </h2>
          <h2 className="text-7xl font-bold text-gray-900">
            16,000 courses
          </h2>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  const features = [
    { icon: Users, title: "Connect", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: MessageSquare, title: "Collaborate", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: BookOpen, title: "Study better", color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: FileText, title: "Share notes", color: "text-green-600", bg: "bg-green-50" },
    { icon: Trophy, title: "Stay motivated", color: "text-yellow-600", bg: "bg-yellow-50" },
    { icon: Target, title: "Set goals", color: "text-red-600", bg: "bg-red-50" },
    { icon: Sparkles, title: "Track progress", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <section className="h-screen snap-start flex items-center justify-center px-6 relative">
      <div className="max-w-7xl mx-auto text-center">
        {/* Section heading */}
        <h2 className="text-7xl font-bold text-gray-900 mb-12">Our mission</h2>

        {/* Mission description */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-20">
          StudBuds was built to make studying less isolating and more
          collaborative. We help students find classmates, join study sessions,
          and stay motivated through shared progress and a touch of
          gamification. Whether you're preparing for finals or learning something
          new, StudBuds makes it easier and a lot more fun to learn
          together.
        </p>

        {/* Feature icons grid */}
        <div className="flex justify-center items-center gap-12 flex-wrap max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-20 h-20 ${feature.bg} rounded-2xl shadow-lg flex items-center justify-center mb-3 transition-all group-hover:scale-110 duration-300`}>
                  <Icon className={`w-10 h-10 ${feature.color}`} strokeWidth={2} />
                </div>
                <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {feature.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* FOOTER
  Clean footer with links
*/
function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        "Landing Page",
        "Course Builder",
        "Web-design",
        "Courses",
        "Integrations",
      ],
    },
    {
      title: "Use Cases",
      links: [
        "Web-designers",
        "Marketers",
        "Small Business",
        "Website Builder",
      ],
    },
    {
      title: "Resources",
      links: ["Academy", "Blog", "Themes", "Hosting", "Developers", "Support"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "FAQs", "Teams", "Contact Us"],
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-indigo-100">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      className="hover:text-white transition"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-indigo-100">
          <div className="flex gap-6 mb-4 md:mb-0">
            <Link href="#" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition">
              Terms of Use
            </Link>
            <Link href="#" className="hover:text-white transition">
              Sales and Refunds
            </Link>
            <Link href="#" className="hover:text-white transition">
              Legal
            </Link>
            <Link href="#" className="hover:text-white transition">
              Site Map
            </Link>
          </div>
          <p>© {new Date().getFullYear()} StudBuds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* HOMEPAGE MAIN COMPONENT
  Combines all sections with gradient splotch background
*/
export default function HomePage() {
  return (
    <div className="snap-y snap-proximity overflow-y-scroll h-screen relative">
      {/* New gradient background for entire page */}
      <div className="fixed inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 z-0"></div>
      
      {/* Subtle animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 animated-gradient-bg opacity-[0.05]"></div>
      
      {/* Background gradient splotches */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top left splotch */}
        <div 
          className="splotch-1 absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.15 }}
        />
        
        {/* Top right splotch */}
        <div 
          className="splotch-2 absolute top-20 -right-32 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.15 }}
        />
        
        {/* Middle left splotch */}
        <div 
          className="splotch-3 absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.15 }}
        />
        
        {/* Middle right splotch */}
        <div 
          className="splotch-4 absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.1 }}
        />
        
        {/* Bottom right splotch */}
        <div 
          className="splotch-5 absolute bottom-10 right-20 w-[650px] h-[650px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.15 }}
        />
        
        {/* Bottom center splotch */}
        <div 
          className="splotch-6 absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.2 }}
        />

        {/* Additional mid-page splotch */}
        <div 
          className="splotch-7 absolute top-2/3 left-1/4 w-[550px] h-[550px] rounded-full blur-3xl"
          style={{ backgroundColor: '#6366F1', opacity: 0.15 }}
        />
      </div>

      {/* Content - all positioned above splotches */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <StatsSection />
        <Mission />
        <Footer />
      </div>
    </div>
  );
}