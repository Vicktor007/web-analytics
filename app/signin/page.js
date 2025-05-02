"use client"

import { supabase } from "@/config/Supabase_Client"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function SignInPage(){

    const signin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google"
        })
    }

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
        <div className="bg-black items-center justify-center flex w-full">
            <button onClick={signin} className="button flex items-center justify-center space-x-5 smooth">
                Sign in with Google
                </button>            
        </div>
    )
}