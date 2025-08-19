import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useCurrentUser } from "@/hooks/useConvex";
import { useMutation } from "convex/react";
import { api } from "../../../backend/convex/_generated/api";

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useCurrentUser();
  const createUserProfile = useMutation(api.myFunctions.createUserProfile);

  useEffect(() => {
    if (isSignedIn && userId && clerkUser && convexUser === null) {
      console.log("Creating user profile for:", userId);
      
      const createProfile = async () => {
        try {
          await createUserProfile({
            clerkId: userId,
            email: clerkUser.primaryEmailAddress?.emailAddress || "user@example.com",
            name: clerkUser.fullName || "User",
            avatar: clerkUser.imageUrl,
          });
          console.log("User profile created successfully");
        } catch (error) {
          console.error("Failed to create user profile:", error);
        }
      };

      // Add a small delay to prevent rapid duplicate creation attempts
      const timeoutId = setTimeout(createProfile, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isSignedIn, userId, clerkUser, convexUser, createUserProfile]);

  return <>{children}</>;
};
