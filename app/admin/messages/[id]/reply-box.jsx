"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Mail } from "lucide-react";

export default function ReplyBox({ email, subject }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.error("Please write a reply first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, reply }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Reply sent successfully.");
        setReply("");
      } else {
        toast.error(data.error || "Failed to send reply.");
      }
    } catch (error) {
      toast.error("Something went wrong while sending reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <Mail size={20} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Reply to Customer
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              To: {email}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition resize-none text-slate-700"
          rows={7}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your reply..."
        />

        <button
          onClick={sendReply}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Send size={18} />
          {loading ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}