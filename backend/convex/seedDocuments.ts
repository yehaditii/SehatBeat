import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a seed user for testing
export const getOrCreateSeedUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    // Check if any users exist
    const existingUsers = await ctx.db.query("users").collect();
    
    if (existingUsers.length > 0) {
      // Return the first existing user
      return existingUsers[0]._id;
    }
    
    // Create a new seed user if none exist
    const userId = await ctx.db.insert("users", {
      clerkId: "seed_user_123",
      name: "Seed User",
      email: "seed@example.com",
    });
    
    return userId;
  },
});

// Seed sample documents for testing
export const seedSampleDocuments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if any users exist, create one if needed
    let userId: any;
    const existingUsers = await ctx.db.query("users").collect();
    
    if (existingUsers.length > 0) {
      userId = existingUsers[0]._id;
    } else {
      // Create a new seed user if none exist
      userId = await ctx.db.insert("users", {
        clerkId: "seed_user_123",
        name: "Seed User",
        email: "seed@example.com",
      });
    }
    
    const now = Date.now();
    
    const sampleDocuments = [
      {
        userId: userId,
        title: "Blood Test Results - January 2024",
        description: "Complete blood count and metabolic panel results",
        fileName: "blood_test_jan_2024.pdf",
        fileType: "application/pdf",
        fileSize: 1024000, // 1MB
        storageId: "sample_storage_id_1" as any, // Cast to any to bypass type error for seeding
        category: "lab_result" as const,
        tags: ["blood", "test", "january"],
        isPrivate: false,
        uploadedAt: now - 86400000, // 1 day ago
        lastModified: now - 86400000,
        metadata: {
          doctorId: undefined,
          appointmentId: undefined,
          labTestId: undefined,
          expiryDate: undefined,
          documentNumber: "LAB-001",
          issuingAuthority: "City Medical Lab",
        },
      },
      {
        userId: userId,
        title: "Prescription - Amoxicillin",
        description: "Antibiotic prescription for bacterial infection",
        fileName: "amoxicillin_prescription.pdf",
        fileType: "application/pdf",
        fileSize: 512000, // 512KB
        storageId: "sample_storage_id_2" as any,
        category: "prescription" as const,
        tags: ["antibiotic", "infection", "amoxicillin"],
        isPrivate: true,
        uploadedAt: now - 172800000, // 2 days ago
        lastModified: now - 172800000,
        metadata: {
          doctorId: undefined,
          appointmentId: undefined,
          labTestId: undefined,
          expiryDate: now + (30 * 24 * 60 * 60 * 1000), // 30 days from now
          documentNumber: "RX-2024-001",
          issuingAuthority: "Dr. Smith",
        },
      },
      {
        userId: userId,
        title: "Medical History Summary",
        description: "Comprehensive medical history and current conditions",
        fileName: "medical_history.pdf",
        fileType: "application/pdf",
        fileSize: 2048000, // 2MB
        storageId: "sample_storage_id_3" as any,
        category: "medical_record" as const,
        tags: ["history", "summary", "conditions"],
        isPrivate: true,
        uploadedAt: now - 259200000, // 3 days ago
        lastModified: now - 259200000,
        metadata: {
          doctorId: undefined,
          appointmentId: undefined,
          labTestId: undefined,
          expiryDate: undefined,
          documentNumber: "MED-001",
          issuingAuthority: "General Hospital",
        },
      },
    ];
    
    // Insert sample documents
    for (const doc of sampleDocuments) {
      await ctx.db.insert("documents", doc);
    }
    
    return null;
  },
});

// Clear all documents (for testing)
export const clearAllDocuments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    
    for (const doc of documents) {
      // Delete the file from storage first
      try {
        await ctx.storage.delete(doc.storageId);
      } catch (error) {
        console.log("File already deleted or doesn't exist:", error);
      }
      
      // Then delete the document metadata
      await ctx.db.delete(doc._id);
    }
    
    return null;
  },
});
