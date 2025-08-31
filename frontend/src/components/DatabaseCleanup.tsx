import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export const DatabaseCleanup = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [result, setResult] = useState<string>("");
  const cleanupDuplicateProfiles = useMutation("myFunctions:cleanupDuplicateProfiles");

  const handleCleanup = async () => {
    setIsCleaning(true);
    setResult("");
    
    try {
      const result = await cleanupDuplicateProfiles({});
      setResult(`✅ ${result.message}`);
      console.log("Cleanup result:", result);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
      console.error("Cleanup failed:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold mb-2">Database Cleanup</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Remove duplicate user profiles that may be causing errors.
      </p>
      <Button 
        onClick={handleCleanup} 
        disabled={isCleaning}
        variant="outline"
        size="sm"
      >
        {isCleaning ? "Cleaning..." : "Clean Duplicate Profiles"}
      </Button>
      {result && (
        <p className="mt-2 text-sm">{result}</p>
      )}
    </div>
  );
};
