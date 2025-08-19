import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Plus,
  Minus,
  Trash2,
  Truck,
  Shield,
  CreditCard,
  MapPin,
  Loader2
} from "lucide-react";
import { useCart } from "@/hooks/useConvex";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseCleanup } from "@/components/DatabaseCleanup";
import { Checkout } from "@/components/Checkout";

const Cart = () => {
  const { isSignedIn } = useAuth();
  const { cartItems, updateItemQuantity, removeItemFromCart, isLoading, userLoaded } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const getTotalItems = () => {
    return cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getTotalPrice = () => {
    return cartItems?.reduce((total, item) => {
      return total + (item.medicine?.price || 0) * item.quantity;
    }, 0) || 0;
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeItemFromCart(cartItemId);
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart.",
          duration: 3000,
        });
      } else {
        await updateItemQuantity(cartItemId, newQuantity);
        toast({
          title: "Cart Updated",
          description: `Quantity updated to ${newQuantity}.`,
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
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

  const handleCheckout = async () => {
    if (!isSignedIn || !cartItems || cartItems.length === 0) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    toast({
      title: "Order Placed Successfully!",
      description: "Your order has been confirmed and will be processed soon.",
      duration: 5000,
    });
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view your cart</h2>
          <p className="text-muted-foreground">Please sign in to access your shopping cart.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading user profile...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a moment on first login</p>
        </div>
      </div>
    );
  }

  if (cartItems === undefined) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading cart...</p>
          <div className="mt-4 p-4 bg-muted rounded-lg text-left text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>User Loaded: {userLoaded ? 'Yes' : 'No'}</p>
            <p>Cart Items: {cartItems === undefined ? 'undefined' : cartItems === null ? 'null' : cartItems.length}</p>
            <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
          
          {/* Temporary cleanup component */}
          <div className="mt-4">
            <DatabaseCleanup />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any medicines to your cart yet.
            </p>
            <Button 
              onClick={() => window.location.href = '/medicine'} 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show checkout component if checkout is active
  if (showCheckout) {
    return (
      <Checkout
        cartItems={cartItems}
        totalAmount={getTotalPrice()}
        onSuccess={handleCheckoutSuccess}
        onCancel={handleCheckoutCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
                         <div className="p-3 bg-primary rounded-xl">
               <ShoppingCart className="w-8 h-8 text-primary-foreground" />
             </div>
            <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
                             <Card key={item._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.medicine?.imageUrl ? (
                        <img 
                          src={item.medicine.imageUrl} 
                          alt={item.medicine.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm text-center">No Image</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {item.medicine?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.medicine?.description}
                          </p>
                          {item.medicine?.genericName && (
                            <p className="text-xs text-muted-foreground">
                              Generic: {item.medicine.genericName}
                            </p>
                          )}
                        </div>
                        {item.medicine?.prescriptionRequired && (
                          <Badge variant="secondary" className="text-xs">Rx</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">
                            ${item.medicine?.price}
                          </span>
                          <span className="text-muted-foreground">× {item.quantity}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item._id)}
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                                     <Button 
                     onClick={handleCheckout}
                     disabled={isCheckingOut || cartItems.length === 0}
                     className="w-full"
                   >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/medicine'}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span>Free delivery on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Secure checkout with encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>Fast delivery to your address</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
