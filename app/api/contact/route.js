import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    await prisma.notification.create({
      data: {
        title: "New Contact Message",
        message: `${name} sent a message: ${subject}`,
        type: "MESSAGE",
        role: "ADMIN",
        link: "/admin/messages",
      },
    });

    return NextResponse.json({
      message: "Message sent successfully.",
      contact,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}