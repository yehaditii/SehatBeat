import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedClinicalDocs = mutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create sample consultation documents
    await ctx.db.insert("clinicalDocs", {
      userId: args.userId,
      title: "Cardiology Consultation Notes",
      content: "Patient presented with chest pain and shortness of breath. ECG showed ST elevation. Recommended immediate cardiac catheterization.",
      category: "Consultation",
      tags: ["Cardiology", "High", "Follow-up"],
      isPrivate: false,
      createdAt: now - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: now - (2 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("clinicalDocs", {
      userId: args.userId,
      title: "Lab Results - Complete Blood Count",
      content: "WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Platelets: 250. All values within normal range.",
      category: "Lab Report",
      tags: ["Lab Results", "Blood Work", "Normal"],
      isPrivate: false,
      createdAt: now - (3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: now - (3 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("clinicalDocs", {
      userId: args.userId,
      title: "Physical Therapy Assessment",
      content: "Patient recovering from knee surgery. Range of motion improving. Continue with prescribed exercises.",
      category: "Assessment",
      tags: ["Physical Therapy", "Rehabilitation", "Medium"],
      isPrivate: false,
      createdAt: now - (5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: now - (5 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("clinicalDocs", {
      userId: args.userId,
      title: "Dermatology Follow-up",
      content: "Skin condition improving with prescribed treatment. Continue medication for 2 more weeks.",
      category: "Consultation",
      tags: ["Dermatology", "Follow-up", "Medium"],
      isPrivate: false,
      createdAt: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: now - (7 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("clinicalDocs", {
      userId: args.userId,
      title: "Diabetes Management Plan",
      content: "Blood sugar levels stable. Continue current medication regimen. Monitor blood glucose daily.",
      category: "Assessment",
      tags: ["Diabetes", "Management", "Priority"],
      isPrivate: true,
      createdAt: now - (10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: now - (10 * 24 * 60 * 60 * 1000),
    });

    return null;
  },
});

