import prisma from "@/lib/prisma";
import Link from "next/link";
import { Mail, MailOpen, Inbox, Clock } from "lucide-react";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = messages.filter((msg) => !msg.isRead).length;
  const readCount = messages.filter((msg) => msg.isRead).length;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">ADMIN INBOX</p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Contact Messages
        </h1>

        <p className="text-slate-500 mt-2">
          Review customer enquiries, support requests, and contact form messages.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8 max-w-5xl">
        <SummaryCard
          title="Total Messages"
          value={messages.length}
          icon={<Inbox />}
          color="bg-blue-100 text-blue-600"
        />

        <SummaryCard
          title="Unread"
          value={unreadCount}
          icon={<Mail />}
          color="bg-green-100 text-green-600"
        />

        <SummaryCard
          title="Read"
          value={readCount}
          icon={<MailOpen />}
          color="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-6xl">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Message Inbox
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Latest messages appear first.
            </p>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <Link
                key={msg.id}
                href={`/admin/messages/${msg.id}`}
                className={`block p-5 transition ${
                  !msg.isRead
                    ? "bg-green-50/70 hover:bg-green-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                        !msg.isRead
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {!msg.isRead ? <Mail size={20} /> : <MailOpen size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-lg text-slate-900">
                          {msg.subject}
                        </h2>

                        {!msg.isRead && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        From:{" "}
                        <span className="font-semibold text-slate-700">
                          {msg.name}
                        </span>{" "}
                        ({msg.email})
                      </p>

                      <p className="text-slate-600 mt-3 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
                    <Clock size={15} />
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{value}</h2>
        </div>

        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}