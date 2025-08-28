import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/clerk-react";

// Custom hook for getting current user
export const useCurrentUser = () => {
  const { userId } = useAuth();
  
  const user = useQuery("getUserProfile", 
    userId ? { clerkId: userId } : "skip"
  );
  
  return user;
};

// Custom hook for medicines
export const useMedicines = (category?: string, search?: string) => {
  return useQuery("getMedicines", { category, search });
};

// Custom hook for cart
export const useCart = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const cartItems = useQuery(
    "getCartItems",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const addToCart = useMutation("addToCart");
  const updateCartItem = useMutation("updateCartItem");
  const removeFromCart = useMutation("removeFromCart");
  
  const addItemToCart = async (medicineId: string, quantity: number) => {
    if (!user?._id) return;
    await addToCart({ userId: user._id, medicineId: medicineId as Id<"medicines">, quantity });
  };
  
  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    await updateCartItem({ cartItemId: cartItemId as Id<"cartItems">, quantity });
  };
  
  const removeItemFromCart = async (cartItemId: string) => {
    await removeFromCart({ cartItemId: cartItemId as Id<"cartItems"> });
  };
  
  return {
    cartItems,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    isLoading: user === undefined,
    userLoaded: !!user?._id,
  };
};

// Custom hook for reminders
export const useReminders = (activeOnly = true) => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const reminders = useQuery(
    "getReminders",
    user?._id ? { userId: user._id, activeOnly } : "skip"
  );
  
  const createReminder = useMutation("createReminder");
  const updateReminder = useMutation("updateReminder");
  const deleteReminder = useMutation("deleteReminder");
  
  const addReminder = async (reminderData: {
    type: "medication" | "appointment" | "lab_test";
    title: string;
    description: string;
    scheduledTime: number;
    repeatPattern?: string;
    medicineId?: string;
    dosage?: string;
    doctorId?: string;
    labTestId?: string;
  }) => {
    if (!user?._id) return;
    await createReminder({ userId: user._id, ...reminderData });
  };
  
  const updateReminderItem = async (reminderId: string, updates: any) => {
    await updateReminder({ reminderId, updates });
  };
  
  const deleteReminderItem = async (reminderId: string) => {
    await deleteReminder({ reminderId });
  };
  
  return {
    reminders,
    addReminder,
    updateReminderItem,
    deleteReminderItem,
  };
};

// Custom hook for lab tests
export const useLabTests = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const labTests = useQuery(
    "getLabTests",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createLabTest = useMutation("createLabTest");
  const updateLabTest = useMutation("updateLabTest");
  
  const addLabTest = async (labTestData: {
    testName: string;
    testType: string;
    scheduledDate: number;
    labName?: string;
    labAddress?: string;
    fastingRequired?: boolean;
    instructions?: string;
  }) => {
    if (!user?._id) return;
    await createLabTest({ userId: user._id, ...labTestData });
  };
  
  const updateLabTestItem = async (labTestId: string, updates: any) => {
    await updateLabTest({ labTestId, updates });
  };
  
  return {
    labTests,
    addLabTest,
    updateLabTestItem,
  };
};

// Custom hook for doctors
export const useDoctors = (specialization?: string, location?: string) => {
  return useQuery("getDoctors", { specialization, location });
};

// Custom hook for clinical documents
export const useClinicalDocs = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  console.log("useClinicalDocs - userId:", userId);
  console.log("useClinicalDocs - user:", user);
  console.log("useClinicalDocs - user?._id:", user?._id);
  
  const clinicalDocs = useQuery(
    "getClinicalDocs",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const clinicalDocsStats = useQuery(
    "getClinicalDocStats",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const getClinicalDocById = useQuery(
    "getClinicalDocById",
    "skip"
  );
  
  const createClinicalDoc = useMutation("createClinicalDoc");
  const updateClinicalDoc = useMutation("updateClinicalDoc");
  const deleteClinicalDoc = useMutation("deleteClinicalDoc");
  
  const addClinicalDoc = async (docData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    attachments?: string[];
    doctorId?: string;
    isPrivate: boolean;
  }) => {
    console.log("addClinicalDoc called with:", docData);
    console.log("Current user ID:", user?._id);
    
    if (!user?._id) {
      console.error("Cannot create clinical document: User not authenticated or loaded");
      throw new Error("User not authenticated. Please log in to create clinical documents.");
    }
    
    try {
      console.log("Creating clinical document with userId:", user._id);
      const result = await createClinicalDoc({ userId: user._id, ...docData });
      console.log("Clinical document created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating clinical document:", error);
      throw error;
    }
  };
  
  const updateDoc = async (docId: string, updates: any) => {
    try {
      // Check if this is a local document
      if (String(docId).startsWith('local-')) {
        // For local documents, we'll let the calling component handle the update
        // This allows the component to update its local state
        throw new Error('Local document - update handled by component');
      }
      
      // For remote documents, call the Convex mutation
      await updateClinicalDoc({ docId, updates });
    } catch (error) {
      console.error("Error updating clinical document:", error);
      throw error;
    }
  };
  
  const deleteDoc = async (docId: string) => {
    try {
      // Check if this is a local document
      if (String(docId).startsWith('local-')) {
        // For local documents, we'll let the calling component handle the deletion
        // This allows the component to update its local state
        throw new Error('Local document - deletion handled by component');
      }
      
      // For remote documents, call the Convex mutation
      await deleteClinicalDoc({ docId });
    } catch (error) {
      console.error("Error deleting clinical document:", error);
      throw error;
    }
  };
  
  return {
    clinicalDocs,
    clinicalDocsStats,
    addClinicalDoc,
    updateDoc,
    deleteDoc,
    isUserLoaded: !!user?._id,
    currentUser: user,
  };
};

// Custom hook for AI conversations
export const useConversation = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const conversation = useQuery(
    "getConversation",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createConversation = useMutation("createConversation");
  const addMessage = useMutation("addMessage");
  
  const startConversation = async () => {
    if (!user?._id) return;
    await createConversation({ userId: user._id });
  };
  
  const sendMessage = async (content: string, metadata?: any) => {
    if (!conversation?._id) return;
    await addMessage({
      conversationId: conversation._id,
      role: "user",
      content,
      metadata,
    });
  };
  
  return {
    conversation,
    startConversation,
    sendMessage,
  };
};

// Custom hook for appointments
export const useAppointments = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const appointments = useQuery(
    "getAppointments",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createAppointment = useMutation("createAppointment");
  const updateAppointment = useMutation("updateAppointment");
  
  const bookAppointment = async (appointmentData: {
    doctorId: string;
    scheduledTime: number;
    type: "consultation" | "follow_up" | "emergency";
    notes?: string;
    symptoms?: string[];
  }) => {
    if (!user?._id) return;
    await createAppointment({ userId: user._id, ...appointmentData });
  };
  
  const updateAppointmentItem = async (appointmentId: string, updates: any) => {
    await updateAppointment({ appointmentId, updates });
  };
  
  return {
    appointments,
    bookAppointment,
    updateAppointmentItem,
  };
};

// Custom hook for orders
export const useOrders = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const orders = useQuery(
    "getOrders",
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createOrder = useMutation("createOrder");
  
  const placeOrder = async (orderData: {
    items: Array<{
      medicineId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) => {
    if (!user?._id) return;
    await createOrder({ userId: user._id, ...orderData });
  };
  
  return {
    orders,
    placeOrder,
  };
};
