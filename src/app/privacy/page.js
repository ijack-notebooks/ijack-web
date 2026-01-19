"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <section className="bg-gray-700 rounded-lg p-6">
            <p className="text-gray-300 text-sm mb-4">
              <strong className="text-white">Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Company:</strong> Ijack Paper Products<br />
              <strong className="text-white">Address:</strong> 39-22-45-1/2, Kalinganagar, Madhavadhara, Near East Park, Visakhapatnam, Andhra Pradesh, India, 530007<br />
              <strong className="text-white">Contact:</strong> Suraj Gipson | 7036732010
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Ijack Paper Products ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit our website and use 
              our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
              policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2.1 Personal Information</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-300">
                  <li>Register for an account</li>
                  <li>Place an order</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us for customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  This information may include: name, email address, phone number, shipping address, billing address, 
                  payment information, and other contact details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2.2 Automatically Collected Information</h3>
                <p className="text-gray-300 leading-relaxed">
                  When you visit our website, we may automatically collect certain information about your device, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-300">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Device identifiers</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Process and fulfill your orders</li>
              <li>Send you order confirmations and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze website usage and trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-2">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li><strong className="text-white">Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, shipping, etc.)</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong className="text-white">With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
              Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request data portability</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-2">
              To exercise these rights, please contact us using the contact information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
              do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. Third-Party Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these 
              external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
              Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically 
              for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
              <p><strong className="text-white">Company:</strong> Ijack Paper Products</p>
              <p><strong className="text-white">Contact Person:</strong> Suraj Gipson</p>
              <p><strong className="text-white">Phone:</strong> 7036732010</p>
              <p><strong className="text-white">Address:</strong> 39-22-45-1/2, Kalinganagar, Madhavadhara, Near East Park, Visakhapatnam, Andhra Pradesh, India, 530007</p>
            </div>
          </section>

          <div className="flex gap-4 justify-center pt-4 border-t border-gray-700">
            <Link
              href="/contact"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Contact Us
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/terms"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
