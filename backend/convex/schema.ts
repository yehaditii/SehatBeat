import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles extending Clerk user data
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    })),
  }).index("by_clerk_id", ["clerkId"]),

  // Document storage system
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileType: v.string(), // MIME type
    fileSize: v.number(), // Size in bytes
    storageId: v.id("_storage"), // Reference to Convex storage
    category: v.union(
      v.literal("medical_record"),
      v.literal("prescription"),
      v.literal("lab_result"),
      v.literal("insurance"),
      v.literal("id_document"),
      v.literal("other")
    ),
    tags: v.array(v.string()),
    isPrivate: v.boolean(),
    uploadedAt: v.number(),
    lastModified: v.number(),
    metadata: v.optional(v.object({
      doctorId: v.optional(v.id("doctors")),
      appointmentId: v.optional(v.id("appointments")),
      labTestId: v.optional(v.id("labTests")),
      expiryDate: v.optional(v.number()),
      documentNumber: v.optional(v.string()),
      issuingAuthority: v.optional(v.string()),
    })),
    accessControl: v.optional(v.object({
      sharedWith: v.array(v.id("users")), // Users who can access this document
      requireApproval: v.boolean(), // Whether sharing requires approval
      isPublic: v.boolean(), // Whether document is publicly accessible
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_upload_date", ["userId", "uploadedAt"])
    .index("by_category", ["category"])
    .index("by_file_type", ["fileType"]),

  // Medicine catalog
  medicines: defineTable({
    name: v.string(),
    genericName: v.optional(v.string()),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    dosage: v.string(),
    manufacturer: v.string(),
    imageUrl: v.optional(v.string()),
    inStock: v.boolean(),
    prescriptionRequired: v.boolean(),
    activeIngredients: v.optional(v.array(v.string())),
    sideEffects: v.optional(v.array(v.string())),
    instructions: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // User medicine orders
  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      medicineId: v.id("medicines"),
      quantity: v.number(),
      price: v.number(),
    })),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    orderDate: v.number(),
    estimatedDelivery: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Reminders system
  reminders: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("medication"),
      v.literal("appointment"),
      v.literal("lab_test")
    ),
    title: v.string(),
    description: v.string(),
    scheduledTime: v.number(),
    isActive: v.boolean(),
    isCompleted: v.boolean(),
    repeatPattern: v.optional(v.string()), // "daily", "weekly", "monthly"
    medicineId: v.optional(v.id("medicines")),
    dosage: v.optional(v.string()),
    doctorId: v.optional(v.id("doctors")),
    labTestId: v.optional(v.id("labTests")),
    notificationSent: v.boolean(),
  }).index("by_user_and_time", ["userId", "scheduledTime"]),

  // Lab tests
  labTests: defineTable({
    userId: v.id("users"),
    testName: v.string(),
    testType: v.string(),
    scheduledDate: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    results: v.optional(v.string()), // File URL
    notes: v.optional(v.string()),
    labName: v.optional(v.string()),
    labAddress: v.optional(v.string()),
    fastingRequired: v.optional(v.boolean()),
    instructions: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Doctors directory
  doctors: defineTable({
    name: v.string(),
    specialization: v.string(),
    qualifications: v.array(v.string()),
    experience: v.number(),
    location: v.object({
      city: v.string(),
      state: v.string(),
      address: v.string(),
    }),
    phone: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    availableSlots: v.array(v.number()), // Timestamps
    consultationFee: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),
    about: v.optional(v.string()),
  }).index("by_specialization", ["specialization"]),

  // Clinical documents
  clinicalDocs: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.string())), // File URLs
    createdAt: v.number(),
    updatedAt: v.number(),
    doctorId: v.optional(v.id("doctors")),
    isPrivate: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_and_category", ["userId", "category"]),

  // AI Assistant conversations
  conversations: defineTable({
    userId: v.id("users"),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
      metadata: v.optional(v.object({
        symptoms: v.optional(v.array(v.string())),
        severity: v.optional(v.string()),
        recommendations: v.optional(v.array(v.string())),
      })),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  // Appointments
  appointments: defineTable({
    userId: v.id("users"),
    doctorId: v.id("doctors"),
    scheduledTime: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    type: v.union(
      v.literal("consultation"),
      v.literal("follow_up"),
      v.literal("emergency")
    ),
    notes: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    prescription: v.optional(v.array(v.id("medicines"))),
  }).index("by_user", ["userId"]),

  // Cart items
  cartItems: defineTable({
    userId: v.id("users"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),
});
