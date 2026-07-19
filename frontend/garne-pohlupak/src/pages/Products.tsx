import React, { useState, useEffect } from "react"
import { Card, Button, Select, Spin, message } from "antd"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { productsAPI, type Product } from "../services/api"

export const Products: React.FC = () => {
	const navigate = useNavigate()
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [selectedSize, setSelectedSize] = useState<string>("all")
	const [priceRange, setPriceRange] = useState<string>("all")
	const [sortBy, setSortBy] = useState<string>("popular")
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)

	// Fetch products
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true)

			// Parse price range
			let minPrice: number | undefined
			let maxPrice: number | undefined
			if (priceRange !== "all") {
				const [min, max] = priceRange.split("-")
				minPrice = parseInt(min) * 100 // Convert to cents
				maxPrice = max === "+" ? undefined : parseInt(max) * 100
			}

			const response = await productsAPI.getAll({
				limit: 50,
				minPrice,
				maxPrice,
			})

			if (response.success && response.data) {
				setProducts(response.data.products)
			} else {
				message.error(response.error || "Failed to load products")
			}
			setLoading(false)
		}

		fetchProducts()
	}, [priceRange])

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
					<Button
						type="text"
						icon={<ArrowLeft size={20} />}
						onClick={() => navigate("/")}
						className="mb-2"
					>
						Назад към начало
					</Button>
					<h1 className="text-2xl md:text-3xl font-bold text-slate-900">
						Всички продукти
					</h1>
					<p className="text-slate-600 mt-1">
						Ръчно изработени български гърнета
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
				{/* Filters Bar */}
				<Card className="!border-slate-200 rounded-xl mb-6 md:mb-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">
								Категория
							</label>
							<Select
								value={selectedCategory}
								onChange={setSelectedCategory}
								className="w-full"
								options={[
									{ value: "all", label: "Всички" },
									{ value: "gurneta", label: "Гърнета" },
									{ value: "panici", label: "Паници" },
									{ value: "chinii", label: "Чинии" },
									{ value: "chashi", label: "Чаши" },
									{ value: "delvi", label: "Делви" },
									{ value: "tendzheri", label: "Тенджери" },
								]}
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">
								Обем
							</label>
							<Select
								value={selectedSize}
								onChange={setSelectedSize}
								className="w-full"
								options={[
									{ value: "all", label: "Всички" },
									{ value: "small", label: "Малък (до 2л)" },
									{ value: "medium", label: "Среден (2-5л)" },
									{ value: "large", label: "Голям (над 5л)" },
								]}
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">
								Цена
							</label>
							<Select
								value={priceRange}
								onChange={setPriceRange}
								className="w-full"
								options={[
									{ value: "all", label: "Всички цени" },
									{ value: "0-30", label: "До 30 лв" },
									{ value: "30-60", label: "30 - 60 лв" },
									{ value: "60-100", label: "60 - 100 лв" },
									{ value: "100+", label: "Над 100 лв" },
								]}
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">
								Подреди по
							</label>
							<Select
								value={sortBy}
								onChange={setSortBy}
								className="w-full"
								options={[
									{ value: "popular", label: "Най-популярни" },
									{ value: "price-asc", label: "Цена: Ниска към висока" },
									{ value: "price-desc", label: "Цена: Висока към ниска" },
									{ value: "newest", label: "Най-нови" },
								]}
							/>
						</div>

						<div className="flex items-end">
							<Button
								type="primary"
								className="w-full !bg-[#F8C663] hover:!bg-[#f5b940] !border-none"
								onClick={() => {
									setSelectedCategory("all")
									setSelectedSize("all")
									setPriceRange("all")
									setSortBy("popular")
								}}
							>
								Изчисти
							</Button>
						</div>
					</div>
				</Card>

				{/* Results Count */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<Spin size="large" />
					</div>
				) : (
					<>
						<p className="text-slate-600 mb-6">
							Показани {products.length} продукта
						</p>

						{/* Products Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
							{products.map(product => (
								<Card
									key={product.id}
									hoverable
									cover={
										<div className="overflow-hidden aspect-square bg-slate-100">
											<img
												alt={product.name}
												src={product.imageUrl || "/public/assets/logo.png"}
												className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
											/>
										</div>
									}
									className="!border-slate-200 transition-all duration-300 hover:shadow-xl rounded-xl"
									styles={{ body: { padding: "16px" } }}
								>
									<span className="text-xs text-[#F8C663] font-medium">
										{product.description?.split(" ").slice(0, 2).join(" ") ||
											"Гърнета"}
									</span>
									<h3 className="font-semibold text-slate-900 mt-1 mb-2">
										{product.name}
									</h3>
									<div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
										<span className="text-yellow-500">★★★★★</span>
										<span>(0)</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-xl font-bold text-[#F8C663]">
											{(product.price / 100).toFixed(2)} лв
										</span>
										<Button
											type="primary"
											size="small"
											className="!bg-[#F8C663] hover:!bg-[#f5b940] !border-none"
										>
											Добави
										</Button>
									</div>
								</Card>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
