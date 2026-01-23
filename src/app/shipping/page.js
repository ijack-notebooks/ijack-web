"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Shipping Policy</h1>
        
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
              At Ijack Paper Products, we are committed to delivering your orders safely and on time. This Shipping Policy 
              outlines our shipping methods, delivery times, costs, and procedures. Please read this policy carefully before 
              placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Shipping Locations</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">2.1 Domestic Shipping:</strong> We currently ship to all locations within India. 
                We use reliable courier services to ensure your orders reach you safely.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">2.2 International Shipping:</strong> Currently, we only ship within India. 
                International shipping may be available in the future. Please contact us at 7036732010 for any special shipping 
                requirements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. Shipping Methods</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.1 Standard Shipping</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Our standard shipping method is available for all orders. Delivery typically takes:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                  <li><strong className="text-white">Metro Cities:</strong> 3-5 business days</li>
                  <li><strong className="text-white">Tier 2 Cities:</strong> 5-7 business days</li>
                  <li><strong className="text-white">Other Locations:</strong> 7-10 business days</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.2 Express Shipping</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Express shipping is available for select locations. Delivery typically takes 1-3 business days. 
                  Additional charges apply. Please contact us at 7036732010 to check availability and pricing for your location.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">3.3 Cash on Delivery (COD)</h3>
                <p className="text-gray-300 leading-relaxed">
                  Cash on Delivery is available for orders above ₹500. COD charges may apply. Please note that COD orders 
                  may take 1-2 additional business days for processing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Shipping Costs</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">4.1 Free Shipping:</strong> We offer free standard shipping on orders above 
                ₹1,000. For orders below ₹1,000, shipping charges will be calculated at checkout based on your delivery location.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">4.2 Shipping Charges:</strong> Shipping charges vary based on:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                <li>Delivery location (distance from our warehouse)</li>
                <li>Order weight and dimensions</li>
                <li>Selected shipping method</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-2">
                Exact shipping charges will be displayed at checkout before you complete your purchase.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. Order Processing</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.1 Processing Time:</strong> Orders are typically processed within 1-2 business 
                days (excluding weekends and holidays). Orders placed after 2:00 PM IST may be processed on the next business day.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.2 Order Confirmation:</strong> Once your order is placed, you will receive an 
                order confirmation email with your order details and estimated delivery date.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">5.3 Shipping Confirmation:</strong> Once your order is shipped, you will receive 
                a shipping confirmation email with tracking information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Delivery Times</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">6.1 Estimated Delivery:</strong> Delivery times are estimates and begin from the 
                date of shipment, not the date of order. Actual delivery times may vary due to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                <li>Weather conditions</li>
                <li>Holidays and festivals</li>
                <li>Remote locations</li>
                <li>Unforeseen circumstances beyond our control</li>
                <li>Customs clearance (if applicable)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">6.2 Business Days:</strong> Business days exclude weekends (Saturday and Sunday) 
                and public holidays. Delivery delays may occur during peak seasons or festivals.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Order Tracking</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">7.1 Tracking Information:</strong> Once your order is shipped, you will receive 
                a tracking number via email and SMS (if provided). You can use this tracking number to track your order on the 
                courier company's website.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">7.2 Tracking Updates:</strong> Tracking information is typically updated within 
                24-48 hours after shipment. If you don't receive tracking information within 3 business days, please contact us 
                at 7036732010.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. Delivery Address</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">8.1 Address Accuracy:</strong> Please ensure that your delivery address is 
                complete and accurate. We are not responsible for delays or failed deliveries due to incorrect or incomplete 
                addresses provided by you.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">8.2 Address Changes:</strong> If you need to change your delivery address after 
                placing an order, please contact us immediately at 7036732010. Address changes are only possible if the order 
                hasn't been shipped yet.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">8.3 P.O. Boxes:</strong> We cannot deliver to P.O. Box addresses. Please provide 
                a complete street address with landmark details for accurate delivery.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. Delivery Attempts</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">9.1 Delivery Attempts:</strong> The courier service will typically make 2-3 
                delivery attempts. If you are not available during the delivery attempts, the package may be:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                <li>Left with a neighbor or security guard (with your permission)</li>
                <li>Held at the local courier office for pickup</li>
                <li>Returned to us (in which case, return shipping charges may apply)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">9.2 Failed Deliveries:</strong> If delivery fails after multiple attempts, 
                please contact us within 7 days to arrange for redelivery or pickup. Additional charges may apply for redelivery.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. Damaged or Lost Packages</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">10.1 Damaged Packages:</strong> If you receive a damaged package, please:
              </p>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-300">
                <li>Do not accept the package if it appears damaged</li>
                <li>Take photos of the damaged package</li>
                <li>Contact us immediately at 7036732010 with photos and order details</li>
                <li>We will arrange for a replacement or full refund at no cost to you</li>
              </ol>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">10.2 Lost Packages:</strong> If your package is lost in transit:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                <li>Contact us within 15 days of the expected delivery date</li>
                <li>We will investigate with the courier service</li>
                <li>If the package is confirmed lost, we will provide a full refund or replacement</li>
                <li>Processing time for lost package claims: 7-10 business days</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. Shipping Restrictions</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed mb-2">
                We may be unable to ship to certain locations due to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300">
                <li>Remote or inaccessible areas</li>
                <li>Areas with security restrictions</li>
                <li>Locations where courier services are unavailable</li>
                <li>Areas affected by natural disasters or emergencies</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-2">
                If we cannot ship to your location, we will notify you and provide a full refund.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">12. Multiple Items in One Order</h2>
            <p className="text-gray-300 leading-relaxed">
              If your order contains multiple items, they may be shipped together or separately depending on availability and 
              warehouse location. If items are shipped separately, you will receive separate tracking numbers for each shipment. 
              You will only be charged once for shipping if all items are shipped together.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">13. Undeliverable Packages</h2>
            <p className="text-gray-300 leading-relaxed">
              If a package is returned to us as undeliverable due to an incorrect address, refusal to accept, or failure to 
              collect from the courier office, we will contact you to arrange redelivery. Additional shipping charges may apply 
              for redelivery. If redelivery is not possible, we will provide a refund minus the original shipping charges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">14. Customs and Duties</h2>
            <p className="text-gray-300 leading-relaxed">
              Currently, we only ship within India. If international shipping becomes available in the future, any customs duties, 
              taxes, or fees imposed by the destination country will be the responsibility of the customer. We are not liable 
              for any customs delays or additional charges.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">15. Peak Season and Holidays</h2>
            <p className="text-gray-300 leading-relaxed">
              During peak shopping seasons (Diwali, New Year, etc.) and holidays, delivery times may be extended. We recommend 
              placing orders well in advance during these periods. We will notify you of any significant delays via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">16. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify this Shipping Policy at any time. Changes will be effective immediately upon posting 
              on this page. Your continued use of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">17. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For any questions, concerns, or issues regarding shipping, please contact us:
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
            <p className="text-gray-300 leading-relaxed mt-2">
              <strong className="text-white">Response Time:</strong> We typically respond to shipping inquiries within 24-48 hours during business days.
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
              href="/refund"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Refund Policy
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
