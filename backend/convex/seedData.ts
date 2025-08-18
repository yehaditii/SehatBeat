import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Seed medicines
    const medicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        description: "Pain reliever and fever reducer",
        price: 5.99,
        category: "Pain Relief",
        dosage: "500mg",
        manufacturer: "Generic Pharma",
        inStock: true,
        prescriptionRequired: false,
        activeIngredients: ["Acetaminophen"],
        sideEffects: ["Nausea", "Liver problems in high doses"],
        instructions: "Take 1-2 tablets every 4-6 hours as needed",
      },
      {
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        description: "Anti-inflammatory pain reliever",
        price: 7.99,
        category: "Pain Relief",
        dosage: "400mg",
        manufacturer: "HealthCare Inc",
        inStock: true,
        prescriptionRequired: false,
        activeIngredients: ["Ibuprofen"],
        sideEffects: ["Stomach upset", "Dizziness"],
        instructions: "Take 1 tablet every 6-8 hours with food",
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        description: "Antibiotic for bacterial infections",
        price: 25.99,
        category: "Antibiotics",
        dosage: "500mg",
        manufacturer: "MedCorp",
        inStock: true,
        prescriptionRequired: true,
        activeIngredients: ["Amoxicillin"],
        sideEffects: ["Diarrhea", "Nausea", "Allergic reactions"],
        instructions: "Take 1 capsule 3 times daily with or without food",
      },
      {
        name: "Omeprazole",
        genericName: "Omeprazole",
        description: "Proton pump inhibitor for acid reflux",
        price: 15.99,
        category: "Digestive Health",
        dosage: "20mg",
        manufacturer: "Digestive Health Ltd",
        inStock: true,
        prescriptionRequired: false,
        activeIngredients: ["Omeprazole"],
        sideEffects: ["Headache", "Diarrhea", "Stomach pain"],
        instructions: "Take 1 capsule daily before breakfast",
      },
      {
        name: "Cetirizine",
        genericName: "Cetirizine",
        description: "Antihistamine for allergies",
        price: 12.99,
        category: "Allergy",
        dosage: "10mg",
        manufacturer: "AllergyCare",
        inStock: true,
        prescriptionRequired: false,
        activeIngredients: ["Cetirizine"],
        sideEffects: ["Drowsiness", "Dry mouth", "Headache"],
        instructions: "Take 1 tablet daily",
      },
    ];

    for (const medicine of medicines) {
      await ctx.db.insert("medicines", medicine);
    }

    // Seed doctors
    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        qualifications: ["MD", "FACC", "Cardiovascular Disease"],
        experience: 15,
        location: {
          city: "New York",
          state: "NY",
          address: "123 Medical Center Dr, New York, NY 10001",
        },
        phone: "+1-555-0123",
        email: "sarah.johnson@healthcare.com",
        rating: 4.8,
        availableSlots: [
          Date.now() + 86400000, // Tomorrow
          Date.now() + 172800000, // Day after tomorrow
        ],
        consultationFee: 150,
        languages: ["English", "Spanish"],
        about: "Board-certified cardiologist with 15 years of experience in treating heart conditions.",
      },
      {
        name: "Dr. Michael Chen",
        specialization: "Neurology",
        qualifications: ["MD", "PhD", "Neurology"],
        experience: 12,
        location: {
          city: "Los Angeles",
          state: "CA",
          address: "456 Neurology Ave, Los Angeles, CA 90210",
        },
        phone: "+1-555-0456",
        email: "michael.chen@neuro.com",
        rating: 4.9,
        availableSlots: [
          Date.now() + 86400000,
          Date.now() + 172800000,
        ],
        consultationFee: 180,
        languages: ["English", "Mandarin"],
        about: "Specialist in neurological disorders and brain health.",
      },
      {
        name: "Dr. Emily Rodriguez",
        specialization: "Pediatrics",
        qualifications: ["MD", "FAAP", "Pediatrics"],
        experience: 8,
        location: {
          city: "Miami",
          state: "FL",
          address: "789 Children's Way, Miami, FL 33101",
        },
        phone: "+1-555-0789",
        email: "emily.rodriguez@pediatrics.com",
        rating: 4.7,
        availableSlots: [
          Date.now() + 86400000,
          Date.now() + 172800000,
        ],
        consultationFee: 120,
        languages: ["English", "Spanish"],
        about: "Dedicated pediatrician focused on children's health and development.",
      },
      {
        name: "Dr. James Wilson",
        specialization: "Orthopedics",
        qualifications: ["MD", "FAAOS", "Orthopedic Surgery"],
        experience: 20,
        location: {
          city: "Chicago",
          state: "IL",
          address: "321 Bone & Joint Blvd, Chicago, IL 60601",
        },
        phone: "+1-555-0321",
        email: "james.wilson@ortho.com",
        rating: 4.6,
        availableSlots: [
          Date.now() + 86400000,
          Date.now() + 172800000,
        ],
        consultationFee: 200,
        languages: ["English"],
        about: "Expert in orthopedic surgery and sports medicine.",
      },
      {
        name: "Dr. Lisa Thompson",
        specialization: "Dermatology",
        qualifications: ["MD", "FAAD", "Dermatology"],
        experience: 10,
        location: {
          city: "Seattle",
          state: "WA",
          address: "654 Skin Care St, Seattle, WA 98101",
        },
        phone: "+1-555-0654",
        email: "lisa.thompson@derm.com",
        rating: 4.8,
        availableSlots: [
          Date.now() + 86400000,
          Date.now() + 172800000,
        ],
        consultationFee: 160,
        languages: ["English", "French"],
        about: "Board-certified dermatologist specializing in skin health and cosmetic procedures.",
      },
    ];

    for (const doctor of doctors) {
      await ctx.db.insert("doctors", doctor);
    }

    console.log("Database seeded successfully!");
    return "Data seeded successfully";
  },
});
