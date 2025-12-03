// src/app/components/layout/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import {useState,useEffect,useRef} from "react";
import axios from "axios"
import {useRouter} from "next/navigation"
import { useSession,signOut } from 'next-auth/react';


export default function Header() {
  const router =  useRouter()
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const { data: session, status } = useSession();

  const [user,setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false);

  const isLoggedIn = !!user;


  
    useEffect(() => {
        const checkAuth = async () => {
          const nextAuthToken = session?.token;
          const config = nextAuthToken 
            ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
            : {};

            try {
                const response = await axios.get('/api/users/me',config); 
                setUser(response.data.user); 
            } catch (error) {
                setUser(null); 
            }
        };
        if (status !== 'loading') { 
        checkAuth();
        }
    }, [status , session]);
    


  const toggleDropDown = () => {
    setShowDropdown(!showDropdown);
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/stories", label: "Stories" },
    { href: "/about", label: "About" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   const handleLogout = async () => {
    try{
      await axios.post('/api/users/logout');
      await signOut({ redirect: false });
      setUser(null);
      setShowDropdown(false);
      alert("You have been successfully logged out!");
      router.push('/');

    } catch(error){
      console.error("Logout failed:", error);
      alert("Logout failed. Please try clearing your cookies manually.");
    }
  };

  return (
    <header className="top-0 left-0 w-full h-[64px] fixed bg-[#F9F6F1FF] shadow-[0px_0px_1px_#171a1f12,_0px_0px_2px_#171a1f1F] rounded-none flex items-center z-50">

      <div className="overflow-hidden flex items-center  space-x-2">
        <Link href="/">
          <Image
           src="/logo/newLogo.png" 
           alt="Logo" 
           width={100} 
           height={40} 
          />
        </Link>
      </div>

      <nav className="flex items-center mx-auto text-sm font-normal loading-normal">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 flex items-center justify-center text-[#1E2A28] cursor-pointer transition-colors duration-200 hover:text-[#C18F2A] h-full ${
              pathname === link.href ? "font-bold text-[#B7860BFF] border-b-2 border-[#B7860BFF]" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative ml-auto pr-4" ref={dropdownRef}>
        <button onClick={toggleDropDown} className="flex items-center space-x-2 focus:outline-none">
          {isLoggedIn ? (
            <img 
                src={user.avatar || "/images/user-avatar.png"} 
                alt="User"
                width="32"
                height="32"
                className="rounded-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
                <div className="w-[35px] h-[35px] bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">?</span>
                </div>
          )}
          <span className="text-sm font-medium text-[#214B4A]">
            {isLoggedIn ? user.name || user.username : "Guest"}
          </span>
           <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 cursor-pointer text-gray-600 transition-transform ${
              showDropdown ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
            {isLoggedIn ? (
              <>
                {/* --- MODIFIED LOGIC: Show Admin Dashboard OR Visit Profile, but not both --- */}
                {user && user.isAdmin ? (
                    <Link
                      href="/admin/dashboard" 
                      className="block px-4 py-2 text-sm text-[#B7860B] font-semibold hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      ✨ Admin Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowDropdown(false)}
                    >
                        👤 Visit Profile
                    </Link>
                )}
                {/* --- END MODIFIED LOGIC --- */}
                
                <div className="border-t my-1"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                🔐 Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}