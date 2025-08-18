SehatBeat
A modern healthcare frontend platform offering intuitive digital wellness tools—from medicine ordering and reminders to AI-powered symptom analysis and clinical documentation.

Overview
SehatBeat is a responsive web application designed to provide a seamless healthcare experience for patients. It features:

SehatBeat AI Assistant — a female doctor-like bot (bottom-right) that guides users via symptom analysis, triage, and doctor recommendations
Medicine Ordering — browse, search, add to cart, and place orders
Smart Reminders — schedule and manage medicine, lab test, and doctor appointment reminders with a calendar overview
Lab Tests — schedule tests, upload and review lab reports, and track pending/completed tests
Doctors Directory — find medical professionals by specialization and location, view profiles, and book appointments
Symptom Checker — interactive triage tool with a 3D anatomical body model for visual symptom selection
Clinical Documentation — upload, view, and manage structured clinical notes via a dedicated navbar tab, highlighted as "NEW"
Key Features
SehatBeat AI Assistant
Floating health assistant character located at the bottom-right corner
Introduces itself: “Hello, I’m SehatBeat AI, your personal health companion… Tell me your symptoms, and I’ll help analyze them, suggest possible causes, and guide you to the right doctor.”
Handles symptom analysis, triage, general queries, and directs the user to appropriate features or medical professionals
Medicine Ordering
Browse and search a catalog of medicines
Add items to cart and complete purchase flows
View and manage past prescription history
Smart Reminders
Create reminders for medication intake, lab tests, and appointments
Calendar view to manage upcoming reminders efficiently
Lab Tests
Schedule tests and browse available options
Upload reports (PDF, image formats)
Track and differentiate between pending and completed lab tests
Doctors Directory
Search for doctors by specialization or geographic area
View detailed profile cards
Book and manage appointments directly within the platform
Symptom Checker
Use SehatBeat AI for real-time interactive symptom diagnosis
Explore a 3D anatomical model (via Three.js) to select symptoms visually for more refined results
Clinical Documentation
Dedicated “Clinical Documentation” section in the navbar
Highlighted with a "NEW" badge for visibility
Upload and manage structured clinical notes for shared patient-doctor reference
Design & UX Principles
No sidebar — navigation via top navbar (desktop) and bottom tab bar (mobile)
Clean, modern UI using Tailwind CSS
Engaging animations powered by Framer Motion
Responsive layout optimized for both desktop and mobile experiences
Functional Get Started buttons that redirect users to corresponding sections or features
Technology Stack
Frontend: React with TypeScript
Styling: Tailwind CSS
Animations: Framer Motion
3D Visualization: Three.js
AI Assistant: Placeholder integration (OpenAI API / Rasa or similar)
State Management: React Hooks (and optionally Context API)
Project Structure
FRONTEND ├── public/ ├── src/ │ ├── components/ │ ├── pages/ │ │ ├── Home.tsx │ │ ├── Medicine.tsx │ │ ├── Reminders.tsx │ │ ├── LabTests.tsx │ │ ├── Doctors.tsx │ │ ├── SymptomChecker.tsx │ │ ├── ClinicalDocs.tsx │ ├── ai/ │ │ └── SehatBeatBot.tsx │ ├── assets/ │ │ └── 3d-models/ │ └── App.tsx ├── package.json ├── README.md