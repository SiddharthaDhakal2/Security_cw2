"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../(navigation)/Header";
import { getProductById, Product } from "@/lib/api/products";
import { getImageUrl } from '@/lib/getImageUrl';

type CartItem = {
	id: string;
	name: string;
	farm: string;
	image: string;
	price: number;
	unit: string;
	quantity: number;
};

const getCartStorageKey = () => {
	if (typeof window === "undefined") return "cartItems:guest";
	try {
		const rawUser = localStorage.getItem("user");
		if (!rawUser) return "cartItems:guest";
		const user = JSON.parse(rawUser) as { _id?: string };
		if (user._id) return `cartItems:${user._id}`;
	} catch {
		return "cartItems:guest";
	}
	return "cartItems:guest";
};

const readCartItems = () => {
	if (typeof window === "undefined") return [] as CartItem[];
	try {
		const userKey = getCartStorageKey();
		const raw = window.localStorage.getItem(userKey);
		if (raw) return JSON.parse(raw) as CartItem[];

		// Only migrate legacy items if user is NOT logged in (guest mode)
		if (userKey === "cartItems:guest") {
			const legacyRaw = window.localStorage.getItem("cartItems");
			if (legacyRaw) {
				window.localStorage.setItem(userKey, legacyRaw);
				window.localStorage.removeItem("cartItems"); // Remove legacy key after migration
				return JSON.parse(legacyRaw) as CartItem[];
			}
		}

		return [] as CartItem[];
	} catch {
		return [] as CartItem[];
	}
};

const writeCartItems = (items: CartItem[]) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
};

export default function ProductDetailPage() {
	const params = useParams<{ id: string }>();
	const productId = params?.id ?? "";

	const [product, setProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [cartMessage, setCartMessage] = useState("");

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await getProductById(decodeURIComponent(productId));
				setProduct(data);
				setQuantity(1);
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Failed to fetch product";
				setError(msg);
				setProduct(null);
			} finally {
				setIsLoading(false);
			}
		};

		if (productId) {
			fetchProduct();
		}
	}, [productId]);

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="min-h-screen bg-linear-to-b from-[#f7f3ee] via-[#fbf8f3] to-[#efe9df] px-6 pb-12 pt-24 text-[#1f1f1f]">
					<div className="mx-auto w-full max-w-3xl">
						<div className="rounded-2xl border border-dashed border-[#d7cec1] bg-white/70 p-8 text-center">
							<p className="text-sm text-[#6d6a63]">Loading product...</p>
						</div>
					</div>
				</main>
			</>
		);
	}

	if (error || !product) {
		return (
			<>
				<Header />
				<main className="min-h-screen bg-linear-to-b from-[#f7f3ee] via-[#fbf8f3] to-[#efe9df] px-6 pb-12 pt-24 text-[#1f1f1f]">
					<div className="mx-auto w-full max-w-3xl">
						<div className="rounded-2xl border border-dashed border-[#d7cec1] bg-white/70 p-8 text-center">
							<p className="text-sm text-[#6d6a63]">{error || "Product not found."}</p>
							<Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1f6b45]">
								Back to catalog
							</Link>
						</div>
					</div>
				</main>
			</>
		);
	}

	const handleDecrease = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const handleIncrease = () => {
		setQuantity((prev) => Math.min(product.quantity, prev + 1));
	};

	const handleAddToCart = () => {
		const current = readCartItems();
		const existing = current.find((item) => item.id === product._id);

	if (existing) {
		existing.quantity = Math.min(product.quantity, existing.quantity + quantity);
		existing.image = getImageUrl(product.image);
		writeCartItems([...current]);
		setCartMessage("Updated quantity in your cart.");
		window.setTimeout(() => setCartMessage(""), 2000);
		return;
	}

		const nextItem: CartItem = {
			id: product._id,
			name: product.name,
			farm: product.farm,
			image: getImageUrl(product.image),
			price: product.price,
			unit: product.unit,
			quantity,
		};

		writeCartItems([...current, nextItem]);
		setCartMessage("Added to cart.");
		window.setTimeout(() => setCartMessage(""), 2000);
	};

	return (
		<>
			<Header />
			<main className="min-h-screen bg-linear-to-b from-[#f7f3ee] via-[#fbf8f3] to-[#efe9df] px-6 pb-12 pt-24 text-[#1f1f1f]">
				<div className="mx-auto w-full max-w-6xl">
					<div className="mb-6">
						<Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#3f3d37]">
							<span className="text-lg">←</span>
							Back
						</Link>
					</div>

					<div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="overflow-hidden rounded-3xl bg-white shadow-lg">
							<div className="relative aspect-4/3 w-full">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={getImageUrl(product.image)}
									alt={product.name}
									style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.5rem' }}
									className="object-cover w-full h-full"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-5">
							<span className="w-fit rounded-full border border-[#e1dacf] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#3f3d37]">
								{product.category}
							</span>
							<div>
								<h1 className="text-3xl font-serif font-semibold text-[#1f1f1f]">{product.name}</h1>
								<p className="text-sm text-[#7b756d]">by {product.farm}</p>
							</div>
							<div className="flex items-baseline gap-2">
								<span className="text-2xl font-semibold text-[#1f6b45]">Rs {product.price.toFixed(2)}</span>
								<span className="text-sm text-[#7b756d]">per {product.unit}</span>
							</div>
							<p className="text-sm leading-relaxed text-[#4e4b46]">{product.description}</p>

							<span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold text-white ${
								product.availability === "in-stock" ? "bg-[#1f6b45]" :
								product.availability === "low-stock" ? "bg-[#d4a574]" :
								"bg-[#a0616a]"
							}`}>
								{product.quantity === 0 ? "Out of Stock" :
								product.availability === "low-stock" ? `Low Stock - ${product.quantity} ${product.unit} left` :
								`${product.quantity} ${product.unit === 'kg' ? 'kg' : product.unit} in stock`}
							</span>

							<div className="mt-2 flex flex-wrap items-center gap-3">
								<div className="flex items-center gap-4 rounded-lg border border-[#e1dacf] bg-white px-4 py-2 text-sm">
									<button type="button" onClick={handleDecrease} className="text-lg text-[#3f3d37]" disabled={product.availability === "out-of-stock"}>
										-
									</button>
									<span className="min-w-6 text-center font-medium">{quantity}</span>
									<button type="button" onClick={handleIncrease} className="text-lg text-[#3f3d37]" disabled={product.availability === "out-of-stock" || quantity >= product.quantity}>
										+
									</button>
								</div>
								<button
									type="button"
									onClick={handleAddToCart}
									disabled={product.availability === "out-of-stock"}
									className="inline-flex items-center gap-2 rounded-lg bg-[#1f6b45] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Add to Cart
								</button>
								{cartMessage ? (
									<span className="text-xs font-medium text-[#1f6b45]">{cartMessage}</span>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
