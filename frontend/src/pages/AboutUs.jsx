import { useState } from "react";

const content = {
  en: {
    eyebrow: "About the academy",
    title: "Learn with purpose. Grow with confidence.",
    intro: "Ahadu Tech Academy is a digital learning platform that brings school, university and coding learning resources together in one place. The website and Android app are designed to help learners find relevant materials, study in an organised way and return to their learning as they progress.",
    overviewTitle: "The platform and the mobile app",
    overviewLead: "One learning experience across the web and Android.",
    overview: [
      "Explore learning paths for Elementary, High School, University and Coding. Available subjects and materials depend on the courses published on the platform.",
      "Open a learning path, choose the relevant grade, department, year or course where available, and work through the materials provided for that selection.",
      "Use your account and dashboard to access learner features. Settings brings together profile, password, appearance, language and app/web update controls.",
      "The Android app uses a local WebView experience and supports the app's offline study-material library where materials have been saved or made available offline. Offline availability can vary by material; connect to the internet to sign in, load new content and check for updates.",
      "The app includes an update area for checking published versions. Web content can receive OTA updates; changes that require native Android code or permissions need a separately published app installation update."
    ],
    stepsTitle: "How to get started and study",
    steps: [
      ["Explore", "Start from Home and choose Elementary, High School, University or Coding. Read the course or level descriptions before choosing."],
      ["Choose your learning area", "Select the grade, university pathway, department, academic year or course options shown for your chosen section."],
      ["Open the material", "Open a lesson or resource and follow its available content in order. Materials may include written notes, documents and other learning resources depending on the course."],
      ["Sign in when needed", "Create an account or sign in to use account-based features such as your dashboard, profile and saved learning resources."],
      ["Use your dashboard and Settings", "Return to the dashboard for learner tools. In Settings, manage your profile, password, appearance and language, and visit App & Web Updates to check for updates."],
      ["Build a steady routine", "Set a realistic study target, work through one topic at a time, take notes, practise what you learn and revisit difficult material. Check your available learning records or progress indicators when provided."]
    ],
    loginTitle: "Signing in and account access",
    login: [
      "Choose Login from the navigation and enter the email address and password associated with your account.",
      "New learners can choose the registration option and provide their name, email and a password. A phone number and profile photo are optional. Use an email address you can access because it is needed for account communication and recovery.",
      "After successful registration or sign-in, the platform takes you to your dashboard. Keep your sign-in details private and sign out on shared devices when you have finished.",
      "If sign-in fails, check that the email is spelled correctly, that Caps Lock is not changing your password, and that your internet connection is working. If the password is forgotten, use Forgot password rather than repeatedly guessing.",
      "If the session appears to have expired, return to Login and sign in again. If the problem continues, note the displayed error and contact the academy through its published support channel."
    ],
    resetTitle: "Forgot password: recovery options",
    resetLead: "The Forgot password page provides email recovery and a Telegram one-time-code option for accounts that have linked Telegram.",
    reset: [
      ["Open recovery", "On the Login page, choose Forgot password. Enter the email address registered to your account."],
      ["Choose email or Telegram", "For email recovery, request a reset link and check your inbox and spam folder. The reset link expires after one hour. For Telegram recovery, choose Telegram Bot OTP; this option requires a Telegram account already linked to your academy account."],
      ["Complete the reset", "Open the email link and set a new password, or enter the six-digit code sent to your linked Telegram account and choose a new password. The Telegram code is valid for 60 seconds and can be used once."],
      ["If nothing arrives or the step expires", "Confirm that you entered the registered email address. Check spam/junk and wait briefly for email delivery. For Telegram, confirm that your account is linked and request a new code after the current one expires. Do not share a reset link or one-time code with anyone."],
      ["Return to Login", "After a successful reset, return to Login and sign in using your new password. If the link is missing, expired or rejected, go back to Forgot password and request a fresh recovery step."]
    ],
    includedTitle: "What you can learn and how learning is presented",
    included: [
      ["Elementary", "Foundation-level learning resources organised for elementary learners, with the available grade and subject content shown in the section."],
      ["High School", "High-school learning materials and exam-preparation resources, organised around the grades and subjects made available."],
      ["University", "A university learning flow for browsing available institutions or pathways, departments, academic years and course resources."],
      ["Coding", "A dedicated coding-learning area for programming practice and skill development. The available exercises and resources depend on what has been published."],
      ["Learner tools", "Account profile and settings, the dashboard, and an offline library for supported saved materials. The app/web update area helps users check for newer releases."]
    ],
    teachingTitle: "Instruction, instructors and mentors",
    teaching: [
      "Learning materials are arranged to help learners move from a selected level or course into its relevant topics and resources. The intention is to support independent study with clear, manageable steps.",
      "The quality and format of instruction can differ by course. Depending on what has been published, a course may provide notes, documents, explanations, practice or other supporting resources.",
      "Ahadu Tech Academy does not make an unverified claim here about a named instructor, formal accreditation or a particular instructor's qualifications. Where a course identifies its author, instructor or mentor, learners should use the information displayed with that course and its materials.",
      "A useful learning cycle is: review the lesson objective, study the material, write down key ideas, practise, check what you understand and revisit topics that need more work."
    ],
    noteTitle: "A note about availability",
    note: "Course coverage, individual learning features, offline access and progress indicators may differ between sections and published materials. The options visible in your account are the best guide to what is currently available.",
    ctaTitle: "Your next step",
    cta: "Choose a learning path, sign in to keep your account-based learning together, and make steady progress one lesson at a time.",
    home: "Explore courses",
    loginButton: "Sign in",
    langLabel: "Page language",
    english: "English",
    amharic: "አማርኛ",
    platform: "Web & Android",
    workflow: "A practical learning journey"
  },
  am: {
    eyebrow: "ስለ አካዳሚው",
    title: "በዓላማ ይማሩ፤ በራስ መተማመን ያድጉ።",
    intro: "አሃዱ ቴክ አካዳሚ የትምህርት ቤት፣ የዩኒቨርሲቲ እና የኮዲንግ የመማሪያ ግብዓቶችን በአንድ ቦታ የሚያቀርብ ዲጂታል የመማሪያ መድረክ ነው። ድረ-ገጹና የአንድሮይድ መተግበሪያው ተማሪዎች ተስማሚ የመማሪያ ቁሳቁሶችን እንዲያገኙ፣ በተደራጀ መንገድ እንዲማሩ እና ትምህርታቸውን እንዲቀጥሉ የተዘጋጁ ናቸው።",
    overviewTitle: "መድረኩና የሞባይል መተግበሪያው",
    overviewLead: "በድረ-ገጽና በአንድሮይድ ላይ የተቀናጀ የመማር ልምድ።",
    overview: [
      "ለአንደኛ ደረጃ፣ ለሁለተኛ ደረጃ፣ ለዩኒቨርሲቲ እና ለኮዲንግ የቀረቡ የመማሪያ መንገዶችን ይመርምሩ። የሚገኙ ትምህርቶችና ቁሳቁሶች በመድረኩ ላይ በተለቀቁት ኮርሶች ይወሰናሉ።",
      "የመማሪያ ክፍል ይክፈቱ፤ እንደ አማራጩ የሚመለከተውን ክፍል፣ ዲፓርትመንት፣ ዓመት ወይም ኮርስ ይምረጡ፤ ከዚያም የቀረቡትን ትምህርቶች ይከታተሉ።",
      "የተማሪ መለያዎንና ዳሽቦርዱን በመጠቀም የመለያ ባህሪያትን ያግኙ። በSettings ውስጥ የመገለጫ፣ የይለፍ ቃል፣ የገጽታ፣ የቋንቋ እና የመተግበሪያ/ድረ-ገጽ ማዘመኛ ቁጥጥሮች ይገኛሉ።",
      "የአንድሮይድ መተግበሪያው የአካባቢያዊ WebView አጠቃቀም አለው፤ በመተግበሪያው የተቀመጡ ወይም ከመስመር ውጭ እንዲገኙ የተዘጋጁ የትምህርት ቁሳቁሶችን በOffline Library ማግኘት ይቻላል። ሁሉም ቁሳቁሶች ከመስመር ውጭ አይገኙም፤ ለመግባት፣ አዲስ ይዘት ለመጫን እና ማዘመኛ ለመፈተሽ ኢንተርኔት ያስፈልጋል።",
      "በመተግበሪያው የማዘመኛ ክፍል የታተሙ ስሪቶችን መፈተሽ ይቻላል። የድረ-ገጽ ይዘት OTA ማዘመኛ ሊያገኝ ይችላል፤ የአንድሮይድ ቤተኛ ኮድ ወይም ፈቃድ ለውጥ ግን በተለየ የመተግበሪያ ስሪት መለቀቅ ይፈልጋል።"
    ],
    stepsTitle: "ከመጀመሪያ እስከ መጨረሻ እንዴት መጠቀም ይቻላል?",
    steps: [
      ["ይመርምሩ", "ከመነሻ ገጽ ጀምረው አንደኛ ደረጃ፣ ሁለተኛ ደረጃ፣ ዩኒቨርሲቲ ወይም ኮዲንግ ይምረጡ። ከመቀጠልዎ በፊት የኮርሱን ወይም የደረጃውን መግለጫ ያንብቡ።"],
      ["የመማሪያ ክፍልዎን ይምረጡ", "በመረጡት ክፍል ውስጥ የሚታዩትን ክፍል፣ የዩኒቨርሲቲ መንገድ፣ ዲፓርትመንት፣ የትምህርት ዓመት ወይም ኮርስ ይምረጡ።"],
      ["ትምህርቱን ይክፈቱ", "ትምህርት ወይም ግብዓት ይክፈቱና የቀረበውን ይዘት በቅደም ተከተል ይከታተሉ። እንደ ኮርሱ ሁኔታ ማስታወሻዎች፣ ሰነዶች እና ሌሎች የመማሪያ ግብዓቶች ሊካተቱ ይችላሉ።"],
      ["ሲያስፈልግ ይግቡ", "እንደ ዳሽቦርድ፣ መገለጫ እና የተቀመጡ የመማሪያ ግብዓቶች ያሉ የመለያ ባህሪያትን ለመጠቀም መለያ ይፍጠሩ ወይም ይግቡ።"],
      ["ዳሽቦርድና Settings ይጠቀሙ", "ለተማሪ መሳሪያዎች ወደ ዳሽቦርድ ይመለሱ። በSettings ውስጥ መገለጫዎን፣ ይለፍ ቃልዎን፣ ገጽታዎንና ቋንቋዎን ያስተዳድሩ፤ በApp & Web Updates ውስጥ ማዘመኛዎችን ይፈትሹ።"],
      ["ቋሚ የመማር ልምድ ይገንቡ", "ተግባራዊ የመማር ግብ ያዘጋጁ፣ በአንድ ጊዜ አንድ ርዕስ ይማሩ፣ ማስታወሻ ይያዙ፣ የተማሩትን ይለማመዱ እና አስቸጋሪ ክፍሎችን ይድገሙ። በሚቀርብበት ጊዜ የመማር መዝገቦችዎን ወይም የእድገት መለኪያዎችን ይመልከቱ።"]
    ],
    loginTitle: "መግባትና የመለያ አጠቃቀም",
    login: [
      "ከአሰሳ ምናሌው Login ይምረጡ፤ ከዚያም ከመለያዎ ጋር የተያያዘውን ኢሜይልና ይለፍ ቃል ያስገቡ።",
      "አዲስ ተማሪዎች Register በመምረጥ ስማቸውን፣ ኢሜይላቸውንና ይለፍ ቃል ማስገባት ይችላሉ። ስልክ ቁጥርና የመገለጫ ፎቶ አማራጭ ናቸው። ለመለያ ግንኙነትና ለመመለስ የሚጠቀሙበትን ኢሜይል ያስገቡ።",
      "ከተመዘገቡ ወይም ከገቡ በኋላ መድረኩ ወደ ዳሽቦርድዎ ይወስድዎታል። የመግቢያ መረጃዎን በሚስጥር ይጠብቁ፤ በሌላ ሰው መሳሪያ ላይ ከተጠቀሙ ሲጨርሱ ይውጡ።",
      "መግባት ካልተሳካ ኢሜይሉ በትክክል መጻፉን፣ Caps Lock ይለፍ ቃሉን እንዳልቀየረው እና የኢንተርኔት ግንኙነትዎ መስራቱን ያረጋግጡ። ይለፍ ቃሉን ከረሱ Forgot password ይጠቀሙ።",
      "የመግቢያ ክፍለ ጊዜው ካበቃ ወደ Login ተመልሰው እንደገና ይግቡ። ችግሩ ከቀጠለ የሚታየውን የስህተት መልዕክት ይመዝግቡና በአካዳሚው የታተመ የድጋፍ መንገድ ያግኙ።"
    ],
    resetTitle: "የይለፍ ቃል ከረሱ: እንዴት መመለስ ይቻላል?",
    resetLead: "የForgot password ገጽ በኢሜይል የመመለሻ አገናኝ እና ከመለያው ጋር ለተያያዘ Telegram የአንድ ጊዜ ኮድ አማራጮችን ያቀርባል።",
    reset: [
      ["የመመለሻ ገጹን ይክፈቱ", "በLogin ገጽ Forgot password ይምረጡ። ከመለያዎ ጋር የተመዘገበውን ኢሜይል ያስገቡ።"],
      ["ኢሜይል ወይም Telegram ይምረጡ", "በኢሜይል ለመመለስ የመመለሻ አገናኝ ይጠይቁ፤ Inbox እና Spam አቃፊዎችን ይመልከቱ። አገናኙ ከአንድ ሰዓት በኋላ ያበቃል። በTelegram ለመመለስ Telegram Bot OTP ይምረጡ፤ ይህ አማራጭ ከአካዳሚው መለያዎ ጋር ቀድሞ የተያያዘ Telegram ይፈልጋል።"],
      ["ማስተካከያውን ያጠናቅቁ", "የኢሜይል አገናኙን ይክፈቱና አዲስ ይለፍ ቃል ያዘጋጁ፤ ወይም ወደ ተያያዘው Telegram የተላከውን ስድስት አሃዝ ኮድ ያስገቡና አዲስ ይለፍ ቃል ይምረጡ። የTelegram ኮድ ለ60 ሰከንድ ብቻ ይሰራል እና አንድ ጊዜ ብቻ ይጠቀማል።"],
      ["መልዕክት ካልደረሰ ወይም ጊዜው ካለፈ", "የተመዘገበውን ኢሜይል በትክክል ማስገባትዎን ያረጋግጡ። Spam/Junk ይመልከቱና የኢሜይል መድረሻን ትንሽ ይጠብቁ። ለTelegram መለያዎ መያያዙን ያረጋግጡ፤ የአሁኑ ኮድ ከጊዜው በኋላ አዲስ ይጠይቁ። የመመለሻ አገናኝን ወይም ኮድን ለማንም አያጋሩ።"],
      ["ወደ Login ይመለሱ", "ይለፍ ቃሉን በተሳካ ሁኔታ ካዘመኑ በኋላ ወደ Login ተመልሰው በአዲሱ ይለፍ ቃል ይግቡ። አገናኙ ከጠፋ፣ ከጊዜው ካለፈ ወይም ካልተቀበለ ወደ Forgot password ተመልሰው አዲስ የመመለሻ እርምጃ ይጠይቁ።"]
    ],
    includedTitle: "ምን ይካተታል? የመማር አቀራረብ",
    included: [
      ["አንደኛ ደረጃ", "ለአንደኛ ደረጃ ተማሪዎች የተደራጁ መሠረታዊ የመማሪያ ግብዓቶች፤ የሚገኙ ክፍሎችና ትምህርቶች በዚያው ክፍል ይታያሉ።"],
      ["ሁለተኛ ደረጃ", "በቀረቡት ክፍሎችና ትምህርቶች መሠረት የተደራጁ የሁለተኛ ደረጃ የመማሪያ እና የፈተና ዝግጅት ግብዓቶች።"],
      ["ዩኒቨርሲቲ", "የሚገኙ ዩኒቨርሲቲዎችን ወይም የትምህርት መንገዶችን፣ ዲፓርትመንቶችን፣ የትምህርት ዓመቶችንና የኮርስ ግብዓቶችን ለመፈለግ የዩኒቨርሲቲ የመማሪያ ሂደት።"],
      ["ኮዲንግ", "ለፕሮግራሚንግ ልምምድና ለክህሎት ማዳበር የተዘጋጀ የኮዲንግ የመማሪያ ክፍል። የሚገኙ ልምምዶችና ግብዓቶች በታተሙት ይዘቶች ይወሰናሉ።"],
      ["የተማሪ መሳሪያዎች", "የመለያ መገለጫና Settings፣ ዳሽቦርድ እና የተቀመጡ ቁሳቁሶችን ለሚደግፉ ግብዓቶች የOffline Library ይካተታሉ። የመተግበሪያ/ድረ-ገጽ ማዘመኛ ክፍሉ አዳዲስ ስሪቶችን ለመፈተሽ ይረዳል።"]
    ],
    teachingTitle: "አስተማሪዎች፣ አማካሪዎችና የማስተማር ዘዴ",
    teaching: [
      "የመማሪያ ቁሳቁሶች ተማሪዎች ከመረጡት ደረጃ ወይም ኮርስ ወደ ተዛማጅ ርዕሶችና ግብዓቶች በቀላሉ እንዲሄዱ ተደርገው ይደራጃሉ። ዓላማው በግል ጥናት በግልጽና በሚቻሉ ደረጃዎች መርዳት ነው።",
      "የማስተማር ይዘትና ቅርጽ ከኮርስ ወደ ኮርስ ሊለያይ ይችላል። እንደ ተለቀቀው ኮርስ ሁኔታ ማስታወሻዎች፣ ሰነዶች፣ ማብራሪያዎች፣ ልምምዶች ወይም ሌሎች ድጋፍ ሰጪ ግብዓቶች ሊኖሩ ይችላሉ።",
      "በዚህ ገጽ ላይ ያልተረጋገጠ የአስተማሪ ስም፣ የሙያ ማረጋገጫ ወይም የተለየ የአስተማሪ ብቃት አይገለጽም። ኮርስ ደራሲውን፣ አስተማሪውን ወይም አማካሪውን ካሳየ ተማሪዎች ከዚያ ኮርስና ቁሳቁስ ጋር የተቀመጠውን መረጃ ይመልከቱ።",
      "ጠቃሚ የመማር ዑደት፦ የትምህርቱን ዓላማ ይመልከቱ፣ ቁሳቁሱን ያጠኑ፣ ዋና ሐሳቦችን ይጻፉ፣ ይለማመዱ፣ የተረዱትን ይፈትሹ እና ተጨማሪ ሥራ የሚፈልጉ ርዕሶችን ይድገሙ።"
    ],
    noteTitle: "ስለ ይዘት መገኘት ማስታወሻ",
    note: "የኮርስ ሽፋን፣ የተለያዩ የመማሪያ ባህሪያት፣ ከመስመር ውጭ መጠቀም እና የእድገት መለኪያዎች ከክፍል ወደ ክፍል ሊለያዩ ይችላሉ። በመለያዎ ውስጥ የሚታዩት አማራጮች አሁን ስለሚገኘው ነገር ትክክለኛ መመሪያ ናቸው።",
    ctaTitle: "ቀጣይ እርምጃዎ",
    cta: "የመማሪያ መንገድ ይምረጡ፣ በመለያዎ ይግቡና ትምህርትን በትምህርት በቀጣይነት ይማሩ።",
    home: "ኮርሶችን ይመልከቱ",
    loginButton: "ይግቡ",
    langLabel: "የገጹ ቋንቋ",
    english: "English",
    amharic: "አማርኛ",
    platform: "ድረ-ገጽ እና አንድሮይድ",
    workflow: "ተግባራዊ የመማር ጉዞ"
  }
};

function BulletList({ items }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" /><span>{item}</span></li>)}
    </ul>
  );
}

function NumberedSteps({ items }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map(([title, description], index) => (
        <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700">{index + 1}</span>
            <h3 className="font-bold text-slate-900">{title}</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        </article>
      ))}
    </div>
  );
}

function FeatureGrid({ items }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map(([title, description]) => (
        <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </article>
      ))}
    </div>
  );
}

export default function AboutUs() {
  const [language, setLanguage] = useState("en");
  const t = content[language];
  const isAmharic = language === "am";

  return (
    <div className="about-page mx-auto max-w-6xl space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1b3d] via-[#172b59] to-sky-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">{t.eyebrow}</p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">{t.intro}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-sky-100">
              <span aria-hidden="true">🌐</span>{t.platform}
            </div>
          </div>
          <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm lg:w-auto lg:min-w-64">
            <p className="px-2 pb-2 text-xs font-semibold text-slate-200">{t.langLabel}</p>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.langLabel}>
              <button type="button" onClick={() => setLanguage("en")} aria-pressed={!isAmharic} className={"rounded-xl px-4 py-3 text-sm font-bold transition " + (!isAmharic ? "bg-white text-slate-900 shadow" : "text-white hover:bg-white/10")}>{t.english}</button>
              <button type="button" onClick={() => setLanguage("am")} aria-pressed={isAmharic} className={"rounded-xl px-4 py-3 text-sm font-bold transition " + (isAmharic ? "bg-white text-slate-900 shadow" : "text-white hover:bg-white/10")}>{t.amharic}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">{t.platform}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{t.overviewTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">{t.overviewLead}</p>
        </div>
        <BulletList items={t.overview} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">{t.workflow}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{t.stepsTitle}</h2>
        <NumberedSteps items={t.steps} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-xl">🔐</div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{t.loginTitle}</h2>
          <BulletList items={t.login} />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-xl">🔑</div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{t.resetTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">{t.resetLead}</p>
          <NumberedSteps items={t.reset} />
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{t.includedTitle}</h2>
        <FeatureGrid items={t.included} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{t.teachingTitle}</h2>
        <BulletList items={t.teaching} />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h2 className="font-bold text-amber-950">{t.noteTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-amber-900">{t.note}</p>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl bg-slate-900 px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-extrabold sm:text-2xl">{t.ctaTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">{t.cta}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/" className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400">{t.home}</a>
          <a href="/login" className="rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">{t.loginButton}</a>
        </div>
      </section>
    </div>
  );
}
