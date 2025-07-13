# Role-Based Dashboard Routing

This document explains how the routing system works in the Swornim event booking application.

## Overview

The application implements role-based routing that automatically directs users to the appropriate dashboard based on their user type from the backend.

## User Types (Backend)

The backend supports the following user types:
- `client` - Event clients who book services
- `photographer` - Photography service providers
- `makeupArtist` - Makeup and beauty service providers
- `decorator` - Decoration service providers
- `venue` - Venue owners
- `caterer` - Catering service providers

## Frontend Role Mapping

The frontend maps backend `userType` to frontend roles:
- `client` → ClientDashboard
- `photographer`, `makeupArtist`, `decorator`, `venue`, `caterer` → ServiceProviderDashboard

## Routing Structure

### Main Routes

1. **`/dashboard`** - Main dashboard route
   - Automatically shows the correct dashboard based on user role
   - Protected route (requires authentication)
   - Uses `RoleBasedDashboard` component for routing logic

2. **`/client-dashboard`** - Direct client dashboard access
   - Only accessible to users with `client` role
   - Protected route with role restriction

3. **`/service-provider-dashboard`** - Direct service provider dashboard access
   - Only accessible to service provider roles
   - Protected route with role restriction

### Public Routes

- `/welcome` - Welcome screen
- `/login` - Login page
- `/signup` - Signup page
- `/about` - About us page
- `/contact` - Contact page
- `/terms` - Terms and privacy page

## Components

### RoleBasedDashboard
- Located at: `src/components/RoleBasedDashboard.tsx`
- Determines which dashboard to show based on user role
- Handles fallback to client dashboard for unknown roles

### ProtectedRoute
- Located at: `src/components/ProtectedRoute.tsx`
- Protects routes requiring authentication
- Supports role-based access control
- Redirects unauthorized users appropriately

## Authentication Flow

1. User logs in via `/login`
2. Backend returns user data with `userType` field
3. Frontend stores user data in localStorage
4. User is redirected to `/dashboard`
5. `RoleBasedDashboard` component determines correct dashboard
6. User sees appropriate dashboard for their role

## Testing Different Roles

You can test different user roles using the demo accounts in the login page:

- **Client**: `client@swornim.com` / `password123`
- **Photographer**: `photographer@swornim.com` / `password123`
- **Venue**: `venue@swornim.com` / `password123`

## Backend Integration

The routing system expects the backend to return user data with:
- `userType` field containing the user's role
- `name` field for display name
- `profileImage` field for avatar
- Other user profile fields

## Error Handling

- Unknown roles fallback to client dashboard
- Unauthenticated users are redirected to login
- Role-restricted routes redirect to main dashboard
- Loading states are handled gracefully 