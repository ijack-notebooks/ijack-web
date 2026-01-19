"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Refund and Cancellation Policy</h1>
        
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
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              At Ijack Paper Products, we strive to ensure your complete satisfaction with every purchase. This Refund and Cancellation 
              Policy outlines the terms and conditions for returns, exchanges, cancellations, and refunds. Please read this policy 
              carefully before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Order Cancellation</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2.1 Before Shipment</h3>
                <p className="text-gray-300 leading-relaxed">
                  You may cancel your order at any time before it is shipped. To cancel an order, please contact us immediately at 
                  7036732010 or through our contact page. Once we confirm the cancellation, you will receive a full refund within 
                  5-7 business days.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">2.2 After Shipment</h3>
                <p className="text-gray-300 leading-relaxed">
                  Once your order has been shipped, you cannot cancel it. However, you may return the product(s) as per our return 
                  policy outlined below.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. Return Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.1 Return Eligibility</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  You may return products within <strong className="text-white">7 days</strong> of delivery, provided:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                  <li>The product is unused, unopened, and in its original packaging</li>
                  <li>The product is in the same condition as when you received it</li>
                  <li>All original tags, labels, and accessories are intact</li>
                  <li>You have the original invoice or order confirmation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.2 Non-Returnable Items</h3>
                <p className="text-gray-300 leading-relaxed mb-2">The following items cannot be returned:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                  <li>Products that have been used, damaged, or altered</li>
                  <li>Products without original packaging or tags</li>
                  <li>Personalized or customized products</li>
                  <li>Products damaged due to misuse or negligence</li>
                  <li>Products returned after the 7-day return period</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.3 Return Process</h3>
                <p className="text-gray-300 leading-relaxed mb-2">To initiate a return:</p>
                <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-300">
                  <li>Contact us at 7036732010 or through our contact page within 7 days of delivery</li>
                  <li>Provide your order number and reason for return</li>
                  <li>We will provide you with a Return Authorization (RA) number and return instructions</li>
                  <li>Package the product securely in its original packaging</li>
                  <li>Ship the product to the address provided by us</li>
                  <li>Once we receive and inspect the product, we will process your refund</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.4 Return Shipping</h3>
                <p className="text-gray-300 leading-relaxed">
                  Return shipping costs are the responsibility of the customer, unless the return is due to our error (wrong product, 
                  defective product, or damaged during shipping). In such cases, we will arrange for the return at no cost to you.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Refund Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">4.1 Refund Eligibility</h3>
                <p className="text-gray-300 leading-relaxed mb-2">Refunds will be issued in the following cases:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                  <li>Order cancelled before shipment</li>
                  <li>Product returned within the return period and meets return criteria</li>
                  <li>Wrong product delivered</li>
                  <li>Defective or damaged product received</li>
                  <li>Product not delivered within the promised timeframe (subject to verification)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">4.2 Refund Processing Time</h3>
                <p className="text-gray-300 leading-relaxed">
                  Once we receive and verify your returned product, we will process your refund within <strong className="text-white">5-7 business days</strong>. 
                  The refund will be credited to the original payment method used for the purchase.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">4.3 Refund Amount</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  The refund amount will include:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                  <li>Full product price</li>
                  <li>Original shipping charges (if the return is due to our error)</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  <strong className="text-white">Note:</strong> Return shipping charges (if applicable) and any discounts or promotional 
                  amounts will not be refunded unless the return is due to our error.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">4.4 Refund Method</h3>
                <p className="text-gray-300 leading-relaxed">
                  Refunds will be processed to the original payment method used for the purchase. The time taken for the refund to reflect 
                  in your account depends on your bank or payment provider, typically 3-10 business days after we process the refund.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. Exchange Policy</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.1 Product Exchange:</strong> We currently do not offer direct product exchanges. 
                If you wish to exchange a product, please return the original product as per our return policy and place a new order 
                for the desired product.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.2 Size/Color Exchange:</strong> If you receive a product in the wrong size or color 
                due to our error, we will arrange for an exchange at no additional cost, including free return shipping.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Defective or Damaged Products</h2>
            <p className="text-gray-300 leading-relaxed mb-2">
              If you receive a defective or damaged product:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
              <li>Contact us immediately (within 48 hours of delivery) at 7036732010</li>
              <li>Provide photos or videos of the defect or damage</li>
              <li>We will arrange for a replacement or full refund at no cost to you</li>
              <li>We will cover all return shipping costs for defective/damaged products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Late or Missing Refunds</h2>
            <p className="text-gray-300 leading-relaxed">
              If you haven't received your refund within the expected timeframe, please check your bank account or contact your credit 
              card company. It may take some time before your refund is officially posted. If you've done all of this and you still 
              have not received your refund, please contact us at 7036732010.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. Dispute Resolution</h2>
            <p className="text-gray-300 leading-relaxed">
              In case of any disputes regarding returns, refunds, or cancellations, we encourage you to contact us first to resolve 
              the issue amicably. We are committed to finding a fair solution for all parties involved.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify this Refund and Cancellation Policy at any time. Changes will be effective immediately 
              upon posting on this page. Your continued use of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For any questions, concerns, or requests regarding returns, refunds, or cancellations, please contact us:
            </p>
            <div className="bg-gray-700 rounded-lg p-6 text-gray-300">
              <p><strong className="text-white">Company:</strong> Ijack Paper Products</p>
              <p><strong className="text-white">Contact Person:</strong> Suraj Gipson</p>
              <p><strong className="text-white">Phone:</strong> 7036732010</p>
              <p><strong className="text-white">Email:</strong> support@ijackpaperproducts.com</p>
              <p><strong className="text-white">Address:</strong> 39-22-45-1/2, Kalinganagar, Madhavadhara, Near East Park, Visakhapatnam, Andhra Pradesh, India, 530007</p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-white">Business Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM IST | Saturday: 10:00 AM - 4:00 PM IST
            </p>
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
            <span className="text-gray-600">|</span>
            <Link
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
