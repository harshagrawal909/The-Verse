import { NextResponse, NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
    const path= request.nextUrl.pathname
    const isPublicPath = path === '/signup' || path === '/login'
    const customToken = request.cookies.get('token')?.value 
    const nextAuthSessionCookie = request.cookies.get('__Secure-next-auth.session-token')?.value || request.cookies.get('next-auth.session-token')?.value;

    const isLoggedIn = !!customToken || !!nextAuthSessionCookie;
    const isProtectedRoute = path === '/profile';
    const isAdminRoute = path.startsWith('/admin');


    if(isPublicPath && isLoggedIn){
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