"use client"

import { supabase } from "@/config/Supabase_Client"

export default function SignInPage(){

    const signin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google"
        })
    }
    return(
        <div className="bg-black items-center justify-center flex w-full">
            <button onClick={signin} className="button flex items-center justify-center space-x-5 smooth">
                Sign in with Google
                </button>            
        </div>
    )
}