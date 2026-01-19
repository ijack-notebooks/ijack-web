"use client";

import Navbar from "../../components/Navbar";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Welcome to Ijack Paper Products</h2>
            <p className="text-gray-300 leading-relaxed">
              Ijack Paper Products is a leading manufacturer and supplier of high-quality paper products, 
              specializing in premium notebooks and stationery items. We are committed to providing our 
              customers with exceptional products that combine quality, durability, and style.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              Our mission is to deliver superior paper products that inspire creativity, enhance productivity, 
              and meet the diverse needs of students, professionals, and businesses. We strive to maintain the 
              highest standards of quality while ensuring environmental sustainability in our manufacturing processes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong className="text-white">Quality First:</strong> We never compromise on the quality of our products.</li>
              <li><strong className="text-white">Customer Satisfaction:</strong> Your satisfaction is our top priority.</li>
              <li><strong className="text-white">Innovation:</strong> We continuously innovate to bring you the best products.</li>
              <li><strong className="text-white">Sustainability:</strong> We are committed to eco-friendly practices.</li>
              <li><strong className="text-white">Integrity:</strong> We conduct business with honesty and transparency.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Why Choose Us?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Premium quality products at competitive prices</li>
              <li>Wide range of notebook options to suit every need</li>
              <li>Fast and reliable delivery service</li>
              <li>Excellent customer support</li>
              <li>Secure and easy online shopping experience</li>
            </ul>
          </section>

          <section className="bg-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact Information</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-white">Company Name:</strong> Ijack Paper Products</p>
              <p><strong className="text-white">Contact Person:</strong> Suraj Gipson</p>
              <p><strong className="text-white">Phone:</strong> 7036732010</p>
              <p><strong className="text-white">Address:</strong> 39-22-45-1/2, Kalinganagar, Madhavadhara, Near East Park, Visakhapatnam, Andhra Pradesh, India, 530007</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
