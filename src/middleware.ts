import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isPublicPath = path === '/signup' || path === '/login'

    const customToken = request.cookies.get('token')?.value
    const nextAuthSessionCookie = request.cookies.get('__Secure-next-auth.session-token')?.value || request.cookies.get('next-auth.session-token')?.value;

    // Validate the custom JWT token if it exists
    let isCustomTokenValid = false;
    if (customToken) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
            await jwtVerify(customToken, secret);
            isCustomTokenValid = true;
        } catch (error) {
            // Token is expired or invalid — treat as logged out
            isCustomTokenValid = false;
        }
    }

    const isLoggedIn = isCustomTokenValid || !!nextAuthSessionCookie;

    const isProtectedRoute = path === '/profile';
    const isAdminRoute = path.startsWith('/admin');

    // If custom token exists but is invalid (expired), clear stale cookies
    // and redirect to login for protected routes
    if (customToken && !isCustomTokenValid && !nextAuthSessionCookie) {
        if (isPublicPath) {
            // Let them through to login/signup — but clear the stale cookie
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
        if (isProtectedRoute || isAdminRoute) {
            const response = NextResponse.redirect(new URL('/login', request.nextUrl));
            response.cookies.delete('token');
            return response;
        }
        // For other routes, just clear the cookie and continue
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
    }

    if (isPublicPath && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.nextUrl))
    }

    if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/signup',
    "/login",
    "/profile",
    '/admin/:path*'
  ],
}