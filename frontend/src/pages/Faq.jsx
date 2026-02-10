import { useState } from "react";

const faqs = [
  {
    question: "What is Ghoroa Bazar?",
    answer:
      "Ghoroa Bazar is an online platform providing safe, healthy, and organic food products directly from trusted sources."
  },
  {
    question: "Do you deliver all over India?",
    answer:
      "Currently we deliver to selected locations. Nationwide delivery will be available very soon."
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support Cash on Delivery, UPI, Google Pay, Debit Cards, and Credit Cards."
  },
  {
    question: "Are your products 100% organic?",
    answer:
      "Yes. Our products are sourced carefully and tested to ensure purity and quality."
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact us through the Contact page or email us at contact@ghoroabazar.shop."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-green-700 text-center mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Find answers to the most common questions about Ghoroa Bazar.
        </p>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                {/* Question */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none"
                >
                  <span className="font-medium text-gray-800">
                    {faq.question}
                  </span>

                  {/* Plus / Minus Icon */}
                  <span className="text-2xl font-bold text-green-700">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-40 px-6 pb-4" : "max-h-0 px-6"
                  }`}
                >
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
