# Ahadu Tech Academy
You are working on an EXISTING project called "Ahadu Tech Academy".

IMPORTANT RULES:

* DO NOT create a new project
* DO NOT change backend or authentication
* ONLY UPDATE frontend UI
* Keep Tailwind CSS design

====================================
TASK: UNIVERSITY DASHBOARD UI SYSTEM
====================================

Build a modern university selection UI for Ethiopia.

---

1. LEFT SIDEBAR (UNIVERSITY LIST)

---

Create a left sidebar that shows 20 Ethiopian universities:

Example list:

* Addis Ababa University
* Wollo University
* Bahir Dar University
* Mekelle University
* Jimma University
* Gondar University
* Debre Berhan University
* Debre Markos University
* Woldia University
* Hawassa University
* Arba Minch University
* Adama Science and Technology University
* Dilla University
* Haramaya University
* Jigjiga University
* Ambo University
* Dire Dawa University
* Mizan Tepi University
* Wolkite University
* Bule Hora University

FEATURES:

* Scrollable list
* Click university → navigate to UniversityPage

---

2. SEARCH FUNCTION (IMPORTANT)

---

Add search input at top of sidebar:

* User types university name
* Filter list in real-time
* Example: "Addis" → shows Addis Ababa University only

---

3. MAIN CENTER AREA

---

When page loads:

Show general welcome panel:

* "Welcome to Ahadu Tech Academy University System"
* Show instructions:

  * Select university from left
  * Or search to find university

When university selected:

* Show university name in center
* Show level selection:

  * Natural Science
  * Social Science
  * Masters
  * PhD

---

4. NAVIGATION FLOW

Click flow:

University (sidebar)
↓
UniversityPage
↓
Level (Natural / Social / Masters / PhD)
↓
Faculty / Department Page

---

5. UI DESIGN REQUIREMENTS

* Left sidebar fixed (20-25% width)
* Center content area (main view)
* Clean modern UI (Tailwind CSS)
* Responsive design
* Highlight selected university

---

6. ROUTING

Add routes:

/universities
/university/:name
/university/:name/level
/university/:name/faculty

---

7. UX REQUIREMENTS

* Smooth navigation
* No page reload
* Use React Router
* Use state for selected university
* Search must be instant filter

---

OUTPUT FORMAT:

* ONLY show NEW or UPDATED files
* Label clearly:
  CREATE THIS FILE
  UPDATE THIS FILE
* Provide full working code

====================================
FINAL GOAL:

Create a professional university dashboard:

LEFT → University list + search
CENTER → General info + selected university details
RIGHT (optional) → future content (courses)





Complete full-stack learning platform scaffold.

## Folder structure

```
Ahadu-Tech-academy/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── uploads/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── public/
│       └── README.txt
├── .gitignore
```

## Backend run steps

1. Open a terminal in `backend`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create `.env` from `.env.example` and set values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ahadu-tech-academy
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

4. Start backend:

```bash
npm run dev
```

Backend API base URL: `http://localhost:5000`

## Frontend run steps

1. Open a terminal in `frontend`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Notes

- Register users via backend auth routes.
- Admin approval is required for account access.
- `backend/uploads` stores uploaded files.
- The frontend contains a sample React/Tailwind interface ready to expand.
