import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ===== USER MANAGEMENT =====

export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, args.updates);
  },
});

// ===== MEDICINE CATALOG =====

export const getMedicines = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
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
  handler: async (ctx, args) => {
    return await ctx.db.get(args.medicineId);
  },
});

// ===== CART MANAGEMENT =====

export const getCartItems = query({
  args: { userId: v.id("users") },
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
  handler: async (ctx, args) => {
    // Check if item already exists in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("medicineId"), args.medicineId))
      .unique();
    
    if (existingItem) {
      // Update quantity
      return await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
    } else {
      // Add new item
      return await ctx.db.insert("cartItems", {
        userId: args.userId,
        medicineId: args.medicineId,
        quantity: args.quantity,
        addedAt: Date.now(),
      });
    }
  },
});

export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      return await ctx.db.delete(args.cartItemId);
    }
    return await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cartItems") },
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
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.docId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteClinicalDoc = mutation({
  args: { docId: v.id("clinicalDocs") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.docId);
  },
});

// ===== AI ASSISTANT CONVERSATIONS =====

export const createConversation = mutation({
  args: { userId: v.id("users") },
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
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();
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
    
    return await ctx.db.patch(args.conversationId, {
      messages: updatedMessages,
      updatedAt: Date.now(),
    });
  },
});

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
