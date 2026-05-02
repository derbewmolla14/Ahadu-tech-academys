import { Link } from 'react-router-dom';
import { useState } from 'react';
export default function Home() {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <div className="space-y-8">
           {/* 1. HERO SECTION */}
      <section 
        className="relative h-[800px] w-full flex items-center bg-[#0f1b3d] w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#0f1b3d] text-white px-8 py-10"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(15, 27, 61, 0.95) 20%, rgba(15, 27, 61, 0.4) 100%), url('/background-pattern.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 0%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4"><h1>Well come to Ahadu Tech Academy</h1><br />
              Master Change with <br /> Continuous Learning!
            </h1>
            <p className="text-lg md:text-xl font-light opacity-90 mb-10">
              Unlock opportunities through certified courses from top African universities.
            </p>

            {/* Hero Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-[#ff9800] hover:bg-[#e68900] text-white px-10 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                Universities
              </button>
              
              {/* 3. TOGGLE BUTTON: Changes state on click */}
              <button 
                onClick={() => setShowDetail(!showDetail)}
                className="border-2 border-white hover:bg-white hover:text-[#0f1b3d] text-white px-10 py-3 rounded-full font-bold transition-all transform hover:scale-105"
              >
                {showDetail ? 'Hide Details' : 'Continue Learning Detail'}
              </button>
            </div>

            {/* 4. CONDITIONAL WELCOME SECTION: Only shows if showDetail is true */}
            {showDetail && (
              <div className="mt-8 animate-fade-in-down">
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-8 shadow-2xl">
                  <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">
                    Welcome to Ahadu Tech Academy
                  </h2>
                  <div className="text-white space-y-4 leading-relaxed text-base opacity-90">
                    <p>
                      Ahadu Tech Academy is a modern digital learning platform designed to support students from Elementary school up to University level.
                    </p>
                    <p>
                      The platform bridges the gap between traditional learning and modern technology, organizing content by academic level, department, and course.
                    </p>
                    <p className="font-semibold text-orange-300">
                      Start your journey today by selecting your learning path below!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Link to="/elementary" className="rounded-3xl border border-slate-600 bg-slate-800 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-3xl font-semibold text-white">Elementary Learning</h2>
          <p className="mt-4 text-slate-400">Explore beginner-friendly lessons and introductory resources.</p>
        </Link>
        <Link to="/highschool" className="rounded-3xl border border-slate-600 bg-slate-800 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-3xl font-semibold text-white">High School Learning</h2>
          <p className="mt-4 text-slate-400">Access high school courses, tutorials, and exam prep.</p>
        </Link>
        <Link to="/university" className="rounded-3xl border border-slate-600 bg-slate-800 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-3xl font-semibold text-white">University Courses</h2>
          <p className="mt-4 text-slate-400">Browse departments, select your year, and open course materials.</p>
        </Link>
        <Link to="/coding" className="rounded-3xl border border-slate-600 bg-slate-800 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-3xl font-semibold text-white">Coding Practice</h2>
          <p className="mt-4 text-slate-400">Practice coding problems and improve your skills.</p>
        </Link>
      </div>
      {/* FULL WIDTH FOOTER */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#0f1b3d] text-white px-8 py-10">

        <div className="grid md:grid-cols-3 gap-10 items-start">

          {/* LEFT - Useful Links */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Useful Links</h2>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Frequently Asked Questions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms Of Use</a></li>
              <li><a href="#" className="hover:text-white">Login</a></li>
            </ul>
          </div>

          {/* CENTER - LOGO + SOCIAL */}
          <div className="text-center border-l border-r border-slate-700 px-6">
            <h1 className="text-2xl font-bold tracking-wide mb-4">
              AHADU <span className="block">ACADEMY</span>
            </h1>

            <div className="flex justify-center gap-4 mb-4">
              <a href="#" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200">f</a>
              <a href="#" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200">in</a>
              <a href="#" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200">▶</a>
            </div>

            <p className="text-sm text-slate-300">
              © {new Date().getFullYear()} ahadutechacademy.com
            </p>

            <p className="text-orange-400 mt-2 text-sm">
              Powered by Ahadu Tech Academy
            </p>
          </div>

          {/* RIGHT - CONTACTS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Contacts</h2>

            <div className="space-y-3 text-slate-300">
              <p>📍 Woldia, Ethiopia</p>
              <p>📞 +251-924-12-28-93</p>
              <p>📞 +251-937-10-05-47</p>
              <p>✉ derbewmolla14@g</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
