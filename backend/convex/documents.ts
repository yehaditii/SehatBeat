import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate upload URL for file storage
export const generateUploadUrl = action({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    storageId: v.string(),
  }),
  handler: async (ctx, args) => {
    const storageId = await ctx.storage.generateUploadUrl();
    return {
      uploadUrl: storageId,
      storageId: storageId,
    };
  },
});

// Save document metadata after file upload
export const saveDocumentMetadata = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
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
    metadata: v.optional(v.object({
      doctorId: v.optional(v.id("doctors")),
      appointmentId: v.optional(v.id("appointments")),
      labTestId: v.optional(v.id("labTests")),
      expiryDate: v.optional(v.number()),
      documentNumber: v.optional(v.string()),
      issuingAuthority: v.optional(v.string()),
    })),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      storageId: args.storageId,
      category: args.category,
      tags: args.tags,
      isPrivate: args.isPrivate,
      uploadedAt: Date.now(),
      lastModified: Date.now(),
      metadata: args.metadata || {},
    });
    return documentId;
  },
});

// Get documents for a specific user
export const getUserDocuments = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    _creationTime: v.number(),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
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
  })),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return documents;
  },
});

// Get a specific document by ID
export const getDocumentById = query({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
      storageId: v.id("_storage"),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    return document;
  },
});

// Get download URL for a document
export const getDocumentDownloadUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

// Update document metadata
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.union(
        v.literal("medical_record"),
        v.literal("prescription"),
        v.literal("lab_result"),
        v.literal("insurance"),
        v.literal("id_document"),
        v.literal("other")
      )),
      tags: v.optional(v.array(v.string())),
      isPrivate: v.optional(v.boolean()),
      metadata: v.optional(v.object({
        doctorId: v.optional(v.id("doctors")),
        appointmentId: v.optional(v.id("appointments")),
        labTestId: v.optional(v.id("labTests")),
        expiryDate: v.optional(v.number()),
        documentNumber: v.optional(v.string()),
        issuingAuthority: v.optional(v.string()),
      })),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      ...args.updates,
      lastModified: Date.now(),
    });
    return null;
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (document) {
      // Delete the file from storage
      await ctx.storage.delete(document.storageId);
      // Delete the document metadata
      await ctx.db.delete(args.documentId);
    }
    return null;
  },
});

// Search documents by text
export const searchDocuments = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("documents"),
    _creationTime: v.number(),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
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
  })),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.or(
          q.gte(q.field("title"), args.searchTerm),
          q.lte(q.field("title"), args.searchTerm + "\uffff"),
          q.gte(q.field("description"), args.searchTerm),
          q.lte(q.field("description"), args.searchTerm + "\uffff")
        )
      )
      .order("desc")
      .collect();
    return documents;
  },
});

// Get document statistics for a user
export const getDocumentStats = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    totalDocuments: v.number(),
    byCategory: v.record(v.string(), v.number()),
    totalSize: v.number(),
    thisMonth: v.number(),
  }),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const now = Date.now();
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalDocuments: documents.length,
      byCategory: {} as Record<string, number>,
      totalSize: 0,
      thisMonth: 0,
    };
    
    for (const doc of documents) {
      // Count by category
      const category = doc.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Sum file sizes
      stats.totalSize += doc.fileSize;
      
      // Count this month
      if (doc.uploadedAt >= monthAgo) {
        stats.thisMonth += 1;
      }
    }
    
    return stats;
  },
});
