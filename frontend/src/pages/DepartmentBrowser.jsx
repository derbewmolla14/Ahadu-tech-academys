import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const departmentMap = {
  Natural: [
    'Electrical Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Water Engineering',
  ],
  Social: [
    'Economics',
    'Law',
    'Business Administration',
    'Accounting',
    'Sociology',
    'Political Science',
  ],
};

export default function DepartmentBrowser() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty') || 'Natural';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [search, setSearch] = useState('');

  const departments = useMemo(() => departmentMap[faculty] || [], [faculty]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => dept.toLowerCase().includes(search.toLowerCase()));
  }, [departments, search]);

  const onDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSidebarOpen(false); // Close sidebar when department is selected
  };

  const onContinue = () => {
    if (selectedDepartment) {
      navigate(`/university/${name}/years?faculty=${encodeURIComponent(faculty)}&department=${encodeURIComponent(selectedDepartment)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with Hamburger Menu */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl">☰</span>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Department Selection</h1>
            <p className="text-sm text-slate-400">{faculty} Sciences • Senior Level</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/university/${name}`)}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
        >
          ← Back
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 h-full w-80 transform border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="border-b border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white">Departments</h2>
              <p className="mt-1 text-sm text-slate-400">Select your department</p>
            </div>

            {/* Search */}
            <div className="border-b border-slate-800 p-4">
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                <span className="text-slate-500">🔍</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search departments..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Department List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredDepartments.map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => onDepartmentSelect(department)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedDepartment === department
                        ? 'border-sky-500 bg-sky-900/20 text-sky-400'
                        : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{department}</span>
                  </button>
                ))}
              </div>

              {!filteredDepartments.length && (
                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4 text-center text-slate-400">
                  No departments found
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            {selectedDepartment ? (
              <div className="space-y-8">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/40">
                  <h2 className="text-3xl font-semibold text-white">Selected Department</h2>
                  <p className="mt-3 text-slate-400">You've selected the following department for your Senior level studies.</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{selectedDepartment}</h3>
                      <p className="mt-2 text-slate-400">{faculty} Sciences Department</p>
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={onContinue}
                        className="rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
                      >
                        Continue →
                      </button>
                      <p className="mt-2 text-xs text-slate-500">Proceed to year selection</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Faculty</p>
                    <p className="mt-2 text-xl font-semibold text-white">{faculty} Sciences</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Level</p>
                    <p className="mt-2 text-xl font-semibold text-white">Senior</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Next Step</p>
                    <p className="mt-2 text-xl font-semibold text-white">Year Selection</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <div className="mb-6 text-6xl">🎓</div>
                  <h2 className="text-2xl font-semibold text-white">Select Your Department</h2>
                  <p className="mt-3 text-slate-400">
                    Use the menu button (☰) to open the sidebar and choose your department from the {faculty} Sciences faculty.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="mt-6 rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-500"
                  >
                    Open Department List
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
