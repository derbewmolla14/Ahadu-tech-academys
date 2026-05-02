import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// Sample course materials data
const courseMaterials = {
  // Water Engineering courses
  'water-eng-1': {
    title: 'Hydrology',
    notes: [
      { chapter: 'Chapter 1', title: 'Introduction to Hydrology', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Precipitation and Measurement', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Evaporation and Transpiration', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Infiltration and Runoff', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Groundwater Hydrology', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Hydrologic Cycle', duration: '20 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Rainfall Analysis', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Stream Flow Measurement', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Watershed Management', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is the hydrologic cycle?', answer: 'The hydrologic cycle is the continuous movement of water on, above, and below the surface of the Earth.' },
      { chapter: 'Chapter 2', question: 'How is rainfall intensity measured?', answer: 'Rainfall intensity is measured using rain gauges and is expressed in mm/hr or in/hr.' },
      { chapter: 'Chapter 3', question: 'What factors affect evaporation?', answer: 'Temperature, humidity, wind speed, and water surface area affect evaporation rates.' },
      { chapter: 'Chapter 4', question: 'What is infiltration capacity?', answer: 'Infiltration capacity is the maximum rate at which water can enter the soil surface.' },
    ],
    practice: [
      { title: 'Hydrology Problem Set 1', type: 'PDF', url: '#' },
      { title: 'Rainfall Data Analysis Assignment', type: 'Excel', url: '#' },
      { title: 'Watershed Delineation Project', type: 'Guide', url: '#' },
      { title: 'Mid-term Exam 2023', type: 'PDF', url: '#' },
      { title: 'Final Exam 2023', type: 'PDF', url: '#' },
    ],
  },
  'water-eng-2': {
    title: 'Reinforced Concrete (RC)',
    notes: [
      { chapter: 'Chapter 1', title: 'Properties of Concrete', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Reinforcement Steel', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'RC Beam Design', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'RC Column Design', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Slab Design', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Concrete Mix Design', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Steel Reinforcement', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Beam Analysis and Design', duration: '40 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Column Design Principles', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Slab Systems', duration: '45 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is the compressive strength of concrete?', answer: 'Compressive strength typically ranges from 20-50 MPa for normal concrete.' },
      { chapter: 'Chapter 2', question: 'What are the grades of reinforcement steel?', answer: 'Common grades are Fe415, Fe500, and Fe550 with yield strengths of 415, 500, and 550 MPa respectively.' },
      { chapter: 'Chapter 3', question: 'How is beam reinforcement calculated?', answer: 'Beam reinforcement is calculated based on moment capacity requirements using steel area formulas.' },
    ],
    practice: [
      { title: 'RC Design Problems', type: 'PDF', url: '#' },
      { title: 'Structural Analysis Assignment', type: 'AutoCAD', url: '#' },
      { title: 'Concrete Mix Design Lab', type: 'Guide', url: '#' },
      { title: 'Final Project: Building Design', type: 'Report', url: '#' },
    ],
  },
  'water-eng-3': {
    title: 'Open Channel Flow',
    notes: [
      { chapter: 'Chapter 1', title: 'Introduction to Open Channels', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Uniform Flow', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Gradually Varied Flow', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Rapidly Varied Flow', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Channel Design', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Channel Flow Fundamentals', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Manning Equation', duration: '20 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Water Surface Profiles', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Hydraulic Jump', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is open channel flow?', answer: 'Open channel flow is flow with a free surface exposed to atmospheric pressure.' },
      { chapter: 'Chapter 2', question: 'What is Manning\'s equation used for?', answer: 'Manning\'s equation is used to calculate uniform flow velocity in open channels.' },
      { chapter: 'Chapter 3', question: 'What are the different types of water surface profiles?', answer: 'M1, M2, M3, S1, S2, S3, C1, C2, C3, A2, A3 profiles based on channel slope and flow depth.' },
    ],
    practice: [
      { title: 'Channel Design Problems', type: 'PDF', url: '#' },
      { title: 'Flow Measurement Lab', type: 'Guide', url: '#' },
      { title: 'Hydraulic Modeling Assignment', type: 'Software', url: '#' },
      { title: 'Field Visit Report', type: 'Document', url: '#' },
    ],
  },
  'water-eng-4': {
    title: 'Irrigation Structures',
    notes: [
      { chapter: 'Chapter 1', title: 'Irrigation Principles', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Dams and Reservoirs', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Canals and Channels', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Gates and Regulators', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Drainage Systems', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Irrigation System Design', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Dam Engineering', duration: '40 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Canal Construction', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Flow Control Structures', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is irrigation efficiency?', answer: 'Irrigation efficiency is the ratio of water used beneficially to water delivered to the field.' },
      { chapter: 'Chapter 2', question: 'What are the main types of dams?', answer: 'Gravity dams, arch dams, buttress dams, and embankment dams.' },
      { chapter: 'Chapter 3', question: 'How is canal alignment determined?', answer: 'Canal alignment considers topography, geology, land use, and construction costs.' },
    ],
    practice: [
      { title: 'Dam Design Project', type: 'Report', url: '#' },
      { title: 'Irrigation System Layout', type: 'AutoCAD', url: '#' },
      { title: 'Water Distribution Problems', type: 'PDF', url: '#' },
      { title: 'Field Survey Assignment', type: 'GPS', url: '#' },
    ],
  },
  'water-eng-5': {
    title: 'Fluid Mechanics',
    notes: [
      { chapter: 'Chapter 1', title: 'Properties of Fluids', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Fluid Statics', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Fluid Dynamics', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Flow Measurement', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Dimensional Analysis', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Fluid Properties', duration: '20 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Pressure and Buoyancy', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Bernoulli Equation', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Flow Measurement Devices', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is viscosity?', answer: 'Viscosity is the measure of a fluid\'s resistance to shear stress.' },
      { chapter: 'Chapter 2', question: 'What is Pascal\'s law?', answer: 'Pascal\'s law states that pressure applied to a confined fluid is transmitted equally in all directions.' },
      { chapter: 'Chapter 3', question: 'What is Reynolds number?', answer: 'Reynolds number is a dimensionless number that determines the nature of flow (laminar or turbulent).' },
    ],
    practice: [
      { title: 'Fluid Properties Lab', type: 'Guide', url: '#' },
      { title: 'Pipe Flow Problems', type: 'PDF', url: '#' },
      { title: 'Flow Measurement Assignment', type: 'Report', url: '#' },
      { title: 'CFD Simulation Project', type: 'Software', url: '#' },
    ],
  },
  'water-eng-6': {
    title: 'Hydraulics',
    notes: [
      { chapter: 'Chapter 1', title: 'Hydraulic Principles', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Pipe Flow', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Pump Systems', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Hydraulic Machinery', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'System Design', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Hydraulic Systems', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Pipe Network Analysis', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Pump Selection and Design', duration: '40 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Valve and Fitting Design', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What is hydraulic grade line?', answer: 'Hydraulic grade line represents the sum of pressure head and elevation head in a hydraulic system.' },
      { chapter: 'Chapter 2', question: 'What is Darcy-Weisbach equation?', answer: 'Darcy-Weisbach equation calculates frictional head loss in pipes: hf = f * (L/D) * (V²/2g).' },
      { chapter: 'Chapter 3', question: 'How are pumps selected?', answer: 'Pumps are selected based on required flow rate, head, efficiency, and system curve matching.' },
    ],
    practice: [
      { title: 'Pipe System Design', type: 'Software', url: '#' },
      { title: 'Pump Performance Analysis', type: 'Excel', url: '#' },
      { title: 'Hydraulic Circuit Design', type: 'AutoCAD', url: '#' },
      { title: 'System Optimization Project', type: 'Report', url: '#' },
    ],
  },
  'water-eng-7': {
    title: 'Water Supply Engineering',
    notes: [
      { chapter: 'Chapter 1', title: 'Water Demand Analysis', type: 'PDF', url: '#' },
      { chapter: 'Chapter 2', title: 'Water Sources', type: 'PDF', url: '#' },
      { chapter: 'Chapter 3', title: 'Water Treatment', type: 'PDF', url: '#' },
      { chapter: 'Chapter 4', title: 'Distribution Systems', type: 'PDF', url: '#' },
      { chapter: 'Chapter 5', title: 'Water Quality', type: 'PDF', url: '#' },
    ],
    videos: [
      { topic: 'Water Demand Forecasting', duration: '25 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Source Water Protection', duration: '30 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Treatment Plant Design', duration: '40 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { topic: 'Distribution Network Design', duration: '35 min', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    qa: [
      { chapter: 'Chapter 1', question: 'What are the components of water demand?', answer: 'Domestic, industrial, commercial, public, fire fighting, and losses/unaccounted for water.' },
      { chapter: 'Chapter 2', question: 'What are the main sources of water supply?', answer: 'Surface water (rivers, lakes), groundwater (wells, springs), and rainwater harvesting.' },
      { chapter: 'Chapter 3', question: 'What is coagulation in water treatment?', answer: 'Coagulation is the process of adding chemicals to destabilize particles and form flocs.' },
    ],
    practice: [
      { title: 'Water Treatment Plant Design', type: 'Report', url: '#' },
      { title: 'Distribution System Analysis', type: 'EPANET', url: '#' },
      { title: 'Water Quality Testing Lab', type: 'Guide', url: '#' },
      { title: 'Demand Forecasting Assignment', type: 'Excel', url: '#' },
    ],
  },
};

export default function CourseDetail() {
  const { name, courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const faculty = searchParams.get('faculty');
  const level = searchParams.get('level');
  const department = searchParams.get('department');
  const year = searchParams.get('year');
  const [activeTab, setActiveTab] = useState('ppt');

  const courseData = useMemo(() => {
    return courseMaterials[courseId] || {
      title: 'Course Not Found',
      ppt: [],
      videos: [],
      notes: [],
      extra: [],
    };
  }, [courseId]);

  const tabs = [
    { id: 'notes', label: '📄 Notes', count: courseData.notes.length },
    { id: 'videos', label: '🎥 Video Lessons', count: courseData.videos.length },
    { id: 'qa', label: '📝 Q&A', count: courseData.qa.length },
    { id: 'practice', label: '📚 Practice Materials', count: courseData.practice.length },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="space-y-6">
            {courseData.notes.map((note, index) => (
              <div key={index} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h3 className="font-medium text-white">{note.chapter}: {note.title}</h3>
                      <p className="text-sm text-slate-400">{note.type} Document</p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500">
                    Download
                  </button>
                </div>
              </div>
            ))}
            {!courseData.notes.length && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                No notes available for this course.
              </div>
            )}
          </div>
        );

      case 'videos':
        return (
          <div className="space-y-6">
            {courseData.videos.map((video, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎥</span>
                  <div>
                    <h3 className="font-medium text-white">{video.topic}</h3>
                    <p className="text-sm text-slate-400">{video.duration}</p>
                  </div>
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
                  <iframe
                    src={video.url}
                    title={video.topic}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
            {!courseData.videos.length && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                No video lessons available for this course.
              </div>
            )}
          </div>
        );

      case 'qa':
        return (
          <div className="space-y-6">
            {courseData.qa.map((item, index) => (
              <div key={index} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                <div className="mb-4">
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300 mb-3 inline-block">
                    {item.chapter}
                  </span>
                  <h3 className="text-lg font-medium text-white mb-3">{item.question}</h3>
                </div>
                <div className="rounded-lg bg-slate-900 p-4 border-l-4 border-sky-500">
                  <p className="text-slate-300">{item.answer}</p>
                </div>
              </div>
            ))}
            {!courseData.qa.length && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                No Q&A materials available for this course.
              </div>
            )}
          </div>
        );

      case 'practice':
        return (
          <div className="space-y-4">
            {courseData.practice.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.type} File</p>
                  </div>
                </div>
                <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500">
                  Download
                </button>
              </div>
            ))}
            {!courseData.practice.length && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
                No practice materials available for this course.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{courseData.title}</h1>
            <p className="mt-2 text-slate-400">
              University: {name.replace(/-/g, ' ')} • {department || faculty} • {year || level}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            ← Back to Courses
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/50">
        <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Notes</p>
          <p className="mt-2 text-xl font-semibold text-white">{courseData.notes.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Video Lessons</p>
          <p className="mt-2 text-xl font-semibold text-white">{courseData.videos.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Q&A</p>
          <p className="mt-2 text-xl font-semibold text-white">{courseData.qa.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Practice Materials</p>
          <p className="mt-2 text-xl font-semibold text-white">{courseData.practice.length}</p>
        </div>
      </div>
    </div>
  );
}