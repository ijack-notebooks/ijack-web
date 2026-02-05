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

export default function ReturnRefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Return & Refund Policy</h1>

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
              At {COMPANY.name}, we want you to be satisfied with your purchase. This Return & Refund Policy explains
              when and how we process refunds. Please read this policy carefully before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Returns</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">We do not accept returns.</strong> Once an order has been placed and
              payment has been completed, we do not accept product returns for change of mind, wrong size, or any
              reason other than those covered under our refund conditions below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. Refund Conditions</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Refunds are only provided in the following cases:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>
                <strong className="text-white">Damaged products:</strong> If you receive a product that is damaged
                when it reaches you, we will process a full refund or replacement after verification.
              </li>
              <li>
                <strong className="text-white">Defective products:</strong> If the product is defective or not as
                described, we will process a full refund or replacement after verification.
              </li>
              <li>
                <strong className="text-white">Lost in transit:</strong> If your order is confirmed lost in transit
                by the courier, we will process a full refund after verification.
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Refunds are not provided for change of mind, wrong order by the customer, or any reason outside the
              conditions above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Refund Processing</h2>
            <p className="text-gray-300 leading-relaxed mb-2">
              <strong className="text-white">4.1 Method:</strong> Refunds are processed to the original payment
              method used for the purchase (e.g. the same card, UPI, or wallet).
            </p>
            <p className="text-gray-300 leading-relaxed mb-2">
              <strong className="text-white">4.2 Timeline:</strong> Once your claim is approved, we will process
              the refund within <strong className="text-white">7–10 business days</strong>. The amount will be
              credited to your original payment method. Depending on your bank or payment provider, it may take
              additional time for the credit to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. How to Claim a Refund</h2>
            <p className="text-gray-300 leading-relaxed mb-2">
              If you believe your case qualifies for a refund (damaged, defective, or lost in transit), please
              contact us as soon as possible:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Phone: {COMPANY.phone}</li>
              <li>Email: {COMPANY.email}</li>
              <li>Or use our Contact Us page</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-2">
              Please provide your order number, a brief description of the issue, and (for damaged or defective
              items) photos or videos if possible. We will review your claim and respond within 2–3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Contact for Refund Queries</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For any questions or concerns about refunds, please contact us:
            </p>
            <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
              <p>
                <strong className="text-white">Company:</strong> {COMPANY.name}
              </p>
              <p>
                <strong className="text-white">Contact Person:</strong> {COMPANY.contact}
              </p>
              <p>
                <strong className="text-white">Phone:</strong> {COMPANY.phone}
              </p>
              <p>
                <strong className="text-white">Email:</strong> {COMPANY.email}
              </p>
              <p>
                <strong className="text-white">Address:</strong> {COMPANY.address}
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Business Hours:</strong> Monday – Friday: 9:00 AM – 6:00 PM IST |
              Saturday: 10:00 AM – 4:00 PM IST
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Return & Refund Policy from time to time. Changes will be effective when posted
              on this page. The &quot;Last Updated&quot; date at the top will reflect the latest revision. Your
              continued use of our services after any change means you accept the updated policy.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-gray-700">
            <Link href="/shipping" className="text-blue-400 hover:text-blue-300 underline text-sm">
              Shipping Policy
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
