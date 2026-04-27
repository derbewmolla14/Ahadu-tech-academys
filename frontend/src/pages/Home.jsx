import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <h1 className="text-4xl font-semibold text-white">Welcome to Ahadu Tech Academy</h1>
        <p className="mt-3 text-slate-400">Choose a path to continue your learning journey.</p>
      
      <h1>
          እኔ ሞላ ደርበው እባላለሁ። በወሎ ዩኒቨርሲቲ (Kombolcha Institute of Technology) የ3ኛ ዓመት የሶፍትዌር ኢንጂነሪንግ እና የውሃ ምህንድስና
                ተማሪ ነኝ። ይህ ጥምር እውቀት በሃገራችን ያለውን የውሃ አያያዝ ሥርዓት ለማዘመን ትልቅ አቅም ሰጥቶኛል።
      </h1><br /><br />
      <p>
        1. The Froude Number ($F_r$)The Froude Number is the primary criterion for determining the state of flow. It represents the ratio of inertial forces to gravitational forces.
          2. Characteristics of Critical FlowWhen flow is in a critical state, several unique conditions occur:
          Specific Energy: Is at its absolute minimum for a given discharge.
          Discharge: Is at its absolute maximum for a given specific energy.
          Velocity Head: Is equal to half the hydraulic mean depth ($V^2/2g = D/2$).
          Stability: The water surface is often unstable, characterized by a series of standing waves.
      </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Link to="/elementary" className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-2xl font-semibold text-white">Elementary Learning</h2>
          <p className="mt-3 text-slate-400">Explore beginner-friendly lessons and introductory resources.</p>
        </Link>
        <Link to="/highschool" className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-2xl font-semibold text-white">High School Learning</h2>
          <p className="mt-3 text-slate-400">Access high school courses, tutorials, and exam prep.</p>
        </Link>
        <Link to="/university" className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-2xl font-semibold text-white">University Courses</h2>
          <p className="mt-3 text-slate-400">Browse departments, select your year, and open course materials.</p>
        </Link>
        <Link to="/coding" className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:border-blue-500 hover:bg-slate-800">
          <h2 className="text-2xl font-semibold text-white">Coding Practice</h2>
          <p className="mt-3 text-slate-400">Practice coding problems and improve your skills.</p>
        </Link>
      </div>
    </div>
  );
}
