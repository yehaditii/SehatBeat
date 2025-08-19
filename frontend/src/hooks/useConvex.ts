import { useQuery, useMutation } from "convex/react";
import { api } from "../../../backend/convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { Id } from "../../../backend/convex/_generated/dataModel";

// Custom hook for getting current user
export const useCurrentUser = () => {
  const { userId } = useAuth();
  
  const user = useQuery(api.myFunctions.getUserProfile, 
    userId ? { clerkId: userId } : "skip"
  );
  
  return user;
};

// Custom hook for medicines
export const useMedicines = (category?: string, search?: string) => {
  return useQuery(api.myFunctions.getMedicines, { category, search });
};

// Custom hook for cart
export const useCart = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const cartItems = useQuery(
    api.myFunctions.getCartItems,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const addToCart = useMutation(api.myFunctions.addToCart);
  const updateCartItem = useMutation(api.myFunctions.updateCartItem);
  const removeFromCart = useMutation(api.myFunctions.removeFromCart);
  
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
    api.myFunctions.getReminders,
    user?._id ? { userId: user._id, activeOnly } : "skip"
  );
  
  const createReminder = useMutation(api.myFunctions.createReminder);
  const updateReminder = useMutation(api.myFunctions.updateReminder);
  const deleteReminder = useMutation(api.myFunctions.deleteReminder);
  
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
    api.myFunctions.getLabTests,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createLabTest = useMutation(api.myFunctions.createLabTest);
  const updateLabTest = useMutation(api.myFunctions.updateLabTest);
  
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
  return useQuery(api.myFunctions.getDoctors, { specialization, location });
};

// Custom hook for clinical documents
export const useClinicalDocs = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const clinicalDocs = useQuery(
    api.myFunctions.getClinicalDocs,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createClinicalDoc = useMutation(api.myFunctions.createClinicalDoc);
  const updateClinicalDoc = useMutation(api.myFunctions.updateClinicalDoc);
  const deleteClinicalDoc = useMutation(api.myFunctions.deleteClinicalDoc);
  
  const addClinicalDoc = async (docData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    attachments?: string[];
    doctorId?: string;
    isPrivate: boolean;
  }) => {
    if (!user?._id) return;
    await createClinicalDoc({ userId: user._id, ...docData });
  };
  
  const updateDoc = async (docId: string, updates: any) => {
    await updateClinicalDoc({ docId, updates });
  };
  
  const deleteDoc = async (docId: string) => {
    await deleteClinicalDoc({ docId });
  };
  
  return {
    clinicalDocs,
    addClinicalDoc,
    updateDoc,
    deleteDoc,
  };
};

// Custom hook for AI conversations
export const useConversation = () => {
  const { userId } = useAuth();
  const user = useCurrentUser();
  
  const conversation = useQuery(
    api.myFunctions.getConversation,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createConversation = useMutation(api.myFunctions.createConversation);
  const addMessage = useMutation(api.myFunctions.addMessage);
  
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
    api.myFunctions.getAppointments,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createAppointment = useMutation(api.myFunctions.createAppointment);
  const updateAppointment = useMutation(api.myFunctions.updateAppointment);
  
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
    api.myFunctions.getOrders,
    user?._id ? { userId: user._id } : "skip"
  );
  
  const createOrder = useMutation(api.myFunctions.createOrder);
  
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
