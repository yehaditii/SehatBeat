import { useState } from "react";
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

const categories = ['All', 'Pain Relief', 'Vitamins', 'Digestive Health', 'Antibiotics', 'Allergy'];

const Medicine = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { isSignedIn } = useAuth();
  
  // Fetch medicines from Convex
  const medicines = useMedicines(
    selectedCategory === "All" ? undefined : selectedCategory,
    searchTerm || undefined
  );
  
  // Cart functionality
  const { cartItems, addItemToCart, updateItemQuantity, removeItemFromCart } = useCart();

  const filteredMedicines = medicines || [];

  const addToCart = async (medicineId: string) => {
    if (!isSignedIn) {
      // Handle authentication requirement
      return;
    }
    await addItemToCart(medicineId, 1);
  };

  const removeFromCart = async (cartItemId: string) => {
    await removeItemFromCart(cartItemId);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    await updateItemQuantity(cartItemId, quantity);
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

  if (medicines === undefined) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading medicines...</span>
        </div>
      </div>
    );
  }

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
    </div>
  );
};

export default Medicine;