"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }) {
  const router = useRouter();

  const deleteMsg = async () => {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Deleted");
      router.push("/admin/messages");
    }
  };

  return (
    <button
      onClick={deleteMsg}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Delete Message
    </button>
  );
}