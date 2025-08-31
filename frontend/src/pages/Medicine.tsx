import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Plus,
  Minus,
  Star,
  Truck,
  Shield,
  Clock,
  Loader2
} from "lucide-react";
import { useMedicines, useCart } from "@/hooks/useConvex";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

const categories = ['All', 'Pain Relief', 'Vitamins', 'Digestive Health', 'Antibiotics', 'Allergy'];

const Medicine = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  
  // Fetch medicines from Convex
  const medicines = useMedicines(
    selectedCategory === "All" ? undefined : selectedCategory,
    searchTerm || undefined
  );
  
  // Cart functionality
  const { cartItems, addItemToCart, updateItemQuantity, removeItemFromCart } = useCart();

  // Set loading timeout after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (medicines === undefined) {
        setLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [medicines]);

  const filteredMedicines = medicines || [];

  const addToCart = async (medicineId: string) => {
    if (!isSignedIn) {
      // Handle authentication requirement
      return;
    }
    
    try {
      await addItemToCart(medicineId, 1);
      
      // Find the medicine name for the toast
      const medicine = medicines?.find(m => m._id === medicineId);
      
      toast({
        title: "Added to Cart!",
        description: `${medicine?.name || 'Medicine'} has been added to your cart.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await removeItemFromCart(cartItemId);
      
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateItemQuantity(cartItemId, quantity);
      
      if (quantity === 0) {
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Cart Updated",
          description: `Quantity updated to ${quantity}.`,
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getTotalItems = () => {
    return cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getTotalPrice = () => {
    return cartItems?.reduce((total, item) => {
      return total + (item.medicine?.price || 0) * item.quantity;
    }, 0) || 0;
  };

  const getCartItemQuantity = (medicineId: string) => {
    const cartItem = cartItems?.find(item => item.medicineId === medicineId);
    return cartItem?.quantity || 0;
  };

  const getCartItemId = (medicineId: string) => {
    const cartItem = cartItems?.find(item => item.medicineId === medicineId);
    return cartItem?._id;
  };

    // Handle loading state with timeout
  if (medicines === undefined) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
                <ShoppingCart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Medicine Ordering</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Order medicines online with fast delivery and verified quality
            </p>
          </div>

          {/* Loading State with Help */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-blue-800">
                  {loadingTimeout ? 'Loading Timeout - Connection Issue Detected' : 'Loading Medicines...'}
                </h3>
                <p className="text-blue-600 mb-4">
                  {loadingTimeout 
                    ? 'The connection to the medicine database has timed out. This usually means:'
                    : 'This is taking longer than expected. The issue might be:'
                  }
                </p>
                <div className="space-y-3">
                  <ul className="text-sm text-blue-600 space-y-1 text-left">
                    <li>• Convex backend is not running</li>
                    <li>• Database connection issues</li>
                    <li>• Network connectivity problems</li>
                  </ul>
                  
                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      🔄 Refresh Page
                    </Button>
                    
                    {loadingTimeout && (
                      <Button 
                        onClick={() => window.open('test_medicine_connection.html', '_blank')}
                        className="w-full bg-red-600 text-white hover:bg-red-700"
                      >
                        🧪 Test Database Connection
                      </Button>
                    )}
                    
                    <div className="text-xs text-blue-500">
                      💡 Tip: Make sure your Convex backend is running on port 3210
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Show sample medicines if timeout occurs */}
          {loadingTimeout && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sample Medicines (Demo Mode)</h3>
                <p className="text-sm text-gray-500">These are sample medicines to show the interface</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  {
                    _id: 'demo-1',
                    name: 'Paracetamol',
                    description: 'Pain reliever and fever reducer',
                    price: 5.99,
                    category: 'Pain Relief',
                    dosage: '500mg',
                    manufacturer: 'Generic Pharma',
                    inStock: true,
                    prescriptionRequired: false,
                    genericName: 'Acetaminophen'
                  },
                  {
                    _id: 'demo-2',
                    name: 'Ibuprofen',
                    description: 'Anti-inflammatory pain reliever',
                    price: 7.99,
                    category: 'Pain Relief',
                    dosage: '400mg',
                    manufacturer: 'HealthCare Inc',
                    inStock: true,
                    prescriptionRequired: false,
                    genericName: 'Ibuprofen'
                  },
                  {
                    _id: 'demo-3',
                    name: 'Cetirizine',
                    description: 'Antihistamine for allergies',
                    price: 12.99,
                    category: 'Allergy',
                    dosage: '10mg',
                    manufacturer: 'AllergyCare',
                    inStock: true,
                    prescriptionRequired: false,
                    genericName: 'Cetirizine'
                  }
                ].map((medicine) => (
                  <Card key={medicine._id} className="hover:shadow-medium transition-shadow duration-200">
                    <CardHeader className="p-4 pb-2">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">Demo</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg leading-tight">{medicine.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">Demo</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{medicine.description}</p>
                        {medicine.genericName && (
                          <p className="text-xs text-muted-foreground">
                            Generic: {medicine.genericName}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">${medicine.price}</span>
                        </div>
                        <div className="text-center">
                          <Button disabled className="w-full">
                            Demo Mode - Not Functional
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Debug Info</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Medicines Status: {medicines === undefined ? 'Loading...' : medicines === null ? 'Error' : `Loaded (${medicines.length})`}</p>
              <p>Search Term: {searchTerm || 'None'}</p>
              <p>Selected Category: {selectedCategory}</p>
              <p>Cart Items: {cartItems?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <ShoppingCart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Medicine Ordering</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Order medicines online with fast delivery and verified quality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary-soft/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">
                    {getTotalItems()} items in cart
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-primary">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                  <Button className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong">
                    Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Medicines Message */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Medicines Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "All" 
                    ? `No medicines match your search "${searchTerm}" in category "${selectedCategory}"`
                    : "The medicine catalog is empty. This usually means the database hasn't been seeded yet."
                  }
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    To get started, you can:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Try a different search term</li>
                    <li>• Select a different category</li>
                    <li>• Run the database seed function</li>
                    <li>• Check your Convex backend connection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine) => {
            const cartQuantity = getCartItemQuantity(medicine._id);
            const cartItemId = getCartItemId(medicine._id);
            
            return (
              <Card key={medicine._id} className="hover:shadow-medium transition-shadow duration-200">
                <CardHeader className="p-4 pb-2">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {medicine.imageUrl ? (
                      <img 
                        src={medicine.imageUrl} 
                        alt={medicine.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">No Image</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{medicine.name}</CardTitle>
                      {medicine.prescriptionRequired && (
                        <Badge variant="secondary" className="text-xs">Rx</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{medicine.description}</p>
                    {medicine.genericName && (
                      <p className="text-xs text-muted-foreground">
                        Generic: {medicine.genericName}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">${medicine.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="w-3 h-3" />
                      <span>Free delivery</span>
                      <Shield className="w-3 h-3 ml-2" />
                      <span>Verified</span>
                    </div>

                    {medicine.inStock ? (
                      <div className="flex items-center justify-between">
                        {cartQuantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cartItemId && updateQuantity(cartItemId, cartQuantity - 1)}
                              className="w-8 h-8 p-0"
                              disabled={!isSignedIn}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{cartQuantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cartItemId && updateQuantity(cartItemId, cartQuantity + 1)}
                              className="w-8 h-8 p-0"
                              disabled={!isSignedIn}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(medicine._id)}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            size="sm"
                            disabled={!isSignedIn}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No medicines found matching your criteria.</p>
          </div>
        )}

        {!isSignedIn && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Please sign in to add items to your cart.
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {isSignedIn && getTotalItems() > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40"
        >
          <Button
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-strong hover:shadow-stronger rounded-full w-14 h-14 p-0 relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {getTotalItems() > 99 ? '99+' : getTotalItems()}
            </span>
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Medicine;