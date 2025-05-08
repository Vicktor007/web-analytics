"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs";

function ApiSnipet() {

    const url = `${process.env.NEXT_PUBLIC_URL}/api/events`;

  const JS_codeString =  `
  const url = "${url}";
   const headers = {
     "Content-Type": "application/json",
     
                        //   your api key
     Authorization: "Bearer {{your api key}}",
   };
   const eventData = {
     name: "",//* required
     domain: "", //* required
     description: "",//optional
   };
 
   const sendRequest = async () => {
     axios
       .post(url, eventData, { headers })
       .then()
       .catch((error) => {
         console.error("Error:", error);
       });
   };`;

   const JAVA_codeString =  `
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class SendRequest {
    public static void main(String[] args) {
        String urlString = ${url}; 
        String apiKey = "your-api-key"; // Replace with your actual API key
        String jsonInputString = "{\"name\": \"EventName\", \"domain\": \"example.com\", \"description\": \"Optional description\"}";

        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            System.out.println("Response Code: " + responseCode);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
`;


  return (
    <Tabs defaultValue="Js/React" className="w-full space-y-5">
      <TabsList
        className="w-full bg-black rounded-none space-x-5
                         items-center justify-center flex"
      >
        <TabsTrigger value="Js/React" className="rounded-none">
          Js/React
        </TabsTrigger>
        <TabsTrigger className="rounded-none" value="Nextjs">
          JAVA
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Js/React" className="p-4">
        <b className="text-red-500 font-normal italic">inside your api end point code executor</b>
        <SyntaxHighlighter wrapLongLines language="javascript" style={sunburst}>
          {JS_codeString}
        </SyntaxHighlighter>
      </TabsContent>
      <TabsContent value="Nextjs" className="p-4">
        <b className="text-red-500 font-normal italic">inside your api service code executor</b>
        <SyntaxHighlighter wrapLongLines language="javascript" style={sunburst}>
          {JAVA_codeString}
        </SyntaxHighlighter>
      </TabsContent>
    </Tabs>
  );
}

export default ApiSnipet;
