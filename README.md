SehatBeat
A modern healthcare platform for patients, doctors, and labs – designed with simplicity, accessibility, and innovation in mind.

Symptomate (formerly MediConnect) provides a complete medical ecosystem with features like medicine ordering, smart reminders, lab test management, doctor discovery, AI-powered symptom analysis, and structured clinical documentation.

Features
SehatBeat AI (New!)
A virtual AI health assistant that appears as a friendly doctor-like bot in the bottom-right corner.
Helps with symptom analysis, triage, and doctor recommendations.
Default greeting: “Hello, I’m SehatBeat AI, your personal health companion. Tell me your symptoms, and I’ll help analyze them, suggest possible causes, and guide you to the right doctor.”
Can also answer queries about platform usage.
Medicine Ordering
Browse and search for medicines.
Add to cart and place orders.
View prescription history.
Smart Reminders
Schedule and manage reminders for:
Medicine intake
Doctor appointments
Lab tests
Calendar view for upcoming events.
Lab Tests
Browse and schedule lab tests.
Upload and manage lab reports (PDFs, images).
Track pending and completed tests.
Doctors Directory
Search doctors by specialization and location.
View doctor profiles with details.
Book appointments online.
Symptom Checker (Symptomate)
Interactive tool for self-diagnosis and triage.
Integrated with SehatBeat AI assistant for real-time conversation.
Includes a 3D anatomical body model (Three.js) for visual symptom selection.
Clinical Documentation (Highlighted Feature)
Upload, view, and manage structured clinical notes.
Dedicated page in navbar (highlighted with a “NEW” badge).
Helps patients and doctors keep a shared, accurate record.
Design Principles
No sidebar – navigation via top navbar (desktop) and bottom tab bar (mobile).
Clean, modern UI with Tailwind CSS.
Smooth animations with Framer Motion.
Responsive across devices.
Engaging 3D elements for better interaction.
Tech Stack
Frontend: React + TypeScript + Tailwind CSS
Animations: Framer Motion
3D Models: Three.js
AI Assistant: Placeholder (OpenAI API / Rasa)
State Management: React Hooks / Context API
Project Structure
FRONTEND ├── public/ # Static assets ├── src/ │ ├── components/ # Reusable UI components │ ├── pages/ # Feature pages (Medicine, Reminders, etc.) │ ├── ai/ # SehatBeat AI bot integration │ ├── assets/ # Icons, images, 3D models │ └── App.tsx # Main app entry ├── package.json ├── README.md