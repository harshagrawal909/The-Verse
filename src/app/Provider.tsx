"use client";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Header /> 
            <main className="bg-[#F9F6F1FF] min-h-screen py-20">
                {children}
            </main>
            <Footer />
        </SessionProvider>
    );
}