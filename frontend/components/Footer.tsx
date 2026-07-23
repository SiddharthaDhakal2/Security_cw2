import Link from "next/link";
import { cookies } from "next/headers";

export default async function Footer() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("role")?.value);
  const cartHref = isLoggedIn ? "/cart" : "/login";
  const ordersHref = isLoggedIn ? "/orders" : "/login";

  return (
    <footer className="bg-green-800 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-semibold">About AgriBridge</h3>
          <p className="text-sm leading-6 text-green-100">
            Connecting farmers directly with consumers to deliver fresh, quality agricultural products at fair prices.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Quick Links</h3>
          <div className="flex flex-col gap-2 text-sm text-green-100">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/products" className="hover:text-white">
              Products
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href={cartHref} className="hover:text-white">
              Cart
            </Link>
            <Link href={ordersHref} className="hover:text-white">
              Orders
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Support</h3>
          <div className="space-y-2 text-sm text-green-100">
            <p>
              Email:{" "}
              <a href="mailto:support@agribridge.com" className="hover:text-white">
                support@agribridge.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a href="tel:+9779826879175" className="hover:text-white">
                +977 9826879175
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700 px-6 py-4 text-center text-xs text-green-100">
        &copy; {new Date().getFullYear()} AgriBridge. All rights reserved.
      </div>
    </footer>
  );
}
