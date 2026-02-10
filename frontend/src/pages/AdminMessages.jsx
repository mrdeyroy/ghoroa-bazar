import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    fetch("http://localhost:5000/api/contact")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* ============================
     MARK AS READ
  ============================ */
  const markAsRead = async (id, refreshUnread) => {
    await fetch(`http://localhost:5000/api/contact/${id}/read`, {
      method: "PATCH"
    });

    setMessages(prev =>
      prev.map(m =>
        m._id === id ? { ...m, status: "read" } : m
      )
    );

    refreshUnread(); // 🔥 IMPORTANT
  };

  /* ============================
     DELETE MESSAGE
  ============================ */
  const deleteMessage = async (id, refreshUnread) => {
    if (!window.confirm("Delete this message?")) return;

    await fetch(`http://localhost:5000/api/contact/${id}`, {
      method: "DELETE"
    });

    setMessages(prev => prev.filter(m => m._id !== id));

    refreshUnread(); // 🔥 IMPORTANT
  };

  return (
    <AdminLayout>
      {({ refreshUnread }) => (
        <>
          <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>

          {loading && <p>Loading messages...</p>}

          {!loading && messages.length === 0 && (
            <p className="text-gray-500">No messages found</p>
          )}

          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg._id}
                className={`p-4 rounded-lg border shadow-sm ${
                  msg.status === "unread"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{msg.name}</p>
                    <p className="text-sm text-gray-600">{msg.email}</p>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      msg.status === "unread"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                {/* SUBJECT */}
                {msg.subject && (
                  <p className="text-sm mt-2">
                    <strong>Subject:</strong> {msg.subject}
                  </p>
                )}

                {/* MESSAGE */}
                <p className="mt-2 text-gray-700">{msg.message}</p>

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>

                  <div className="flex gap-3">
                    {msg.status === "unread" && (
                      <button
                        onClick={() => markAsRead(msg._id, refreshUnread)}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() => deleteMessage(msg._id, refreshUnread)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
