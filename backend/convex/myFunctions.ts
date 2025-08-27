// Node.js features not needed for these functions

import { v } from "convex/values";
import { query, mutation, action, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ===== USER MANAGEMENT =====

export const getUserProfile = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();
    
    // If multiple profiles exist, return the first one and log a warning
    if (users.length > 1) {
      console.warn(`Multiple user profiles found for clerkId: ${args.clerkId}. Returning first profile.`);
      // TODO: In production, you might want to clean up duplicates here
    }
    
    return users[0] || null;
  },
});

export const createUserProfile = mutation({
  args: {
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
  },
  returns: v.union(
    v.id("users"),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    })
  ),
  handler: async (ctx, args) => {
    // Check if user profile already exists
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();
    
    if (existingUsers.length > 0) {
      console.log(`User profile already exists for clerkId: ${args.clerkId}`);
      return existingUsers[0]; // Return existing profile instead of creating duplicate
    }
    
    // Create new profile
    return await ctx.db.insert("users", args);
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
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
    }),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, args.updates);
  },
});

// Clean up duplicate user profiles
export const cleanupDuplicateProfiles = mutation({
  args: {},
  returns: v.object({
    cleanedCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const clerkIdGroups = new Map();
    
    // Group users by clerkId
    for (const user of allUsers) {
      if (!clerkIdGroups.has(user.clerkId)) {
        clerkIdGroups.set(user.clerkId, []);
      }
      clerkIdGroups.get(user.clerkId).push(user);
    }
    
    let cleanedCount = 0;
    
    // Remove duplicates, keeping the first profile for each clerkId
    for (const [clerkId, users] of clerkIdGroups) {
      if (users.length > 1) {
        console.log(`Cleaning up ${users.length - 1} duplicate profiles for clerkId: ${clerkId}`);
        
        // Keep the first profile, delete the rest
        for (let i = 1; i < users.length; i++) {
          await ctx.db.delete(users[i]._id);
          cleanedCount++;
        }
      }
    }
    
    return { cleanedCount, message: `Cleaned up ${cleanedCount} duplicate profiles` };
  },
});

// ===== MEDICINE CATALOG =====

export const getMedicines = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  returns: v.array(v.object({
    _id: v.id("medicines"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    let medicines;
    
    if (args.category) {
      medicines = await ctx.db
        .query("medicines")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      medicines = await ctx.db.query("medicines").collect();
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchLower) ||
        medicine.description.toLowerCase().includes(searchLower) ||
        (medicine.genericName && medicine.genericName.toLowerCase().includes(searchLower))
      );
    }
    
    return medicines;
  },
});

export const getMedicineById = query({
  args: { medicineId: v.id("medicines") },
  returns: v.union(
    v.object({
      _id: v.id("medicines"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.medicineId);
  },
});

// ===== CART MANAGEMENT =====

export const getCartItems = query({
  args: { userId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("cartItems"),
    _creationTime: v.number(),
    userId: v.id("users"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
    addedAt: v.number(),
    medicine: v.union(
      v.object({
        _id: v.id("medicines"),
        _creationTime: v.number(),
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
      }),
      v.null()
    ),
  })),
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Get medicine details for each cart item
    const cartWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const medicine = await ctx.db.get(item.medicineId);
        return {
          ...item,
          medicine,
        };
      })
    );
    
    return cartWithDetails;
  },
});

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    // Check if item already exists in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("medicineId"), args.medicineId))
      .unique();
    
    if (existingItem) {
      // Update quantity and return the updated item
      const updatedItem = await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return updatedItem;
    } else {
      // Add new item
      const newItemId = await ctx.db.insert("cartItems", {
        userId: args.userId,
        medicineId: args.medicineId,
        quantity: args.quantity,
        addedAt: Date.now(),
      });
      return newItemId;
    }
  },
});

export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.union(
    v.id("cartItems"),
    v.object({
      _id: v.id("cartItems"),
      _creationTime: v.number(),
      userId: v.id("users"),
      medicineId: v.id("medicines"),
      quantity: v.number(),
      addedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return null;
    }
    return await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cartItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.cartItemId);
  },
});

// ===== ORDER MANAGEMENT =====

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(v.object({
      medicineId: v.id("medicines"),
      quantity: v.number(),
      price: v.number(),
    })),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const totalAmount = args.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      items: args.items,
      totalAmount,
      status: "pending",
      shippingAddress: args.shippingAddress,
      orderDate: Date.now(),
    });
    
    // Clear cart after order creation
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    
    return orderId;
  },
});

export const getOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ===== REMINDERS =====

export const createReminder = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("medication"), v.literal("appointment"), v.literal("lab_test")),
    title: v.string(),
    description: v.string(),
    scheduledTime: v.number(),
    repeatPattern: v.optional(v.string()),
    medicineId: v.optional(v.id("medicines")),
    dosage: v.optional(v.string()),
    doctorId: v.optional(v.id("doctors")),
    labTestId: v.optional(v.id("labTests")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reminders", {
      ...args,
      isActive: true,
      isCompleted: false,
      notificationSent: false,
    });
  },
});

export const getReminders = query({
  args: { 
    userId: v.id("users"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let remindersQuery = ctx.db
      .query("reminders")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId));
    
    if (args.activeOnly) {
      remindersQuery = remindersQuery.filter((q) => q.eq(q.field("isActive"), true));
    }
    
    return await remindersQuery.order("asc").collect();
  },
});

export const updateReminder = mutation({
  args: {
    reminderId: v.id("reminders"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      scheduledTime: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
      isCompleted: v.optional(v.boolean()),
      repeatPattern: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.reminderId, args.updates);
  },
});

export const deleteReminder = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.reminderId);
  },
});

// ===== LAB TESTS =====

export const createLabTest = mutation({
  args: {
    userId: v.id("users"),
    testName: v.string(),
    testType: v.string(),
    scheduledDate: v.number(),
    labName: v.optional(v.string()),
    labAddress: v.optional(v.string()),
    fastingRequired: v.optional(v.boolean()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("labTests", {
      ...args,
      status: "scheduled",
    });
  },
});

export const getLabTests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labTests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateLabTest = mutation({
  args: {
    labTestId: v.id("labTests"),
    updates: v.object({
      status: v.optional(v.union(
        v.literal("scheduled"),
        v.literal("completed"),
        v.literal("cancelled")
      )),
      results: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.labTestId, args.updates);
  },
});

// ===== DOCTORS =====

export const getDoctors = query({
  args: {
    specialization: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let doctors;
    
    if (args.specialization) {
      doctors = await ctx.db
        .query("doctors")
        .withIndex("by_specialization", (q) => q.eq("specialization", args.specialization!))
        .collect();
    } else {
      doctors = await ctx.db.query("doctors").collect();
    }
    
    if (args.location) {
      const locationLower = args.location.toLowerCase();
      return doctors.filter(doctor => 
        doctor.location.city.toLowerCase().includes(locationLower) ||
        doctor.location.state.toLowerCase().includes(locationLower)
      );
    }
    
    return doctors;
  },
});

export const getDoctorById = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.doctorId);
  },
});

// ===== CLINICAL DOCUMENTS =====

export const createClinicalDoc = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.string())),
    doctorId: v.optional(v.id("doctors")),
    isPrivate: v.boolean(),
  },
  returns: v.id("clinicalDocs"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clinicalDocs", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getClinicalDocs = query({
  args: { userId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("clinicalDocs"),
    _creationTime: v.number(),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    doctorId: v.optional(v.id("doctors")),
    isPrivate: v.boolean(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clinicalDocs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateClinicalDoc = mutation({
  args: {
    docId: v.id("clinicalDocs"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      attachments: v.optional(v.array(v.string())),
      isPrivate: v.optional(v.boolean()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.docId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteClinicalDoc = mutation({
  args: { docId: v.id("clinicalDocs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.docId);
    return null;
  },
});

export const getClinicalDocsByCategory = query({
  args: { 
    userId: v.id("users"),
    category: v.string()
  },
  returns: v.array(v.object({
    _id: v.id("clinicalDocs"),
    _creationTime: v.number(),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    doctorId: v.optional(v.id("doctors")),
    isPrivate: v.boolean(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clinicalDocs")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", args.userId).eq("category", args.category)
      )
      .order("desc")
      .collect();
  },
});

export const getClinicalDocStats = query({
  args: { userId: v.id("users") },
  returns: v.object({
    totalDocuments: v.number(),
    thisMonth: v.number(),
    byCategory: v.record(v.string(), v.number()),
    priorityItems: v.number(),
  }),
  handler: async (ctx, args) => {
    const allDocs = await ctx.db
      .query("clinicalDocs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const thisMonth = allDocs.filter(doc => doc.createdAt >= oneMonthAgo).length;
    
    const byCategory: Record<string, number> = {};
    allDocs.forEach(doc => {
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
    });
    
    // Count priority items (documents with "High" priority tags or recent documents)
    const priorityItems = allDocs.filter(doc => 
      doc.tags.includes("High") || 
      doc.tags.includes("Priority") ||
      doc.createdAt >= oneMonthAgo
    ).length;
    
    return {
      totalDocuments: allDocs.length,
      thisMonth,
      byCategory,
      priorityItems,
    };
  },
});

export const getClinicalDocById = query({
  args: { docId: v.id("clinicalDocs") },
  returns: v.union(
    v.object({
      _id: v.id("clinicalDocs"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      content: v.string(),
      category: v.string(),
      tags: v.array(v.string()),
      attachments: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
      doctorId: v.optional(v.id("doctors")),
      isPrivate: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.docId);
  },
});

// ===== AI ASSISTANT CONVERSATIONS =====

export const createConversation = mutation({
  args: { userId: v.id("users") },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      userId: args.userId,
      messages: [],
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
  },
});

export const getConversation = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();
  },
});

// Internal function to get conversation by ID
export const getConversationById = internalQuery({
  args: { conversationId: v.id("conversations") },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.object({
      symptoms: v.optional(v.array(v.string())),
      severity: v.optional(v.string()),
      recommendations: v.optional(v.array(v.string())),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    
    const newMessage = {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      metadata: args.metadata,
    };
    
    const updatedMessages = [...conversation.messages, newMessage];
    
    await ctx.db.patch(args.conversationId, {
      messages: updatedMessages,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Internal function to update conversation with AI response
export const updateConversationWithAIResponse = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    aiResponse: v.object({
      role: v.literal("assistant"),
      content: v.string(),
      timestamp: v.number(),
      metadata: v.optional(v.object({
        symptoms: v.optional(v.array(v.string())),
        severity: v.optional(v.string()),
        recommendations: v.optional(v.array(v.string())),
      })),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    
    const updatedMessages = [...conversation.messages, args.aiResponse];
    
    await ctx.db.patch(args.conversationId, {
      messages: updatedMessages,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// ===== AI HEALTH ANALYSIS =====

export const analyzeHealthSymptoms = internalAction({
  args: {
    symptoms: v.string(),
    conversationId: v.id("conversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Try to call Perplexity AI first
      const aiResult = await ctx.runAction(api.myFunctions.callPerplexityAI, {
        symptoms: args.symptoms,
      });
      
      let structuredResponse;
      
      if (aiResult.success && aiResult.content) {
        // Parse the AI response to extract structured information
        structuredResponse = parseAIHealthResponse(aiResult.content, args.symptoms);
      } else {
        // Fallback to structured response if AI fails
        console.log('Perplexity AI failed, using fallback:', aiResult.error);
        structuredResponse = generateFallbackHealthResponse(args.symptoms);
      }
      
      // Get the current conversation
      const conversation = await ctx.runQuery(internal.myFunctions.getConversationById, {
        conversationId: args.conversationId,
      });
      
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      
      // Add the AI response to the conversation
      await ctx.runMutation(internal.myFunctions.updateConversationWithAIResponse, {
        conversationId: args.conversationId,
        aiResponse: {
          role: "assistant",
          content: structuredResponse.content,
          timestamp: Date.now(),
          metadata: {
            symptoms: structuredResponse.symptoms,
            severity: structuredResponse.severity,
            recommendations: structuredResponse.recommendations,
          },
        },
      });
    } catch (error) {
      console.error('Error in analyzeHealthSymptoms:', error);
      
      // Even if everything fails, try to add a fallback response
      try {
        const fallbackResponse = generateFallbackHealthResponse(args.symptoms);
        
        const conversation = await ctx.runQuery(internal.myFunctions.getConversationById, {
          conversationId: args.conversationId,
        });
        
        if (conversation) {
          await ctx.runMutation(internal.myFunctions.updateConversationWithAIResponse, {
            conversationId: args.conversationId,
            aiResponse: {
              role: "assistant",
              content: fallbackResponse.content,
              timestamp: Date.now(),
              metadata: {
                symptoms: fallbackResponse.symptoms,
                severity: fallbackResponse.severity,
                recommendations: fallbackResponse.recommendations,
              },
            },
          });
        }
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
      }
    }
    
    return null;
  },
});

// Action to call Perplexity AI with proper environment variable access
export const callPerplexityAI = action({
  args: {
    symptoms: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    content: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Get Perplexity API key from environment
      const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
      
      if (!PERPLEXITY_API_KEY) {
        return {
          success: false,
          error: "Perplexity API key not configured"
        };
      }
      
      // Call Perplexity AI API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{
            role: 'user',
            content: `Analyze these health symptoms: "${args.symptoms}". Provide a structured response with: 1) Problem summary, 2) Possible causes, 3) Severity level, 4) Immediate steps to take, 5) When to seek medical help, 6) Recommended tests, 7) Recommended specialist. Format as markdown.`
          }],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Perplexity AI API error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiContent = data.choices[0].message.content;
      
      return {
        success: true,
        content: aiContent
      };
    } catch (error) {
      console.error('Error calling Perplexity AI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },
});

// Public function for users to analyze symptoms
export const analyzeSymptoms = mutation({
  args: {
    symptoms: v.string(),
    userId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Check if input is health-related
      const healthKeywords = [
        'pain', 'ache', 'hurt', 'sore', 'fever', 'cough', 'cold', 'flu', 'headache', 'migraine',
        'stomach', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'indigestion', 'heartburn',
        'rash', 'itch', 'skin', 'burn', 'cut', 'bruise', 'swelling', 'inflammation',
        'dizzy', 'dizziness', 'faint', 'weakness', 'fatigue', 'tired', 'exhausted',
        'breathing', 'shortness of breath', 'chest pain', 'heart', 'blood pressure',
        'joint', 'muscle', 'back', 'neck', 'shoulder', 'knee', 'hip', 'arm', 'leg',
        'vision', 'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'dental',
        'cancer', 'tumor', 'lump', 'bump', 'growth', 'bleeding', 'infection',
        'allergy', 'asthma', 'diabetes', 'hypertension', 'arthritis', 'depression', 'anxiety'
      ];
      
      const lowerSymptoms = args.symptoms.toLowerCase();
      const isHealthRelated = healthKeywords.some(keyword => 
        lowerSymptoms.includes(keyword)
      );
      
      if (!isHealthRelated) {
        return {
          success: false,
          message: `I'm a specialized health and medical symptom analyzer. I can help you with health-related topics like symptoms, medical conditions, injuries, and general wellness. 

What you asked about: "${args.symptoms}"

Please describe any health symptoms, medical concerns, or wellness questions you have. I'm here to provide health-related guidance and recommendations.`
        };
      }
      
      // Get or create conversation for the user
      let conversation = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .unique();
      
      if (!conversation) {
        const newConversationId = await ctx.db.insert("conversations", {
          userId: args.userId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: true,
        });
        
        // Add user message to new conversation
        await ctx.db.patch(newConversationId, {
          messages: [
            {
              role: "user",
              content: args.symptoms,
              timestamp: Date.now(),
              metadata: {
                symptoms: [args.symptoms],
              },
            },
          ],
          updatedAt: Date.now(),
        });
        
        // Schedule AI analysis
        await ctx.scheduler.runAfter(0, internal.myFunctions.analyzeHealthSymptoms, {
          symptoms: args.symptoms,
          conversationId: newConversationId,
        });
      } else {
        // Add user message to existing conversation
        await ctx.db.patch(conversation._id, {
          messages: [
            ...conversation.messages,
            {
              role: "user",
              content: args.symptoms,
              timestamp: Date.now(),
              metadata: {
                symptoms: [args.symptoms],
              },
            },
          ],
          updatedAt: Date.now(),
        });
        
        // Schedule AI analysis
        await ctx.scheduler.runAfter(0, internal.myFunctions.analyzeHealthSymptoms, {
          symptoms: args.symptoms,
          conversationId: conversation._id,
        });
      }
      
      return {
        success: true,
        message: "Symptoms submitted for analysis. AI response will be available shortly.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to analyze symptoms. Please try again.",
      };
    }
  },
});

// Helper function to generate structured health responses using Perplexity AI
async function generatePerplexityHealthResponse(symptoms: string) {
  try {
    // For now, use fallback response until we set up proper environment variables
    // In production, you should set PERPLEXITY_API_KEY in your Convex dashboard
    console.log('Using fallback response - set PERPLEXITY_API_KEY in Convex dashboard for AI analysis');
    return generateFallbackHealthResponse(symptoms);
  } catch (error) {
    console.error('Error generating health response:', error);
    // Fallback to structured response
    return generateFallbackHealthResponse(symptoms);
  }
}

// Function to parse AI response and extract structured health information
function parseAIHealthResponse(aiContent: string, originalSymptoms: string) {
  try {
    // Extract key information from the AI response
    const problemMatch = aiContent.match(/## Health Problem Analysis: (.+?)(?:\n|$)/i) || 
                         aiContent.match(/Problem summary: (.+?)(?:\n|$)/i) ||
                         aiContent.match(/Problem: (.+?)(?:\n|$)/i);
    
    const causesMatch = aiContent.match(/Possible Causes:(.*?)(?:\*\*|$)/is) ||
                       aiContent.match(/Causes:(.*?)(?:\*\*|$)/is);
    
    const severityMatch = aiContent.match(/Severity Level: (.+?)(?:\n|$)/i) ||
                          aiContent.match(/Severity: (.+?)(?:\n|$)/i);
    
    const stepsMatch = aiContent.match(/Immediate Steps to Take:(.*?)(?:\*\*|$)/is) ||
                      aiContent.match(/Steps:(.*?)(?:\*\*|$)/is);
    
    const helpMatch = aiContent.match(/When to Seek Medical Help:(.*?)(?:\*\*|$)/is) ||
                     aiContent.match(/Seek Help:(.*?)(?:\*\*|$)/is);
    
    const testsMatch = aiContent.match(/Recommended Tests:(.*?)(?:\*\*|$)/is) ||
                      aiContent.match(/Tests:(.*?)(?:\*\*|$)/is);
    
    const specialistMatch = aiContent.match(/Recommended Specialist: (.+?)(?:\n|$)/i) ||
                           aiContent.match(/Specialist: (.+?)(?:\n|$)/i);
    
    // Extract and clean the matched content
    const problem = problemMatch ? problemMatch[1].trim() : originalSymptoms;
    const causes = causesMatch ? 
      causesMatch[1].split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim()) : 
      ['Various possible causes'];
    const severity = severityMatch ? severityMatch[1].trim() : 'Moderate';
    const steps = stepsMatch ? 
      stepsMatch[1].split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim()) : 
      ['Consult a healthcare professional'];
    const help = helpMatch ? 
      helpMatch[1].split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim()) : 
      ['If symptoms persist or worsen'];
    const tests = testsMatch ? 
      testsMatch[1].split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim()) : 
      ['General health assessment'];
    const specialist = specialistMatch ? specialistMatch[1].trim() : 'General Practitioner';
    
    return {
      content: aiContent,
      symptoms: [problem],
      severity: severity,
      recommendations: [...steps, ...help]
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return fallback if parsing fails
    return generateFallbackHealthResponse(originalSymptoms);
  }
}

// Fallback function for when Perplexity AI is not available
function generateFallbackHealthResponse(symptoms: string) {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Common health conditions and their structured responses
  const healthConditions = {
    headache: {
      problem: "Headache",
      possibleCauses: [
        "Tension or stress",
        "Dehydration",
        "Eye strain",
        "Sinus pressure",
        "Caffeine withdrawal",
        "Lack of sleep"
      ],
      severity: "Moderate",
      immediateSteps: [
        "Rest in a quiet, dark room",
        "Stay hydrated with water",
        "Apply cold or warm compress to forehead",
        "Practice deep breathing exercises",
        "Take over-the-counter pain relievers if needed"
      ],
      whenToSeekHelp: [
        "Severe, sudden headache",
        "Headache with fever and stiff neck",
        "Headache after head injury",
        "Headache with confusion or loss of consciousness"
      ],
      recommendedTests: ["Blood pressure check", "Eye examination"],
      specialist: "Neurologist or General Practitioner"
    },
    fever: {
      problem: "Fever",
      possibleCauses: [
        "Viral or bacterial infection",
        "Inflammatory conditions",
        "Heat exhaustion",
        "Medication side effects",
        "Autoimmune disorders"
      ],
      severity: "Moderate to High",
      immediateSteps: [
        "Rest and stay hydrated",
        "Take acetaminophen or ibuprofen",
        "Use cool compresses",
        "Wear light clothing",
        "Monitor temperature regularly"
      ],
      whenToSeekHelp: [
        "Temperature above 103°F (39.4°C)",
        "Fever lasting more than 3 days",
        "Fever with severe symptoms",
        "Fever in infants under 3 months"
      ],
      recommendedTests: ["Complete blood count", "Urine analysis", "Chest X-ray if needed"],
      specialist: "General Practitioner or Infectious Disease Specialist"
    },
    cough: {
      problem: "Cough",
      possibleCauses: [
        "Upper respiratory infection",
        "Allergies",
        "Post-nasal drip",
        "Acid reflux",
        "Asthma",
        "Smoking or environmental irritants"
      ],
      severity: "Mild to Moderate",
      immediateSteps: [
        "Stay hydrated with warm fluids",
        "Use honey for soothing (adults only)",
        "Use a humidifier",
        "Avoid irritants and smoking",
        "Rest your voice"
      ],
      whenToSeekHelp: [
        "Cough lasting more than 2 weeks",
        "Cough with blood or colored mucus",
        "Cough with chest pain or difficulty breathing",
        "Cough with fever"
      ],
      recommendedTests: ["Chest X-ray", "Spirometry", "Allergy testing"],
      specialist: "Pulmonologist or General Practitioner"
    },
    fatigue: {
      problem: "Fatigue",
      possibleCauses: [
        "Lack of sleep",
        "Stress or anxiety",
        "Poor nutrition",
        "Anemia",
        "Thyroid disorders",
        "Chronic conditions"
      ],
      severity: "Mild to Moderate",
      immediateSteps: [
        "Ensure 7-9 hours of quality sleep",
        "Maintain regular sleep schedule",
        "Exercise regularly (moderate intensity)",
        "Eat balanced meals",
        "Manage stress through relaxation techniques"
      ],
      whenToSeekHelp: [
        "Fatigue lasting more than 2 weeks",
        "Fatigue with other concerning symptoms",
        "Fatigue affecting daily activities",
        "Fatigue with weight changes"
      ],
      recommendedTests: ["Complete blood count", "Thyroid function tests", "Vitamin D levels"],
      specialist: "General Practitioner or Endocrinologist"
    },
    nausea: {
      problem: "Nausea",
      possibleCauses: [
        "Gastroenteritis",
        "Food poisoning",
        "Motion sickness",
        "Pregnancy",
        "Medication side effects",
        "Anxiety or stress"
      ],
      severity: "Mild to Moderate",
      immediateSteps: [
        "Rest and avoid sudden movements",
        "Stay hydrated with small sips of clear fluids",
        "Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)",
        "Avoid strong odors and greasy foods",
        "Practice deep breathing exercises"
      ],
      whenToSeekHelp: [
        "Severe or persistent nausea",
        "Nausea with severe abdominal pain",
        "Nausea with vomiting blood",
        "Nausea with signs of dehydration"
      ],
      recommendedTests: ["Blood tests", "Stool analysis", "Abdominal ultrasound if needed"],
      specialist: "Gastroenterologist or General Practitioner"
    },
    chestPain: {
      problem: "Chest Pain",
      possibleCauses: [
        "Angina or heart disease",
        "Musculoskeletal issues",
        "Gastroesophageal reflux disease (GERD)",
        "Anxiety or panic attacks",
        "Respiratory conditions",
        "Costochondritis"
      ],
      severity: "High - Seek Immediate Medical Attention",
      immediateSteps: [
        "Stop any physical activity immediately",
        "Sit or lie down in a comfortable position",
        "Call emergency services if severe",
        "Take prescribed medications if available",
        "Stay calm and breathe slowly"
      ],
      whenToSeekHelp: [
        "Severe, crushing chest pain",
        "Pain radiating to arm, jaw, or back",
        "Chest pain with shortness of breath",
        "Chest pain with sweating or nausea",
        "Chest pain lasting more than 5 minutes"
      ],
      recommendedTests: ["Electrocardiogram (ECG)", "Blood tests", "Chest X-ray", "Stress test"],
      specialist: "Cardiologist or Emergency Medicine"
    },
    dizziness: {
      problem: "Dizziness",
      possibleCauses: [
        "Inner ear problems",
        "Low blood pressure",
        "Dehydration",
        "Anxiety or stress",
        "Medication side effects",
        "Neurological conditions"
      ],
      severity: "Moderate",
      immediateSteps: [
        "Sit or lie down immediately",
        "Stay hydrated with water",
        "Avoid sudden movements",
        "Focus on a fixed point",
        "Practice deep breathing"
      ],
      whenToSeekHelp: [
        "Severe or persistent dizziness",
        "Dizziness with chest pain",
        "Dizziness with vision changes",
        "Dizziness with difficulty walking",
        "Dizziness with severe headache"
      ],
      recommendedTests: ["Blood pressure check", "Blood tests", "Neurological examination", "Hearing tests"],
      specialist: "Neurologist or Otolaryngologist"
    }
  };
  
  // Find matching condition or provide general guidance
  let response = healthConditions.headache; // Default response
  
  for (const [condition, details] of Object.entries(healthConditions)) {
    if (lowerSymptoms.includes(condition)) {
      response = details;
      break;
    }
  }
  
  // Generate structured content
  const content = `## Health Problem Analysis: ${response.problem}

**Possible Causes:**
${response.possibleCauses.map(cause => `• ${cause}`).join('\n')}

**Severity Level:** ${response.severity}

**Immediate Steps to Take:**
${response.immediateSteps.map(step => `• ${step}`).join('\n')}

**When to Seek Medical Help:**
${response.whenToSeekHelp.map(warning => `• ${warning}`).join('\n')}

**Recommended Tests:**
${response.recommendedTests.map(test => `• ${test}`).join('\n')}

**Recommended Specialist:** ${response.specialist}

*Note: This analysis is for informational purposes only. Always consult with a healthcare professional for proper diagnosis and treatment.*`;

  return {
    content,
    symptoms: [response.problem],
    severity: response.severity,
    recommendations: [...response.immediateSteps, ...response.whenToSeekHelp]
  };
}

// ===== APPOINTMENTS =====

export const createAppointment = mutation({
  args: {
    userId: v.id("users"),
    doctorId: v.id("doctors"),
    scheduledTime: v.number(),
    type: v.union(
      v.literal("consultation"),
      v.literal("follow_up"),
      v.literal("emergency")
    ),
    notes: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
    });
  },
});

export const getAppointments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    updates: v.object({
      status: v.optional(v.union(
        v.literal("scheduled"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled")
      )),
      notes: v.optional(v.string()),
      prescription: v.optional(v.array(v.id("medicines"))),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.appointmentId, args.updates);
  },
});

// ===== FILE UPLOAD =====

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ===== DEMO FUNCTIONS (for the main page) =====

export const viewer = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    // This is a demo function that returns a placeholder viewer name
    // In a real app, you'd get the actual authenticated user
    return "Demo User";
  },
});

export const listNumbers = query({
  args: { count: v.number() },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    // This is a demo function that returns random numbers
    // In a real app, you'd query your actual data
    const numbers = [];
    for (let i = 0; i < args.count; i++) {
      numbers.push(Math.floor(Math.random() * 100));
    }
    return numbers;
  },
});

export const addNumber = mutation({
  args: { value: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // This is a demo function that just logs the number
    // In a real app, you'd save this to your database
    console.log(`Adding number: ${args.value}`);
    return null;
  },
});
