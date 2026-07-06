import prisma from "@/lib/prisma";
import ReplyBox from "./reply-box";
import DeleteButton from "./delete-button";
import Link from "next/link";
import { ArrowLeft, Mail, User, Clock } from "lucide-react";

export default async function MessageDetail({ params }) {
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) {
    return <div className="p-8 text-slate-500">Message not found</div>;
  }

  if (!message.isRead) {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return (
    <div className="text-slate-500 pb-12 max-w-5xl">
      <Link
        href="/admin/messages"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8"
      >
        <ArrowLeft size={18} />
        Back to messages
      </Link>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100">
          <p className="text-sm font-semibold text-green-600">MESSAGE DETAILS</p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {message.subject}
          </h1>

          <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <User size={16} />
              {message.name}
            </span>

            <span className="inline-flex items-center gap-2">
              <Mail size={16} />
              {message.email}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock size={16} />
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-slate-700 leading-8 whitespace-pre-line">
            {message.message}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        <ReplyBox email={message.email} subject={message.subject} />
        <DeleteButton id={message.id} />
      </div>
    </div>
  );
}