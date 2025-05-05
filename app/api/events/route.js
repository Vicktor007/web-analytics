import { supabase } from "@/config/Supabase_Client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  export async function OPTIONS() {
    return NextResponse.json({}, {headers: corsHeaders});
  }

  export async function POST(request) {
    try {

        const authHeader = (await headers()).get("authorization");
        const {name, domain, description} = await request.json();
        if(authHeader && authHeader.startsWith("Bearer ")) {
            const apiKey = authHeader.split("Bearer ")[1];
            const {data, error} = await supabase
            .from("users")
            .select()
            .eq("api", apiKey);
            if(data.length > 0) {
                if(name.trim() == "" || domain.trim() == ""){
                    return NextResponse.json(
                        {error: "name or domain fields must not be empty"},
                        {status: 400},
                        {headers: corsHeaders}
                    );
                } else {
                    const {error: errorMessage} = await supabase
                    .from("events")
                    .insert([{
                        event_name: name.toLowerCase(),
                        website_domain: domain,
                        message: description
                    }]);
                    if (errorMessage) {
                        return NextResponse.json(
                          { error: errorMessage },
                          { status: 400 },
                          { headers: corsHeaders }
                        );
                      } else {
                        return NextResponse.json(
                          { message: "success" },
                          { status: 200 },
                          { headers: corsHeaders }
                        );
                      }
                }
            }
        }
    } catch (error) {
        return NextResponse.json(
            {error: error.message},
            {status: 500},
            {headers: corsHeaders}
        );
    }
  }