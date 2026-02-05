"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

const COMPANY = {
  name: "Ijack Paper Products",
  address: "39-22-45-1/2, Kalinganagar, Madhavadhara, Near East Park, Visakhapatnam, Andhra Pradesh, India, 530007",
  contact: "Suraj Gipson",
  phone: "7036732010",
  email: "support@ijackpaperproducts.com",
};

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Return Policy</h1>

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <section className="bg-gray-700 rounded-lg p-6">
            <p className="text-gray-300 text-sm mb-4">
              <strong className="text-white">Last Updated:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Company:</strong> {COMPANY.name}
              <br />
              <strong className="text-white">Address:</strong> {COMPANY.address}
              <br />
              <strong className="text-white">Contact:</strong> {COMPANY.contact} | {COMPANY.phone}
              <br />
              <strong className="text-white">Email:</strong> {COMPANY.email}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              This Return Policy outlines our policy on product returns. Please read this policy carefully before
              making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. We Do Not Offer Returns</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">We do not offer returns on any product.</strong> Once an order has
              been placed and payment has been completed, we do not accept product returns for any reason,
              including but not limited to change of mind, wrong size, wrong product ordered, or any other
              reason.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              All sales are final. For refund eligibility in case of damaged, defective, or lost-in-transit
              products, please refer to our <Link href="/refund" className="text-blue-400 hover:text-blue-300 underline">Refund Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For any questions regarding this Return Policy, please contact us:
            </p>
            <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
              <p><strong className="text-white">Company:</strong> {COMPANY.name}</p>
              <p><strong className="text-white">Contact Person:</strong> {COMPANY.contact}</p>
              <p><strong className="text-white">Phone:</strong> {COMPANY.phone}</p>
              <p><strong className="text-white">Email:</strong> {COMPANY.email}</p>
              <p><strong className="text-white">Address:</strong> {COMPANY.address}</p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Business Hours:</strong> Monday – Friday: 9:00 AM – 6:00 PM IST |
              Saturday: 10:00 AM – 4:00 PM IST
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Return Policy from time to time. Changes will be effective when posted on this
              page. The &quot;Last Updated&quot; date at the top will reflect the latest revision.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-gray-700">
            <Link href="/shipping" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Shipping Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/refund" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Refund Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Terms & Conditions
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
