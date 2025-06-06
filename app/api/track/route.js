import { supabase } from "@/config/Supabase_Client";
import { NextResponse } from "next/server";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  export async function OPTIONS(request){
    return NextResponse.json({}, {headers: corsHeaders});
  }

  export async function POST(request) {
    const response = await request.json();
    const {domain, url, event, source} = response;

    if(url.includes(domain))
        return NextResponse.json(
    {
        error: 
        "the script points to a different domain than the current url. make sure they match",
    }, {headers: corsHeaders});

    if(event == "session_start") {
        // adding new row to log a new visit with its source
        
        await supabase
        .from("visits")
        .insert([{domain_name: domain, source: source ?? "Direct"}])
        .select();
    }

    if (event == "pageview"){
        await supabase.from("page_views").insert([{domain, page_visited: url}]);
    }

    return NextResponse.json({response}, {headers: corsHeaders});
  }