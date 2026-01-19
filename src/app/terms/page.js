"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms and Conditions</h1>
        
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
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using the Ijack Paper Products website ("Website"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Use License</h2>
            <p className="text-gray-300 leading-relaxed mb-2">
              Permission is granted to temporarily access the materials on Ijack Paper Products' website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. Account Registration</h2>
            <p className="text-gray-300 leading-relaxed mb-2">
              To make purchases on our website, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Products and Pricing</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">4.1 Product Information:</strong> We strive to provide accurate product descriptions, 
                images, and pricing. However, we do not warrant that product descriptions or other content on this site is accurate, 
                complete, reliable, current, or error-free.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">4.2 Pricing:</strong> All prices are in Indian Rupees (₹) and are subject to change 
                without notice. We reserve the right to modify prices at any time. However, you will be charged the price displayed 
                at the time you place your order.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">4.3 Availability:</strong> Product availability is subject to change. We reserve 
                the right to limit quantities and to discontinue products at any time.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. Orders and Payment</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.1 Order Acceptance:</strong> Your order is an offer to purchase products from us. 
                We reserve the right to accept or reject your order for any reason, including product availability, errors in pricing 
                or product information, or suspected fraud.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.2 Payment:</strong> Payment must be made at the time of order placement. We accept 
                various payment methods as displayed on our website. You agree to provide current, complete, and accurate purchase and 
                account information for all purchases.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.3 Order Confirmation:</strong> After placing an order, you will receive an order 
                confirmation email. This email does not constitute acceptance of your order, but confirms that we have received it.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Shipping and Delivery</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">6.1 Shipping:</strong> We will ship products to the address you provide during checkout. 
                You are responsible for ensuring the shipping address is correct and complete.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">6.2 Delivery Times:</strong> Estimated delivery times are provided for reference only 
                and are not guaranteed. We are not liable for delays caused by shipping carriers or other factors beyond our control.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">6.3 Risk of Loss:</strong> The risk of loss and title for products purchased from us 
                pass to you upon delivery to the carrier.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Returns and Refunds</h2>
            <p className="text-gray-300 leading-relaxed">
              Please refer to our <Link href="/refund" className="text-blue-400 hover:text-blue-300 underline">Refund/Cancellation Policy</Link> for 
              detailed information about returns, exchanges, and refunds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of Ijack Paper Products 
              or its content suppliers and is protected by Indian and international copyright laws. You may not reproduce, distribute, 
              modify, or create derivative works from any content without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. Prohibited Uses</h2>
            <p className="text-gray-300 leading-relaxed mb-2">You may not use our website:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              The materials on Ijack Paper Products' website are provided on an 'as is' basis. Ijack Paper Products makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties 
              or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall Ijack Paper Products or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on 
              Ijack Paper Products' website, even if Ijack Paper Products or an authorized representative has been notified orally or in 
              writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">12. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Ijack Paper Products and its officers, directors, employees, and agents 
              from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out 
              of or in any way connected with your access to or use of the website or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">13. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law 
              provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction 
              of the courts of Visakhapatnam, Andhra Pradesh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">14. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any changes by posting the new Terms on 
              this page and updating the "Last Updated" date. Your continued use of the website after any changes constitutes acceptance 
              of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">15. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
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
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Privacy Policy
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
