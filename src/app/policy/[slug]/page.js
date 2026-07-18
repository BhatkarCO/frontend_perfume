import { redirect } from 'next/navigation';
import Link from 'next/link';

const policies = {
  returns: {
    title: "Return Policy",
    eyebrow: "Store Policy",
    intro: "Due to the intimate, personal, and hygiene-sensitive nature of luxury fragrances, Bhatkar & Co. maintains a strict No-Return and No-Exchange policy.",
    sections: [
      {
        heading: "All Sales Are Final",
        body: "Once a purchase is made and dispatched, it cannot be returned, refunded, or exchanged. We encourage trying our smaller sizes or sample products if you want to experience a scent profile before committing to a larger size."
      },
      {
        heading: "Damaged or Defective Items",
        body: "If you receive a physically damaged or broken bottle, or an incorrect item, please email us at bhatkarco@gmail.com within 24 hours of delivery. Please include your order number and a clear photograph or unboxing video showing the damage. Verified transit damage will be replaced at no extra cost."
      },
      {
        heading: "Order Cancellation",
        body: "You may request an order cancellation before it has been dispatched (typically within 2 hours of placing the order). Once an order leaves our warehouse, it cannot be cancelled or recalled."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Your Data",
    intro: "Bhatkar & Co. is committed to protecting your personal information and your right to privacy.",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect your name, email address, billing & shipping address, and phone number solely to process orders, verify accounts (via OTP), and dispatch delivery notifications."
      },
      {
        heading: "Payment Security",
        body: "Your payment details are processed securely by Razorpay using end-to-end tokenization. Bhatkar & Co. does not store credit card numbers or banking credentials on our servers."
      },
      {
        heading: "Data Sharing",
        body: "We do not sell, trade, or rent your personal information to third-party marketing companies. Data is shared only with our logistics partner strictly for order delivery purposes."
      },
      {
        heading: "Data Protection",
        body: "All data transmitted to and from our platform is protected using industry-standard SSL (Secure Sockets Layer) encryption. We regularly review our data protection practices."
      }
    ]
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Legal",
    intro: "By accessing or placing an order on our website, you agree to be bound by the following terms and conditions.",
    sections: [
      {
        heading: "General Use",
        body: "Welcome to bhatkar-perfumes.com. This website is operated by Bhatkar & Co. Perfumes. By using this website, you agree to comply with our Terms of Service and all applicable laws."
      },
      {
        heading: "Pricing & Availability",
        body: "Pricing and stock availability are subject to change without prior notice. Bhatkar & Co. reserves the right to cancel orders in cases of stock discrepancies or payment authentication failures."
      },
      {
        heading: "Intellectual Property",
        body: "All brand imagery, fragrance descriptions, notes maps, and website content are copyrighted intellectual property of Bhatkar & Co. Perfumes. Unauthorized reproduction is strictly prohibited."
      },
      {
        heading: "Limitation of Liability",
        body: "Bhatkar & Co. shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or services beyond the original purchase value."
      }
    ]
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  return {
    title: policy ? `${policy.title} | Bhatkar & Co. Perfumes` : "Policy | Bhatkar & Co. Perfumes",
    description: policy?.intro,
  };
}

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = policies[slug];

  if (!policy) {
    redirect('/');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-[70vh] bg-luxury-deep text-luxury-black">

      {/* Page Header */}
      <div className="mb-10 flex flex-col items-start gap-3">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">{policy.eyebrow}</span>
        <h1 className="font-playfair text-3xl font-bold text-luxury-black tracking-wide">
          {policy.title}
        </h1>
        <div className="w-12 h-0.5 bg-gold" />
        <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{policy.intro}</p>
      </div>

      {/* Policy Content Card */}
      <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-sm p-8">
        <div className="flex flex-col divide-y divide-luxury-lightgrey">
          {policy.sections.map((section, idx) => (
            <div key={idx} className="py-6 first:pt-0 last:pb-0">
              <h2 className="font-playfair text-base font-bold text-luxury-black tracking-wide mb-3">
                {section.heading}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Footer */}
      <div className="mt-6 bg-white border border-luxury-lightgrey rounded-sm shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Still have questions?</p>
          <p className="text-sm text-luxury-black font-semibold">Our team is happy to help.</p>
        </div>
        <Link
          href="/contact"
          className="btn-gold px-6 py-2.5 text-xs rounded-sm uppercase font-bold tracking-widest whitespace-nowrap"
        >
          Contact Us
        </Link>
      </div>

    </div>
  );
}
