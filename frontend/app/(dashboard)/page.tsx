import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-green-50 via-white to-green-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-green-100 rounded-full">
            <span className="text-green-700 text-sm font-semibold">🌱 Fresh from Farm to Table</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Quality Agriculture Products<br />
            <span className="text-green-600">at Your Doorstep</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with local farmers and get fresh, organic produce delivered to your home. 
            Support sustainable farming while enjoying the best quality products.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products" className="bg-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800 transition shadow-lg hover:shadow-xl">
              Browse Products
            </Link>
            <Link href="/about" className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold border-2 border-green-700 hover:bg-green-50 transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Agribridge?</h2>
            <p className="text-lg text-gray-600">Everything you need for fresh, quality produce</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Organic</h3>
              <p className="text-gray-600">
                All our products are certified organic, grown without harmful pesticides or chemicals.
              </p>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day delivery available. Get your fresh produce while it is at its peak freshness.
              </p>
            </div>

            <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Prices</h3>
              <p className="text-gray-600">
                Direct from farmers means better prices for you and fair compensation for them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-lg text-gray-600">Explore our wide range of fresh products</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer">
              <div className="h-48 relative overflow-hidden">
                <Image 
                  src="/vegetable.jpg" 
                  alt="Fresh Vegetables"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fresh Vegetables</h3>
                <p className="text-gray-600 mb-4">Farm-fresh greens, tomatoes, peppers & more</p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer">
              <div className="h-48 relative overflow-hidden">
                <Image 
                  src="/fruits.jpg" 
                  alt="Fresh Fruits"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fresh Fruits</h3>
                <p className="text-gray-600 mb-4">Seasonal fruits, berries, and tropical delights</p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer">
              <div className="h-48 relative overflow-hidden">
                <Image 
                  src="/grains.jpg" 
                  alt="Grains & Cereals"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Grains & Cereals</h3>
                <p className="text-gray-600 mb-4">Wholesome grains, rice, wheat & pulses</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
