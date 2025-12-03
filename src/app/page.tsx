"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "./components/home/HeroSection";
import FeaturedWritings from "./components/home/FeaturedWritings";
import CommunityCTA from "./components/home/CommunityCTA";  


export default function Home() {

  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === '#_=_') {
      const cleanUrl = window.location.pathname + window.location.search;
      
      router.replace(cleanUrl);
    }
  }, [router]);
  return (
    <>
      <HeroSection />
      <FeaturedWritings />
      {/* <CommunityCTA /> */}
    </>
  );
}
