import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { email, subject, reply } = await request.json();

    if (!email || !subject || !reply) {
      return NextResponse.json(
        { error: "Email, subject and reply are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: email,
      subject: `Re: ${subject}`,
      text: reply,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message || "Resend failed to send email" },
        { status: 500 }
      );
    }

    console.log("Resend email sent:", data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Reply API error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 