import { mutation } from "./_generated/server";

export const simpleSeed = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Add just one medicine to test
    const medicine = {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      description: "Pain reliever and fever reducer",
      price: 5.99,
      category: "Pain Relief",
      dosage: "500mg",
      manufacturer: "Generic Pharma",
      inStock: true,
      prescriptionRequired: false,
      activeIngredients: ["Acetaminophen"],
      sideEffects: ["Nausea", "Liver problems in high doses"],
      instructions: "Take 1-2 tablets every 4-6 hours as needed",
    };

    await ctx.db.insert("medicines", medicine);
    
    console.log("Added Paracetamol to database!");
    return "Medicine added successfully";
  },
});
