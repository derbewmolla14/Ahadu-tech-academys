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
          backgroundImage: `linear-gradient(to right, rgba(15, 27, 61, 0.7) 20%, rgba(15, 27, 61, 0.3) 100%), url('/background-pattern.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 0%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Well come to <br />
              Ahadu Tech Academy<br />
              Master Change with <br /> 
              Continuous Learning!
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

      {/* COURSE CARDS GRID */}
      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto px-4">
        
        {/* ELEMENTARY LEARNING CARD */}
        <Link to="/elementary" className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="text-6xl">📚</div>
          </div>
          
          <div className="p-6">
            <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">
              Elementary Learning
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Foundation Building
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Explore beginner-friendly lessons and introductory resources designed for young learners.
            </p>
            
            <hr className="border-gray-200 mb-6" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Perfect for beginners</span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                Start Now →
              </button>
            </div>
          </div>
        </Link>

        {/* HIGH SCHOOL LEARNING CARD */}
        <Link to="/highschool" className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <div className="text-6xl">🎓</div>
          </div>
          
          <div className="p-6">
            <div className="text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
              High School Learning
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Advanced Preparation
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Access high school courses, tutorials, and comprehensive exam preparation materials.
            </p>
            
            <hr className="border-gray-200 mb-6" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Grades 9-12</span>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                Explore →
              </button>
            </div>
          </div>
        </Link>

        {/* UNIVERSITY COURSES CARD */}
        <Link to="/university" className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <div className="text-6xl">🏛️</div>
          </div>
          
          <div className="p-6">
            <div className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-2">
              University Courses
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Higher Education
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Browse departments, select your year, and access comprehensive course materials.
            </p>
            
            <hr className="border-gray-200 mb-6" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Degree programs</span>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                Start Learning →
              </button>
            </div>
          </div>
        </Link>

        {/* CODING PRACTICE CARD */}
        <Link to="/coding" className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <div className="text-6xl">💻</div>
          </div>
          
          <div className="p-6">
            <div className="text-sm font-medium text-orange-600 uppercase tracking-wide mb-2">
              Coding Practice
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Skill Development
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Practice coding problems, improve your programming skills, and build real projects.
            </p>
            
            <hr className="border-gray-200 mb-6" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Interactive coding</span>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                Practice Now →
              </button>
            </div>
          </div>
        </Link>

      </div>

      {/* WHY CHOOSE AHADU TECH ACADEMY SECTION */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]  bg-white border border-gray-200/5 rounded-3xl shadow-lg px-8 py-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          
          {/* LEFT SIDE - Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Why Choose Ahadu Tech Academy?
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Join thousands of Ethiopian students who are transforming their future through our comprehensive digital learning platform.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Comprehensive Curriculum</h3>
                  <p className="text-gray-600">From elementary to university level, covering all major subjects and specializations.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Expert-Led Content</h3>
                  <p className="text-gray-600">Learn from experienced educators and industry professionals with real-world expertise.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible Learning</h3>
                  <p className="text-gray-600">Study anytime, anywhere with our mobile-friendly platform and offline access options.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Practical Skills Focus</h3>
                  <p className="text-gray-600">Emphasis on hands-on learning, coding practice, and real-world application of knowledge.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ethiopian Context</h3>
                  <p className="text-gray-600">Content tailored for Ethiopian students with local examples and cultural relevance.</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* RIGHT SIDE - Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border border-gray-200/20">
                <div className="w-72 h-72 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-8xl md:text-9xl mb-4">👨‍🎓</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Student Success</h3>
                    <p className="text-gray-600 text-sm md:text-base">Empowering Ethiopian learners</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">🎓</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-xl">📚</span>
              </div>
            </div>
          </div>
          
        </div>
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">🎓</span>
              <h1 className="text-2xl font-bold tracking-wide">
                AHADU <span className="block">ACADEMY</span>
              </h1>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <a href="https://www.facebook.com/share/1Gno8odoVq/" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200 transition-colors">f</a>
              <a href="https://www.linkedin.com/in/molla-hydro-os-dev" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200 transition-colors">in</a>
              <a href="https://youtu.be/6G3CzmEyZPM?si=Stwdn9uBhoeHHn1x" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200 transition-colors">▶</a>
              <a href="https://whatsapp.com/dl/" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200 transition-colors">📱</a>
              <a href="https://t.me/alluniversity11fastinfo" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-slate-200 transition-colors">✈</a>
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
