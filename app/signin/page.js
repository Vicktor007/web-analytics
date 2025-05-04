"use client"

import { supabase } from "@/config/Supabase_Client"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import Wrapper from "../components/Wrapper"
import Logo from "../components/Logo"
import Image from "next/image"

export default function SignInPage(){

    const signIn = async () => {
        if (typeof window !== "undefined") {
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
    
          // Check if hostname is localhost to determine protocol
          const redirectTo =
            hostname === "localhost"
              ? `${protocol}//${hostname}:3000/dashboard`
              : `${protocol}//${hostname}/dashboard`;
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectTo,
            },
          });
        }
      };

    const catchUser  = async () => {
        const {data:{user}} = await supabase.auth.getUser()
        if(user){
            if(user.role === "authenticated") redirect("/dashboard");
        }
    };

    useEffect(()=>{
        if(!supabase) return;
        catchUser();
    }, []);

    
    return(
        <Wrapper>
        <div className="min-h-screen items-center justify-center flex flex-col w-full z-50 space-y-12">
          <span className="border-b border-white/5 w-full items-center justify-center flex py-6">
            <Logo />
          </span>
          <button
            onClick={signIn}
            className="button flex items-center justify-center space-x-5"
          >
            <p className="text-lg"> signIn with </p>
            <Image height={20} width={20} src="/google.png" alt="google" />
          </button>
        </div>
      </Wrapper>
    )
}