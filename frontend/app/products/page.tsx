"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import Header from "../(navigation)/Header";
import { getProducts, searchProducts, getProductsByCategory, Product } from "@/lib/api/products";
import { getImageUrl } from '@/lib/getImageUrl';

const categories = [
	{ label: "All", value: "all" },
	{ label: "Vegetables", value: "vegetables" },
	{ label: "Fruits", value: "fruits" },
	{ label: "Grains", value: "grains" },
] as const;

export default function ProductsPage() {
	const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]["value"]>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await getProducts();
				// Sort by createdAt descending (latest first)
				const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				setAllProducts(sorted);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch products");
				setAllProducts([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, []);

	useEffect(() => {
		const filterProducts = async () => {
			try {
				let results = allProducts;

				// Apply search filter
				if (searchTerm.trim()) {
					results = results.filter((product) => {
						const needle = searchTerm.trim().toLowerCase();
						return (
							product.name.toLowerCase().includes(needle) ||
							product.farm.toLowerCase().includes(needle) ||
							product.description.toLowerCase().includes(needle)
						);
					});
				}

				// Apply category filter
				if (activeCategory !== "all") {
					results = results.filter((product) => product.category === activeCategory);
				}

				setFilteredProducts(results);
			} catch (err) {
				console.error("Error filtering products:", err);
			}
		};

		filterProducts();
	}, [activeCategory, searchTerm, allProducts]);

	return (
		<>
			<Header />
			<main className="min-h-screen bg-linear-to-b from-[#f7f3ee] via-[#fbf8f3] to-[#efe9df] px-6 pb-10 pt-24 text-[#1f1f1f]">
				<div className="mx-auto w-full max-w-6xl">
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900">Product Catalog</h1>
				</div>

				<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="relative w-full lg:max-w-xl">
						<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6d6a63]">
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="M21 21l-4.3-4.3" />
							</svg>
						</span>
						<input
							type="search"
							placeholder="Search products..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full rounded-full border border-[#e1dacf] bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#c5b9a3] focus:ring-2 focus:ring-[#e7dccb]"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{categories.map((category) => {
							const isActive = activeCategory === category.value;
							return (
								<button
									key={category.value}
									type="button"
									onClick={() => setActiveCategory(category.value)}
									className={
										"rounded-full border px-4 py-2 text-sm font-medium transition " +
										(isActive
											? "border-[#245a3b] bg-[#245a3b] text-white shadow"
											: "border-[#e1dacf] bg-white text-[#3f3d37] hover:border-[#c5b9a3]")
									}
								>
									{category.label}
								</button>
							);
						})}
					</div>
				</div>

				{isLoading && (
					<div className="mt-10 rounded-2xl border border-dashed border-[#d7cec1] bg-white/70 p-8 text-center text-sm text-[#6d6a63]">
						Loading products...
					</div>
				)}

				{error && (
					<div className="mt-10 rounded-2xl border border-red-300 bg-red-50 p-8 text-center text-sm text-red-600">
						{error}
					</div>
				)}

				{!isLoading && !error && (
					<>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{filteredProducts.map((product) => (
								<Link key={product._id} href={`/products/${product._id}`} className="group">
									<article className="overflow-hidden rounded-2xl border border-[#efe6da] bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg">
									<div className="relative h-44 bg-[#f1ede6]">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={getImageUrl(product.image)}
											alt={product.name}
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
											className="object-cover transition duration-300 group-hover:scale-105 w-full h-full rounded-t-2xl"
										/>
									</div>
									<div className="flex flex-col gap-2 p-4">
										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="text-base font-semibold text-[#2b2a27]">{product.name}</h3>
												<p className="text-xs text-[#7b756d]">{product.farm}</p>
											</div>
											<span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${
												product.availability === "in-stock" ? "bg-[#1f6b45]" :
												product.availability === "low-stock" ? "bg-[#d4a574]" :
												"bg-[#a0616a]"
											}`}>
												{product.availability === "in-stock" ? "In Stock" : product.availability === "low-stock" ? "Low Stock" : "Out of Stock"}
											</span>
										</div>
										<div className="flex items-baseline gap-2">
											<span className="text-lg font-semibold text-[#1f6b45]">
												Rs {product.price.toFixed(2)}
											</span>
											<span className="text-xs text-[#7b756d]">/ {product.unit}</span>
										</div>
									</div>
									</article>
								</Link>
							))}
						</div>

						{filteredProducts.length === 0 && (
							<div className="mt-10 rounded-2xl border border-dashed border-[#d7cec1] bg-white/70 p-8 text-center text-sm text-[#6d6a63]">
								No products match your search. Try a different keyword.
							</div>
						)}
					</>
				)}
			</div>
			</main>
		</>
	);
}
