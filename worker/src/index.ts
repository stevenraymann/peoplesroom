export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    console.log("STEP 1: request received");

    if (request.method !== "POST") {
      console.log("Not a POST request");
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      console.log("STEP 2: parsed JSON", data);

      console.log("STEP 3: sending to Resend...");

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Peoples Room <booking@thepeoplesroomofmobile.com>",
          to: ["peoplesroomshows@gmail.com"],
          subject: `New Booking Request: ${data.artistName}`,
          html: `
            <h2>New Booking Request</h2>
            <p><strong>Artist:</strong> ${data.artistName}</p>
            <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p>${data.message || ""}</p>
          `,
        }),
      });

      console.log("STEP 4: resend status", resendResponse.status);

      const text = await resendResponse.text();
      console.log("STEP 5: resend response", text);

      return new Response(text, { headers: corsHeaders });

    } catch (err: any) {
      console.log("ERROR:", err);
      return new Response(err.toString(), { status: 500, headers: corsHeaders });
    }
  },
};
