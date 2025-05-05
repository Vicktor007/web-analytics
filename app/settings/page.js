/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/config/Supabase_Client";
import useUser from "@/hooks/useUser";
import axios from "axios";
import { redirect } from "next/navigation";
import Wrapper from "../components/Wrapper";
import Header from "../components/Header";
import { CodeComp } from "./codeComp";

const url = `${process.env.NEXT_PUBLIC_URL}/api/events`;

function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [user] = useUser();
  useEffect(() => {
    if (!user) return;
    if (user == "no user") redirect("/signin");
  }, [user]);

  const generateApiKey = async () => {
    setLoading(true);
    if (loading || !user) return;
    const randomString =
      Math.random().toString(36).substring(2, 300) +
      Math.random().toString(36).substring(2, 300);

    const { data, error } = await supabase
      .from("users")
      .insert([{ api_key: randomString, user_id: user.id }])
      .select();
    if (error) console.log(error);
    setApiKey(randomString);
    setLoading(false);
  };

  const getUserAPIs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("user_id", user.id);
    if (data.length > 0) {
      setApiKey(data[0].api_key);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (!supabase || !user) return;
    getUserAPIs();
  }, [user, supabase]);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert("API key copied to clipboard!");
  };

  

  if (user == "no user") {
    <Wrapper>
      <Header />
      <div className="min-h-screen items-center justify-center flex flex-col w-full z-40 text-white">
        Redirecting....
      </div>
    </Wrapper>;
  }
  if (loading) {
    return (
      <Wrapper>
        <Header />
        <div className="min-h-screen items-center justify-center flex flex-col w-full z-40 text-white">
          loading....
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Header />
      <div className="min-h-screen items-center justify-center flex flex-col w-full z-40 text-white">
        {!apiKey && !loading && (
          <button className="button" onClick={generateApiKey}>
            Generate API Key
          </button>
        )}
        {apiKey && (
          <div
            className="mt-12 border-white/5 border
           bg-black space-y-12 py-12 w-full md:w-3/4 lg:w-1/2"
          >
            <div className="space-y-12 px-4">
              <p>Your API Key:</p>
              <input
                className="input-disabled"
                type="text"
                value={apiKey}
                readOnly
                disabled
              />
              <button onClick={copyApiKey} className="button">
                Copy API Key
              </button>
            </div>
            <div className="space-y-4 border-t border-white/5 bg-black p-6">
              <h1 className="text-lg p-4 bg-[#0f0f0f70]">
                You can create custom events using our api like below
              </h1>
              <div className="">
                <CodeComp apiKey={apiKey} url={url} />
              </div>
            </div>
          </div>
        )}
        {/* <button onClick={sendRequest}>send</button> */}
      </div>
    </Wrapper>
  );
}

export default SettingsPage;


