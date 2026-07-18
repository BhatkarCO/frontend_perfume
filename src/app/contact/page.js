import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | Bhatkar & Co. Perfumes",
  description: "Get in touch with our fragrance specialists at Bhatkar & Co. Perfumes.",
};

export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 min-h-[70vh] bg-luxury-deep text-luxury-black">

      {/* Page Header */}
      <div className="mb-10 flex flex-col items-start gap-3">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Get In Touch</span>
        <h1 className="font-playfair text-3xl font-bold text-luxury-black tracking-wide">
          Contact Us
        </h1>
        <div className="w-12 h-0.5 bg-gold" />
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
          Have a question about an order or need help choosing a fragrance? Our specialists are here to help.
        </p>
      </div>

      {/* Main Contact Card */}
      <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-sm p-8 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: Contact Details */}
          <div className="flex flex-col gap-8">

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-sm bg-luxury-deep border border-luxury-lightgrey flex items-center justify-center">
                <Phone className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Phone</p>
                <a
                  href="tel:+917758088155"
                  className="text-sm font-semibold text-luxury-black hover:text-gold transition-colors"
                >
                  +91 7758088155
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-sm bg-luxury-deep border border-luxury-lightgrey flex items-center justify-center">
                <Mail className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Email</p>
                <a
                  href="mailto:support@bhatkarco.com"
                  className="text-sm font-semibold text-luxury-black hover:text-gold transition-colors"
                >
                  support@bhatkarco.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-sm bg-luxury-deep border border-luxury-lightgrey flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Address</p>
                <address className="not-italic text-sm text-gray-500 leading-relaxed">
                  R102, Moregaon 90 Feet Road,<br />
                  Nalasopara East,<br />
                  Mumbai – 401209,<br />
                  Maharashtra, India
                </address>
              </div>
            </div>
          </div>

          {/* Right: Google Map Embed */}
          <div className="w-full h-64 lg:h-72 rounded-sm overflow-hidden border border-luxury-lightgrey shadow-sm">
            <iframe
              title="Bhatkar & Co Location"
              src="https://maps.google.com/maps?q=R102,+Moregaon+90+Feet+Road,+Nalasopara+East,+Mumbai+401209&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Business Hours Card */}
      <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-luxury-lightgrey pb-4">
          <div className="w-9 h-9 rounded-sm bg-luxury-deep border border-luxury-lightgrey flex items-center justify-center">
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <h2 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">
            Business Hours
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
          {[
            { day: "Monday – Friday", hours: "10:00 AM – 7:00 PM" },
            { day: "Sunday",          hours: "12:00 PM – 6:00 PM" },
            { day: "Saturday",        hours: "10:00 AM – 6:00 PM" },
            { day: "Holidays",        hours: "Closed" },
          ].map(({ day, hours }) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-luxury-lightgrey last:border-0">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{day}</span>
              <span className={`text-xs font-bold ${hours === "Closed" ? "text-red-400" : "text-luxury-black"}`}>
                {hours}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
