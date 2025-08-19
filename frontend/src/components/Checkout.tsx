import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  User, 
  Loader2,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../../backend/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useConvex";
import { useClerkBilling } from "@/config/clerk";

interface CheckoutProps {
  cartItems: any[];
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const Checkout = ({ cartItems, totalAmount, onSuccess, onCancel }: CheckoutProps) => {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  
  const convexUser = useCurrentUser();
  const createOrder = useMutation(api.myFunctions.createOrder);
  const { createPaymentIntent, confirmPayment } = useClerkBilling();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: clerkUser?.firstName || '',
    lastName: clerkUser?.lastName || '',
    email: clerkUser?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleProceedToPayment = () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!isSignedIn || !userId || !convexUser?._id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calculate total amount with tax and shipping
      const taxAmount = totalAmount * 0.08;
      const shippingAmount = totalAmount >= 50 ? 0 : 5.99;
      const totalWithFees = totalAmount + taxAmount + shippingAmount;
      
      // Create payment intent with Clerk
      const paymentIntent = await createPaymentIntent(Math.round(totalWithFees * 100)); // Convert to cents
      
      // Collect payment method data from form state
      const paymentMethod = {
        type: 'card',
        card: {
          number: paymentData.cardNumber,
          exp_month: parseInt(paymentData.expiry.split('/')[0] || '0'),
          exp_year: parseInt('20' + (paymentData.expiry.split('/')[1] || '0')),
          cvc: paymentData.cvv,
        },
        billing_details: {
          name: paymentData.cardName,
          email: formData.email,
        }
      };
      
      // Confirm payment with Clerk
      const paymentResult = await confirmPayment(paymentIntent.id, paymentMethod);
      
      if (paymentResult.status === 'succeeded') {
        // Create order in Convex
        const orderItems = cartItems.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.medicine?.price || 0,
        }));

        await createOrder({
          userId: convexUser._id,
          items: orderItems,
          shippingAddress: formData.address,
        });
        
        // Success
        setStep('success');
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed and order confirmed.",
          duration: 5000,
        });
        
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
      
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Order Total: <span className="font-semibold text-foreground">${totalAmount.toFixed(2)}</span></p>
              <p>Items: {cartItems.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span>{item.medicine?.name} × {item.quantity}</span>
                      <span>${(item.medicine?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%)</span>
                      <span>${(totalAmount * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{totalAmount >= 50 ? 'Free' : '$5.99'}</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(totalAmount + (totalAmount * 0.08) + (totalAmount >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clerk Payment Form */}
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Secure Payment via Clerk</h4>
                  <p className="text-sm text-muted-foreground">
                    Your payment will be processed securely through Clerk's payment system.
                  </p>
                </div>
                
                {/* Payment Form Fields */}
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiry: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Clerk
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.medicine?.name} × {item.quantity}</span>
                    <span>${(item.medicine?.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>${(totalAmount * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{totalAmount >= 50 ? 'Free' : '$5.99'}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(totalAmount + (totalAmount * 0.08) + (totalAmount >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1"
              >
                Proceed to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
