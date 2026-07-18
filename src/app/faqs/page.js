import React from "react";

export const metadata = {
  title: "Frequently Asked Questions | Bhatkar & Co. Perfumes",
  description: "Find answers to frequently asked questions about Bhatkar & Co. Perfumes, orders, and services.",
};

export default function FAQs() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long will order delivery take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our perfumes are shipped within 1-2 business days. Delivery within India typically takes 3-6 business days depending on the destination."
        }
      },
      {
        "@type": "Question",
        "name": "Can I return or exchange a fragrance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Due to hygiene reasons and the personal nature of luxury fragrances, we do not accept returns or exchanges. All sales are final. However, if your order arrives damaged, please contact us at bhatkarco@gmail.com within 24 hours of delivery for a replacement."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept Razorpay-powered digital payments including credit/debit cards, UPI, wallets, and net banking."
        }
      },
      {
        "@type": "Question",
        "name": "Can I request a custom scent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Custom fragrance consultations are available for bulk or dedicated clients. Please contact support@bhatkar-perfumes.com to discuss your requirements."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-20 min-h-[70vh] bg-luxury-deep text-luxury-black">
        <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-sm p-10">
          <h1 className="font-playfair text-3xl font-bold text-luxury-black mb-6 tracking-wide">
            Frequently Asked Questions
          </h1>
          <div className="space-y-6 text-gray-500 text-sm leading-relaxed">
            <div>
              <h2 className="font-semibold text-luxury-black mb-2">
                How long will order delivery take?
              </h2>
              <p>
                Our perfumes are shipped within 1-2 business days. Delivery within
                India typically takes 3-6 business days depending on the
                destination.
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-luxury-black mb-2">
                Can I return or exchange a fragrance?
              </h2>
              <p>
                Due to hygiene reasons and the personal nature of luxury fragrances, we do not accept returns or exchanges. All sales are final. If your product is received damaged or defective, please contact us at bhatkarco@gmail.com within 24 hours of delivery.
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-luxury-black mb-2">
                What payment methods do you accept?
              </h2>
              <p>
                We accept Razorpay-powered digital payments including credit/debit
                cards, UPI, wallets, and net banking.
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-luxury-black mb-2">
                Can I request a custom scent?
              </h2>
              <p>
                Custom fragrance consultations are available for bulk or dedicated
                clients. Please contact support@bhatkar-perfumes.com to discuss
                your requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
