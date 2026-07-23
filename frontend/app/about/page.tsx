export default function AboutPage() {
  return (
    <main className="w-full bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-600 to-green-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Agribridge</h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Connecting farmers directly with consumers to deliver fresh, quality agricultural products at fair prices
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                At Agribridge, we believe in creating a direct connection between farmers and consumers. 
                Our platform eliminates middlemen, ensuring farmers get fair prices for their hard work 
                while consumers receive the freshest products at competitive rates.
              </p>
              <p className="text-gray-600 text-lg">
                We are committed to supporting local agriculture, promoting sustainable farming practices, 
                and making fresh, organic produce accessible to everyone.
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Fresh & Organic</h3>
                    <p className="text-gray-600">100% organic products sourced directly from certified farms</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Fair Trade</h3>
                    <p className="text-gray-600">Ensuring fair prices for both farmers and consumers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl">🚜</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Support Local</h3>
                    <p className="text-gray-600">Empowering local farmers and strengthening communities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                We maintain the highest standards for all products on our platform, ensuring you get only the best.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                Committed to environmentally friendly practices and supporting sustainable agriculture.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Transparency</h3>
              <p className="text-gray-600">
                Building trust through transparency in our processes, pricing, and product sourcing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-700 mb-2">500+</div>
              <p className="text-gray-600">Partner Farmers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-700 mb-2">10K+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-700 mb-2">50+</div>
              <p className="text-gray-600">Product Varieties</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-700 mb-2">100%</div>
              <p className="text-gray-600">Organic & Fresh</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8">
            Be part of a movement that supports local farmers and promotes healthy, sustainable living.
          </p>
        </div>
      </section>
    </main>
  );
}