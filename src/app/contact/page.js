"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Get in Touch</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              We'd love to hear from you! Whether you have a question about our products, need assistance 
              with an order, or want to provide feedback, our team is here to help.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Contact Information</h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <p className="font-semibold text-white mb-1">Company Name</p>
                  <p>Ijack Paper Products</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Contact Person</p>
                  <p>Suraj Gipson</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Phone Number</p>
                  <p>7036732010</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <p>contact@ijackpaperproducts.com</p>
                </div>
              </div>
            </section>

            <section className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Business Address</h3>
              <div className="text-gray-300">
                <p>39-22-45-1/2, Kalinganagar,</p>
                <p>Madhavadhara,</p>
                <p>Near East Park,</p>
                <p>Visakhapatnam,</p>
                <p>Andhra Pradesh, India</p>
                <p className="mt-2 font-semibold">PIN: 530007</p>
              </div>
            </section>
          </div>

          <section className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Business Hours</h3>
            <div className="text-gray-300 space-y-2">
              <p><strong className="text-white">Monday - Friday:</strong> 9:00 AM - 6:00 PM IST</p>
              <p><strong className="text-white">Saturday:</strong> 10:00 AM - 4:00 PM IST</p>
              <p><strong className="text-white">Sunday:</strong> Closed</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">How Can We Help?</h3>
            <div className="space-y-3 text-gray-300">
              <p>• <strong className="text-white">Product Inquiries:</strong> Questions about our notebooks and products</p>
              <p>• <strong className="text-white">Order Support:</strong> Help with placing or tracking orders</p>
              <p>• <strong className="text-white">Customer Service:</strong> Returns, refunds, or exchanges</p>
              <p>• <strong className="text-white">Bulk Orders:</strong> Special pricing for bulk purchases</p>
              <p>• <strong className="text-white">Feedback:</strong> Share your thoughts and suggestions</p>
            </div>
          </section>

          <section className="bg-blue-900 bg-opacity-30 rounded-lg p-6 border border-blue-700">
            <p className="text-gray-300">
              <strong className="text-white">Note:</strong> For faster response, please call us during business hours. 
              For email inquiries, we typically respond within 24-48 hours.
            </p>
          </section>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/terms"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/refund"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
