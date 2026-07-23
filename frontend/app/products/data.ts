export type Product = {
	id: string;
	name: string;
	category: "vegetables" | "fruits" | "grains";
	price: number;
	unit: string;
	farm: string;
	status: "in-stock" | "low-stock" | "out-of-stock";
	image: string;
	description: string;
	quantity: number;
};

export const products: Product[] = [
	{
		id: "p1",
		name: "Organic Tomatoes",
		category: "vegetables",
		price: 3.5,
		unit: "kg",
		farm: "Green Valley Farm",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Fresh, juicy tomatoes grown with organic methods. Perfect for salads, sauces, and everyday cooking.",
		quantity: 150,
	},
	{
		id: "p2",
		name: "Fresh Spinach",
		category: "vegetables",
		price: 2.8,
		unit: "bunch",
		farm: "Sunrise Organics",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Tender spinach leaves packed with nutrients. Great for smoothies, sauteed sides, and soups.",
		quantity: 120,
	},
	{
		id: "p3",
		name: "Sweet Carrots",
		category: "vegetables",
		price: 2.2,
		unit: "kg",
		farm: "Hillside Gardens",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Crunchy, naturally sweet carrots straight from the field. Ideal for snacking or roasting.",
		quantity: 150,
	},
	{
		id: "p4",
		name: "Bell Peppers Mix",
		category: "vegetables",
		price: 4.0,
		unit: "kg",
		farm: "Green Valley Farm",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Colorful bell peppers with a crisp bite. Adds vibrant flavor to stir-fries and salads.",
		quantity: 95,
	},
	{
		id: "p5",
		name: "Fresh Broccoli",
		category: "vegetables",
		price: 3.1,
		unit: "kg",
		farm: "Evergreen Farms",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Firm, green broccoli florets harvested at peak freshness. Delicious steamed or roasted.",
		quantity: 80,
	},
	{
		id: "p6",
		name: "Potatoes",
		category: "vegetables",
		price: 1.8,
		unit: "kg",
		farm: "Country Fields",
		status: "in-stock",
		image: "/vegetable.jpg",
		description:
			"Versatile, earthy potatoes perfect for mashing, frying, or baking.",
		quantity: 200,
	},
	{
		id: "p7",
		name: "Red Apples",
		category: "fruits",
		price: 3.9,
		unit: "kg",
		farm: "Orchard Lane",
		status: "in-stock",
		image: "/fruits.jpg",
		description:
			"Crisp red apples with a balanced sweet-tart flavor. Great for snacking or pies.",
		quantity: 170,
	},
	{
		id: "p8",
		name: "Bananas",
		category: "fruits",
		price: 2.4,
		unit: "kg",
		farm: "Sunny Harvest",
		status: "in-stock",
		image: "/fruits.jpg",
		description:
			"Naturally sweet bananas, perfect for breakfast or smoothies.",
		quantity: 140,
	},
	{
		id: "p9",
		name: "Golden Wheat",
		category: "grains",
		price: 1.2,
		unit: "kg",
		farm: "Prairie Grain Co.",
		status: "low-stock",
		image: "/grains.jpg",
		description:
			"Premium golden wheat suitable for milling or hearty grain bowls.",
		quantity: 40,
	},
];
