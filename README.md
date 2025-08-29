# SehatBeat

A modern healthcare frontend platform offering intuitive digital wellness tools—from medicine ordering and reminders to AI-powered symptom analysis and clinical documentation.

## Overview

SehatBeat is a responsive web application designed to provide a seamless healthcare experience for patients.

### It features:

+ SehatBeat AI Assistant – A female doctor-like bot (bottom-right) for symptom analysis, triage, and doctor recommendations.

+ Medicine Ordering – Browse, search, add to cart, and place orders.

+ Smart Reminders – Schedule and manage reminders for medicines, lab tests, and doctor appointments.

+ Lab Tests – Schedule tests, upload and review reports, and track progress.

+ Doctors Directory – Search for doctors by specialization/location and book appointments.

+ Symptom Checker – Interactive triage tool with a 3D anatomical model.

+ Clinical Documentation – Upload, view, and manage structured clinical notes, highlighted as "NEW".

### Key Features

+ SehatBeat AI Assistant

+ Floating AI health assistant located at the bottom-right corner.

+ Introduces itself:

> “Hello, I’m SehatBeat AI, your personal health companion… Tell me your symptoms, and I’ll help analyze them, suggest possible causes, and guide you to the right doctor.”

+ Handles symptom analysis, triage, general health queries, and navigation to relevant features.

+ Medicine Ordering

+ Browse and search an extensive medicine catalog.

+ Add medicines to cart and place orders.

+ View and manage prescription history.

+ Smart Reminders

+ Create reminders for:

  - Medication intake

  - Lab tests

  - Doctor appointments

  - Visual calendar view to manage upcoming reminders.

+ Lab Tests

  - Schedule tests and view available options.

  - Upload reports (PDF, images).

  - Track pending vs. completed tests.

+ Doctors Directory

  - Search doctors by specialization or geographic location.

  - View detailed doctor profiles.

  - Book and manage appointments.

+ Symptom Checker

  - AI-powered real-time symptom diagnosis.

  - Interactive 3D anatomical model (via Three.js) for precise symptom selection.

+ Clinical Documentation

  - Dedicated Clinical Documentation section in navbar.

  - Highlighted with a NEW badge for visibility.

  - Upload and manage structured clinical notes for patient-doctor use.

+ Design & UX Principles

  - No sidebar; navigation via top navbar (desktop) and bottom tab bar (mobile).

  - Modern and clean UI powered by Tailwind CSS.

  - Smooth, engaging animations using Framer Motion.

  - Fully responsive layout for desktop and mobile.

  - Functional Get Started buttons redirect to key sections.

## Technology Stack

| Category         | Technologies                                |
| ---------------- | ------------------------------------------- |
| Frontend         | React (TypeScript)                          |
| Styling          | Tailwind CSS                                |
| Animations       | Framer Motion                               |
| 3D Visualization | Three.js                                    |
| AI Assistant     | Placeholder integration (OpenAI API / Rasa) |
| State Management | React Hooks, Context API (optional)         |

### Getting Started

#### Prerequisites

+ Ensure you have the following installed:

```
node -v
npm -v
```

#### Installation

+ Clone the repository and install dependencies:

```
git clone https://github.com/username/SehatBeat.git
cd SehatBeat
npm install
```

#### Running the Project

```
npm start
```

## Contributing

Contributions are welcome!

1. Fork the repository.

2. Create a new branch:

```
git checkout -b feature/your-feature-name
```

3. Commit your changes:
```
git commit -m "Add your message"
```
4. Push to the branch:
```
git push origin feature/your-feature-name
```

5. Open a Pull Request.
