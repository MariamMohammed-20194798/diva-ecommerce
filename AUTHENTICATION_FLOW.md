# Authentication Flow & Token Management

## Overview

This document describes the complete authentication flow for the ecommerce app, including token management, refresh mechanisms, and user navigation.

## Token Lifetimes

### Access Token

- **Lifetime**: 15 minutes (900 seconds) - configured via `JWT_ACCESS_EXPIRES_SECS`
- **Storage**: localStorage (key: `accessToken`)
- **Purpose**: Used to authenticate API requests
- **Location**: Authorization header as Bearer token

### Refresh Token

- **Lifetime**: 30 days - configured via `REFRESH_TOKEN_DAYS`
- **Storage**: HTTP-only cookie (key: `refresh_token`, path: `/api/auth`)
- **Purpose**: Used to obtain new access tokens when expired
- **Security**: HTTP-only, Secure (in production), SameSite=None (cross-origin)

## Login Flow

```
User Login
   ↓
1. User enters email → /auth/send-otp (GET OTP)
   ↓
2. User enters OTP → /auth/verify-otp
   ↓
Backend Response:
- accessToken (JWT, 15 min expiry)
- refreshToken (opaque token, 30 days expiry)
- user data
   ↓
3. Frontend stores:
- accessToken → localStorage
- refreshToken → HTTP-only cookie (auto)
   ↓
4. Header component:
- Checks localStorage for accessToken
- Determines: "/account" if logged in, "/auth" if not
   ↓
5. Redirect to home page (/)
```

## User Navigation After Login

### When User Clicks Account Icon

**Case 1: User Logged In (Recommended)**

```
Header Component
   ↓
useAuth hook checks:
- Is accessToken in localStorage?
- Is token NOT expired?
   ↓
YES → accountHref = "/account"
   ↓
User clicks → Redirect to /account
   ↓
/account Page:
- Validates token again
- Attempts to load user data
- If token is valid → Show account page
- If token expired → Refresh automatically via interceptor
- If refresh fails → Redirect to /auth
```

**Case 2: Token Expired But Refresh Available**

```
/account Page loads
   ↓
Token is expired (but exists in localStorage)
   ↓
API call attempts (loadAddresses, loadOrders)
   ↓
401 Response from backend
   ↓
Axios Interceptor:
- Detects 401 error
- Calls /auth/refresh with refresh token cookie
- Refresh token is valid → New access token issued
- Stores new accessToken in localStorage
- Retries original request
   ↓
Success → Account page displays
```

**Case 3: Both Tokens Expired/Invalid**

```
/account Page loads
   ↓
API call fails with 401
   ↓
Axios Interceptor attempts refresh
   ↓
Refresh token invalid/expired
   ↓
Refresh fails → Remove accessToken from localStorage
   ↓
Redirect to /auth
```

## Backend Token Endpoints

### POST /auth/send-otp

Sends OTP to email for login/signup

**Request:**

```json
{
  "email": "user@example.com",
  "type": "LOGIN" | "SIGNUP",
  "name": "User Name" // Required for SIGNUP
}
```

**Response:**

```json
{
  "message": "OTP sent successfully"
}
```

### POST /auth/verify-otp

Verifies OTP and issues tokens

**Request:**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "type": "LOGIN" | "SIGNUP",
  "name": "User Name" // Required for SIGNUP
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER"
  }
}
```

**Side Effects:**

- Sets `refresh_token` HTTP-only cookie
- Creates refresh token record in database

### POST /auth/refresh

Refreshes expired access token

**Request:**

- Refresh token is automatically sent via HTTP-only cookie
- No body required

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "user": { ... }
}
```

**Side Effects:**

- Updates cookies with new refresh token
- Revokes old refresh token in database
- Implements refresh token rotation for security

### POST /auth/logout

Logs out user and revokes tokens

**Request:**

- Refresh token is automatically sent via HTTP-only cookie

**Response:**

```json
{
  "ok": true
}
```

**Side Effects:**

- Revokes refresh token in database
- Clears refresh_token cookie

### GET /auth/google

Initiates Google OAuth flow

### GET /auth/google/callback

Google OAuth callback endpoint

- Same login flow as OTP verification
- Sets cookies and redirects to frontend `/auth/callback`

## Frontend Token Management

### useAuth Hook (`/src/hooks/useAuth.ts`)

Provides reactive authentication state:

```typescript
const { isAuthenticated, isLoading } = useAuth();
```

- Checks if accessToken exists AND is not expired
- Listens for storage events (cross-tab sync)
- Updates when token changes or refresh happens

### JWT Utilities (`/src/lib/jwt.ts`)

```typescript
// Decode JWT without signature verification
const payload = decodeJWT(token);

// Check if token is expired (with 60-second buffer)
const expired = isTokenExpired(token);

// Get seconds until expiry
const secondsLeft = getTokenExpiryTime(token);

// Check if user has valid, non-expired token
const valid = hasValidAccessToken();
```

### Axios Interceptor (`/src/lib/api.ts`)

**Request Interceptor:**

- Adds `Authorization: Bearer {accessToken}` header
- Attaches cart session ID via `x-session-id` header

**Response Interceptor:**

- Catches 401 errors
- Attempts to refresh token if available
- Queues pending requests during refresh
- Clears token if refresh fails
- Redirects to login if needed

## Component Integration

### Header Component (`/src/components/header.tsx`)

```typescript
const { isAuthenticated } = useAuth();
const accountHref = isAuthenticated ? '/account' : '/auth';
```

- Uses useAuth hook for reactive state
- Updates link based on authentication status
- No need to navigate manually

### Account Page (`/src/app/account/page.tsx`)

```typescript
useEffect(() => {
  const token = localStorage.getItem('accessToken');

  // Check if token exists AND is not expired
  if (!token || isTokenExpired(token)) {
    router.replace('/auth');
    return;
  }

  // Attempt to load user data
  // If fails with 401, interceptor will refresh
});
```

## Troubleshooting

### "Need to login each time I click user icon"

**Possible causes:**

1. ✅ **FIXED**: Header was using static accountHref (not reactive)
   - Solution: Now uses useAuth hook that listens for storage changes

2. Token keeps expiring
   - Check: Is token being refreshed properly?
   - Verify: Refresh token cookie is being sent with CORS enabled
   - Test: Check Network tab → XHR requests → verify `refresh_token` cookie sent

3. User icon still goes to /auth after login
   - Check: Is localStorage.getItem("accessToken") returning the token?
   - Test: Open DevTools → Application → Storage → localStorage
   - Verify: Token is stored with correct key name

### "Logged out unexpectedly / Need to re-login"

**Possible causes:**

1. Access token expired (normal after 15 minutes)
   - Solution: Interceptor will automatically refresh (user won't notice)

2. Refresh token expired (>30 days)
   - Expected behavior: User must login again
   - Resolution: Implement "Remember me" if needed

3. Both tokens lost
   - Check: Browser cache cleared? Private/incognito mode?
   - Note: Tokens are not persistent across browser restarts in incognito

### "CORS errors when refreshing token"

**Possible causes:**

1. Refresh cookie not sent
   - Check CORS settings:
     ```
     withCredentials: true (✅ set in axios instance)
     SameSite: None (for cross-origin)
     Secure: true (production only)
     ```
   - Verify backend CORS headers include credentials

## Environment Variables

### Backend (.env)

```
JWT_ACCESS_SECRET=your-secret
JWT_ACCESS_EXPIRES_SECS=900         # 15 minutes
JWT_REFRESH_SECRET=your-secret
REFRESH_TOKEN_DAYS=30               # 30 days
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Security Notes

- ✅ Refresh token stored in HTTP-only cookie (not accessible to JS)
- ✅ Refresh token rotated on each use (old one revoked)
- ✅ Short access token lifetime minimizes exposure
- ✅ Refresh token revocation implemented for logout
- ✅ CORS configured with credentials for secure cross-origin requests
- ⚠️ Access token in localStorage (XSS vulnerability risk, but acceptable for SPAs)

## Testing the Flow

### Manual Test: Login and Check Tokens

```javascript
// 1. After login, check localStorage
localStorage.getItem('accessToken');

// 2. Check token expiry
import { getTokenExpiryTime } from '@/lib/jwt';
getTokenExpiryTime(localStorage.getItem('accessToken'));
// Returns: seconds until expiry

// 3. Check if token is expired
import { isTokenExpired } from '@/lib/jwt';
isTokenExpired(localStorage.getItem('accessToken'));

// 4. Check if user is authenticated
import { useAuth } from '@/hooks/useAuth';
const { isAuthenticated } = useAuth();
console.log(isAuthenticated);

// 5. Check cookies
document.cookie;
// Should see: refresh_token=...
```

### Manual Test: Force Token Refresh

```javascript
// 1. Wait for token to be about to expire (or mock by changing exp in JWT)
// 2. Navigate to /account
// 3. Check Network tab for /auth/refresh request
// 4. Should see new access token in response
// 5. localStorage.getItem("accessToken") should have new token
```

### Manual Test: Cross-Tab Logout

```javascript
// Tab 1: localStorage.removeItem("accessToken")
// Tab 2: Should automatically detect and update useAuth hook
//        Header should show "/auth" link
```
