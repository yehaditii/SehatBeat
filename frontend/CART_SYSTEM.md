# SehatBeat Cart System

## Overview
The SehatBeat cart system allows users to add medicines to their cart, manage quantities, and proceed to checkout. The system is fully integrated with Convex backend and includes real-time updates.

## Features

### 🛒 Cart Functionality
- **Add to Cart**: Click "Add to Cart" button on any medicine card
- **Quantity Management**: Increase/decrease quantities with +/- buttons
- **Remove Items**: Remove items completely from cart
- **Real-time Updates**: Cart updates immediately across all components
- **Persistent Storage**: Cart items are stored in the database

### 🎯 User Experience
- **Toast Notifications**: Success/error messages for all cart operations
- **Cart Count Badges**: Visual indicators showing number of items in cart
- **Floating Cart Button**: Easy access to cart from medicine page
- **Responsive Design**: Works on both desktop and mobile devices

### 🔐 Authentication
- **Sign-in Required**: Users must be signed in to use cart features
- **User-specific Carts**: Each user has their own cart
- **Secure Operations**: All cart operations are authenticated

## How to Use

### 1. Adding Items to Cart
1. Navigate to the Medicine page (`/medicine`)
2. Browse available medicines
3. Click "Add to Cart" button on any medicine
4. See toast notification confirming item added
5. Cart count badge updates automatically

### 2. Managing Cart
1. Access cart via:
   - Cart icon in top navigation (desktop)
   - Cart link in mobile menu
   - Cart tab in bottom navigation (mobile)
   - Floating cart button on medicine page
2. View all cart items with details
3. Adjust quantities using +/- buttons
4. Remove items using trash icon
5. See total price and item count

### 3. Checkout Process
1. Review cart items and total
2. Click "Proceed to Checkout" button
3. Complete checkout process (to be implemented)
4. Cart clears automatically after successful order

## Technical Implementation

### Backend (Convex)
- **Schema**: `cartItems` table with user, medicine, quantity, and timestamp
- **Functions**: 
  - `addToCart`: Add/update cart items
  - `updateCartItem`: Modify quantities
  - `removeFromCart`: Remove items
  - `getCartItems`: Fetch user's cart with medicine details

### Frontend
- **Hooks**: `useCart` hook for cart operations
- **Components**: 
  - `Cart.tsx`: Dedicated cart page
  - Cart summary in Medicine page
  - Navigation cart indicators
- **State Management**: Real-time updates via Convex queries

### Database Schema
```typescript
cartItems: defineTable({
  userId: v.id("users"),
  medicineId: v.id("medicines"),
  quantity: v.number(),
  addedAt: v.number(),
}).index("by_user", ["userId"])
```

## Navigation Integration

### Top Navigation
- Cart icon with item count badge
- Only visible when user is signed in
- Links directly to cart page

### Bottom Navigation (Mobile)
- Cart tab with item count
- Easy access on mobile devices
- Consistent with other navigation items

### Medicine Page
- Cart summary when items exist
- Floating cart button for quick access
- Quantity controls on medicine cards

## Toast Notifications

The system provides user feedback for all cart operations:

- **Success**: Item added, quantity updated, item removed
- **Error**: Failed operations with retry suggestions
- **Info**: Checkout status and order confirmations

## Future Enhancements

- [ ] Checkout form with shipping details
- [ ] Payment integration
- [ ] Order history and tracking
- [ ] Save for later functionality
- [ ] Bulk operations (add multiple items)
- [ ] Cart sharing between users
- [ ] Discount codes and promotions

## Testing the System

1. **Seed Data**: Run the seed function to populate medicines
2. **User Authentication**: Sign in with Clerk
3. **Add Items**: Navigate to Medicine page and add items
4. **Cart Management**: Test quantity changes and removals
5. **Navigation**: Verify cart indicators update correctly
6. **Responsiveness**: Test on different screen sizes

## Troubleshooting

### Common Issues
- **Cart not updating**: Check authentication status
- **Items not persisting**: Verify Convex connection
- **Toast not showing**: Check toast provider setup

### Debug Steps
1. Check browser console for errors
2. Verify user authentication status
3. Check Convex function logs
4. Confirm database schema matches

## Dependencies

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Convex
- **Authentication**: Clerk
- **UI Components**: Shadcn/ui components
- **Icons**: Lucide React
- **State Management**: Convex React hooks
