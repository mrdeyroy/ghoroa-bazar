import { useEffect, useState } from "react";

export default function Contact() {
  const userEmail = localStorage.getItem("userEmail"); // logged-in user
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-fill email
  useEffect(() => {
    if (userEmail) {
      setForm(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.email || !form.message) {
      return showToast("Please fill all required fields", "error");
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      showToast("Message sent successfully!");
      setForm({ name: "", email: userEmail || "", subject: "", message: "" });
    } catch {
      showToast("Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        
        {/* CONTACT INFO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

          <p className="mb-3">📍 Kolkata, India</p>
          <p className="mb-3">📞 +91 880019300X</p>
          <p className="mb-3">✉ contact@ghoroabazar.shop</p>

          {/* WhatsApp */}
          <a
            href="https://wa.me/9188001930X"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            💬 Chat on WhatsApp
          </a>

          <iframe
            title="map"
            src="https://www.google.com/maps?q=Kolkata,India&output=embed"
            className="w-full h-48 mt-8 rounded-xl"
          />
        </div>

        {/* CONTACT FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Send a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
            />

            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
            />

            <input
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
            />

            <textarea
              name="message"
              placeholder="Message *"
              rows="4"
              value={form.message}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
            />

            <button
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded-lg text-white ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
