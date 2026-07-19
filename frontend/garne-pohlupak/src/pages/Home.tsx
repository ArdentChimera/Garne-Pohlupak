import * as React from "react"
import {
	Drawer,
	Button,
	Menu as AntMenu,
	Badge,
	Input,
	Carousel,
	Card,
	Spin,
	message,
} from "antd"
import type { GetProps } from "antd"
import { Home as HomeIcon, ShoppingBag, Info, Phone, Menu, ShoppingCart, User, LogOut, X, Plus, Minus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import type { MenuProps } from "antd"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { productsAPI, type Product } from "../services/api"

type SearchProps = GetProps<typeof Input.Search>

const { Search } = Input

const onSearch: SearchProps["onSearch"] = (value, _e, info) =>
	console.log(info?.source, value)

export const Home: React.FC = () => {
	const [openMenu, setOpenMenu] = React.useState(false)
	const [openCart, setOpenCart] = React.useState(false)
	const [cartItems, setCartItems] = React.useState([
		{ id: 1, name: "Традиционно гърне 5л", price: 45.0, quantity: 1, image: "/src/assets/logo.png" },
		{ id: 2, name: "Паничка за лечо 2л", price: 32.0, quantity: 2, image: "/src/assets/logo.png" },
	])
	const [products, setProducts] = React.useState<Product[]>([])
	const [loading, setLoading] = React.useState(true)
	const { isAuthenticated, logout, isAdmin } = useAuth()
	const navigate = useNavigate()

	// Fetch products on mount
	React.useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true)
			const response = await productsAPI.getAll({ limit: 6 })

			if (response.success && response.data) {
				setProducts(response.data.products)
			} else {
				message.error(response.error || "Failed to load products")
			}
			setLoading(false)
		}

		fetchProducts()
	}, [])

	const toggleMenuDrawer = (newOpen: boolean) => () => {
		setOpenMenu(newOpen)
	}

	const toggleCartDrawer = (newOpen: boolean) => () => {
		setOpenCart(newOpen)
	}

	const handleAuthClick = () => {
		if (isAuthenticated) {
			logout()
		} else {
			navigate("/login")
		}
	}

	const updateQuantity = (id: number, change: number) => {
		setCartItems(items =>
			items.map(item =>
				item.id === id
					? { ...item, quantity: Math.max(1, item.quantity + change) }
					: item
			)
		)
	}

	const removeItem = (id: number) => {
		setCartItems(items => items.filter(item => item.id !== id))
	}

	const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

	const menuItems: MenuProps["items"] = [
		...(isAdmin
			? [
					{
						key: "admin",
						icon: <User size={16} />,
						label: "Admin Dashboard",
						onClick: () => {
							navigate("/admin")
							setOpenMenu(false)
						},
					},
					{
						type: "divider" as const,
					},
			  ]
			: []),
		{
			key: "home",
			icon: <HomeIcon size={16} />,
			label: "Начало",
			onClick: () => {
				navigate("/")
				setOpenMenu(false)
			},
		},
		{
			key: "products",
			icon: <ShoppingBag size={16} />,
			label: "Продукти",
			onClick: () => {
				navigate("/products")
				setOpenMenu(false)
			},
		},
		{
			key: "about",
			icon: <Info size={16} />,
			label: "За нас",
			onClick: () => {
				navigate("/about")
				setOpenMenu(false)
			},
		},
		{
			key: "contact",
			icon: <Phone size={16} />,
			label: "Контакти",
			onClick: () => {
				navigate("/contact")
				setOpenMenu(false)
			},
		},
	]

	return (
		<div>
			<motion.div
				className="bg-[url(/src/assets/shevica.png)] bg-[#F8C663] bg-size-[110px] bg-repeat-x bg-center w-full h-[5vh] p-0 mb-6"
				animate={{ backgroundPositionX: ["0px", "110px"] }}
				transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
			/>
			<div className="flex justify-between items-center px-5">
				<div>
					<Button
						type="text"
						icon={<Menu size={24} color="#F8C663" />}
						onClick={toggleMenuDrawer(true)}
					/>
					<Drawer
						open={openMenu}
						onClose={toggleMenuDrawer(false)}
						placement="left"
						size={250}
					>
						<AntMenu
							items={menuItems}
							onClick={toggleMenuDrawer(false)}
							mode="inline"
						/>
					</Drawer>
				</div>

				<div className="w-20">
					<img src="src/assets/logo.png" alt="company logo" />
				</div>

				<div className="flex items-center gap-2">
					{/* Desktop button with text */}
					<div className="hidden md:block">
						<Button
							type="text"
							onClick={handleAuthClick}
							className="flex items-center gap-2"
						>
							{isAuthenticated ? <LogOut size={20} color="#F8C663" /> : <User size={20} color="#F8C663" />}
							<span className="text-[#F8C663] font-semibold">
								{isAuthenticated ? "Sign Out" : "Login"}
							</span>
						</Button>
					</div>

					{/* Mobile button with icon only */}
					<div className="block md:hidden">
						<Button
							type="text"
							icon={isAuthenticated ? <LogOut size={24} color="#F8C663" /> : <User size={24} color="#F8C663" />}
							onClick={handleAuthClick}
						/>
					</div>

					<Badge count={cartItems.length} offset={[-6, -12]} className="[&_.ant-badge-count]:bg-[#F8C663]">
						<Button
							type="text"
							icon={<ShoppingCart size={24} color="#F8C663" />}
							onClick={toggleCartDrawer(true)}
						/>
					</Badge>

					{/* Shopping Cart Drawer */}
					<Drawer
						title={
							<div className="flex items-center justify-between">
								<span className="text-lg font-bold">Количка</span>
								<Button
									type="text"
									icon={<X size={20} />}
									onClick={toggleCartDrawer(false)}
								/>
							</div>
						}
						open={openCart}
						placement="right"
						onClose={toggleCartDrawer(false)}
						width={400}
						closeIcon={null}
						className="[&_.ant-drawer-body]:p-0"
					>
						<div className="flex flex-col h-full">
							{cartItems.length === 0 ? (
								<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
									<ShoppingCart size={64} className="text-slate-300 mb-4" />
									<h3 className="text-lg font-semibold text-slate-900 mb-2">
										Количката е празна
									</h3>
									<p className="text-slate-600 mb-4">Добавете продукти, за да продължите</p>
									<Button
										type="primary"
										onClick={() => {
											navigate("/products")
											setOpenCart(false)
										}}
										className="!bg-[#F8C663] hover:!bg-[#f5b940] !border-none"
									>
										Разгледай продуктите
									</Button>
								</div>
							) : (
								<>
									{/* Cart Items */}
									<div className="flex-1 overflow-y-auto p-4">
										<div className="space-y-4">
											{cartItems.map(item => (
												<Card key={item.id} className="!border-slate-200 rounded-lg">
													<div className="flex gap-3">
														<div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
															<img
																src={item.image}
																alt={item.name}
																className="w-full h-full object-cover"
															/>
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-semibold text-sm text-slate-900 mb-1 truncate">
																{item.name}
															</h4>
															<p className="text-[#F8C663] font-bold text-sm mb-2">
																{item.price.toFixed(2)} лв
															</p>
															<div className="flex items-center gap-2">
																<Button
																	size="small"
																	icon={<Minus size={14} />}
																	onClick={() => updateQuantity(item.id, -1)}
																	className="!w-7 !h-7 !p-0 flex items-center justify-center"
																/>
																<span className="text-sm font-medium w-8 text-center">
																	{item.quantity}
																</span>
																<Button
																	size="small"
																	icon={<Plus size={14} />}
																	onClick={() => updateQuantity(item.id, 1)}
																	className="!w-7 !h-7 !p-0 flex items-center justify-center"
																/>
																<Button
																	size="small"
																	type="text"
																	danger
																	icon={<Trash2 size={14} />}
																	onClick={() => removeItem(item.id)}
																	className="ml-auto"
																/>
															</div>
														</div>
													</div>
												</Card>
											))}
										</div>
									</div>

									{/* Cart Footer */}
									<div className="border-t border-slate-200 p-4 bg-white">
										<div className="space-y-3 mb-4">
											<div className="flex justify-between text-sm">
												<span className="text-slate-600">Междинна сума</span>
												<span className="font-medium">{totalPrice.toFixed(2)} лв</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-slate-600">Доставка</span>
												<span className="font-medium text-green-600">Безплатна</span>
											</div>
											<div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
												<span>Общо</span>
												<span className="text-[#F8C663]">{totalPrice.toFixed(2)} лв</span>
											</div>
										</div>
										<Button
											type="primary"
											size="large"
											block
											className="!bg-[#F8C663] hover:!bg-[#f5b940] !border-none font-semibold mb-2"
										>
											Поръчай
										</Button>
										<Button
											size="large"
											block
											onClick={toggleCartDrawer(false)}
										>
											Продължи пазаруването
										</Button>
									</div>
								</>
							)}
						</div>
					</Drawer>
				</div>
			</div>

			<div className="w-full mt-6 md:mt-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
				<Search
					placeholder="Търси гърнета, паници, чинии..."
					onSearch={onSearch}
					enterButton
					size="large"
					className="w-full shadow-lg"
				/>
			</div>

			{/* Bento Grid Carousel Section - Symmetrical Square Layout */}
			<div className="px-4 md:px-8 lg:px-12 my-8 md:my-12 max-w-7xl mx-auto">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 auto-rows-fr">
					{/* Top Left - Large Featured */}
					<div className="col-span-2 row-span-2">
						<div className="w-full aspect-square">
							<Carousel
								autoplay
								autoplaySpeed={4000}
								className="rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow h-full"
							>
								<div>
									<div className="w-full aspect-square bg-gradient-to-br from-[#F8C663] to-[#f5b940] flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
										<img
											src="/src/assets/logo.png"
											alt="Промоция 1"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
								<div>
									<div className="w-full aspect-square bg-gradient-to-br from-[#f5b940] to-[#F8C663] flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
										Ръчно изработени гърнета
									</div>
								</div>
								<div>
									<div className="w-full aspect-square bg-gradient-to-br from-[#F8C663] to-[#f5b940] flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
										Традиционна българска керамика
									</div>
								</div>
							</Carousel>
						</div>
					</div>

					{/* Top Right Small 1 */}
					<div className="w-full aspect-square">
						<Carousel
							autoplay
							autoplaySpeed={3500}
							className="rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full"
						>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Нови гърнета
								</div>
							</div>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Свежи постъпления
								</div>
							</div>
						</Carousel>
					</div>

					{/* Top Right Small 2 */}
					<div className="w-full aspect-square">
						<Carousel
							autoplay
							autoplaySpeed={4500}
							className="rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full"
						>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Специални поръчки
								</div>
							</div>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									По ваш размер
								</div>
							</div>
						</Carousel>
					</div>

					{/* Bottom Right Small 3 */}
					<div className="w-full aspect-square">
						<Carousel
							autoplay
							autoplaySpeed={5000}
							className="rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full"
						>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Сезонни отстъпки
								</div>
							</div>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Намалени цени
								</div>
							</div>
						</Carousel>
					</div>

					{/* Bottom Right Small 4 */}
					<div className="w-full aspect-square">
						<Carousel
							autoplay
							autoplaySpeed={3000}
							className="rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full"
						>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Най-продавани
								</div>
							</div>
							<div>
								<div className="w-full aspect-square bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold text-center px-4">
									Любими модели
								</div>
							</div>
						</Carousel>
					</div>
				</div>
			</div>

			{/* Categories Section */}
			<div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-slate-50">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-6 md:mb-8">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900">Категории</h2>
						<Button type="link" className="text-[#F8C663] font-semibold hidden sm:block">
							Виж всички →
						</Button>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
						{[
							"Гърнета",
							"Паници",
							"Чинии",
							"Чаши",
							"Делви",
							"Тенджери",
						].map((category, index) => (
							<Card
								key={index}
								hoverable
								cover={
									<div className="overflow-hidden aspect-square bg-gradient-to-br from-[#F8C663] to-[#f5b940]">
										<img
											alt={category}
											src="/src/assets/logo.png"
											className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 opacity-80"
										/>
									</div>
								}
								className="group !border-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-lg md:rounded-xl"
								styles={{ body: { padding: "12px" } }}
							>
								<h3 className="text-center font-semibold text-slate-800 text-sm md:text-base">
									{category}
								</h3>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Featured Products Section */}
			<div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-white">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-6 md:mb-8">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900">Препоръчани изделия</h2>
						<Button type="link" className="text-[#F8C663] font-semibold hidden sm:block">
							Виж всички →
						</Button>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
						{[
							"Голямо гърне 5л",
							"Паничка 2л",
							"Комплект чинии",
							"Делва 3л",
							"Тенджера 4л",
							"Малко гърне 1л",
							"Чаши за ракия",
							"Гювеч",
							"Керамична паничка",
							"Гърне за яхния 6л"
						].map((item, index) => (
							<Card
								key={index}
								hoverable
								cover={
									<div className="overflow-hidden aspect-square bg-slate-100 relative">
										<img
											alt={item}
											src="/src/assets/logo.png"
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										{index % 3 === 0 && (
											<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
												-20%
											</div>
										)}
									</div>
								}
								className="group !border-slate-200 transition-all duration-300 hover:shadow-2xl rounded-lg md:rounded-xl"
								styles={{ body: { padding: "12px 16px" } }}
							>
								<h3 className="font-semibold text-slate-800 text-sm md:text-base mb-1 truncate">
									{item}
								</h3>
								<div className="flex items-baseline gap-2 mb-2">
									<span className="text-lg md:text-xl font-bold text-[#F8C663]">
										{(25 + index * 5).toFixed(2)} лв
									</span>
									{index % 3 === 0 && (
										<span className="text-xs md:text-sm text-slate-400 line-through">
											{(31 + index * 5).toFixed(2)} лв
										</span>
									)}
								</div>
								<div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
									<span className="text-yellow-500">★★★★★</span>
									<span>({120 + index * 10})</span>
								</div>
								<p className="text-xs text-slate-500 mb-3">Ръчно изработено</p>
								<Button
									type="primary"
									size="small"
									className="w-full mt-3 !bg-[#F8C663] hover:!bg-[#f5b940] !border-none font-medium"
								>
									Добави в количка
								</Button>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Best Sellers Section */}
			<div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-slate-50">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-6 md:mb-8">
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900">Най-продавани гърнета</h2>
						<Button
							type="link"
							className="text-[#F8C663] font-semibold hidden sm:block"
							onClick={() => navigate("/products")}
						>
							Виж всички →
						</Button>
					</div>
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<Spin size="large" />
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
							{products.map((item) => (
							<Card
								key={item.id}
								hoverable
								className="group !border-slate-200 transition-all duration-300 hover:shadow-xl rounded-xl"
							>
								<div className="flex gap-4">
									<div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
										<img
											src={item.imageUrl || "/src/assets/logo.png"}
											alt={item.name}
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
									</div>
									<div className="flex-1 flex flex-col justify-between py-1">
										<div>
											<h3 className="font-semibold text-slate-800 text-sm md:text-base mb-1">
												{item.name}
											</h3>
											<div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
												<span className="text-yellow-500">★★★★★</span>
												<span>(0)</span>
											</div>
											<p className="text-xs text-slate-500">
												{item.stockQuantity > 0 ? `В наличност: ${item.stockQuantity}` : "Изчерпан"}
											</p>
										</div>
										<div className="flex items-center justify-between mt-2">
											<div className="flex items-baseline gap-2">
												<span className="text-lg md:text-xl font-bold text-[#F8C663]">
													{(item.price / 100).toFixed(2)} лв
												</span>
											</div>
											<Button
												type="primary"
												size="small"
												className="!bg-[#F8C663] hover:!bg-[#f5b940] !border-none"
											>
												Купи
											</Button>
										</div>
									</div>
								</div>
							</Card>
						))}
						</div>
					)}
				</div>
			</div>

			{/* Customer Reviews Section */}
			<div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-white">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8 md:mb-12">
						Какво казват нашите клиенти
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
						{[
							{
								name: "Мария Петрова",
								rating: 5,
								review: "Страхотни гърнета! Майка ми готви в тях всеки ден. Храната е много по-вкусна и ароматна. Автентична българска изработка!",
								date: "Преди 2 дни",
								product: "Традиционно гърне 5л"
							},
							{
								name: "Георги Иванов",
								rating: 5,
								review: "Купих комплект гърнета за цялото семейство. Качеството е изключително, точно като на баба ми в селото!",
								date: "Преди 1 седмица",
								product: "Комплект гърнета"
							},
							{
								name: "Елена Димитрова",
								rating: 4,
								review: "Керамичните делви са много добри за яхния и боб. Единствено доставката беше малко закъсняла, но си заслужава!",
								date: "Преди 2 седмици",
								product: "Делва за боб 4л"
							},
							{
								name: "Иван Стоянов",
								rating: 5,
								review: "Перфектен гювеч! Направих печено месо и беше като от фурна на дърва. Ръчната изработка се вижда и усеща.",
								date: "Преди 3 дни",
								product: "Гювеч класически"
							},
							{
								name: "Виктория Георгиева",
								rating: 5,
								review: "Паничката е точно това, което ми трябваше за приготвяне на лечо и зимнина. Традиционно качество!",
								date: "Преди 5 дни",
								product: "Паничка за лечо 3л"
							},
							{
								name: "Петър Николов",
								rating: 4,
								review: "Много красиви и качествени гърнета. Чувства се българското майсторство. Препоръчвам на всички!",
								date: "Преди 1 месец",
								product: "Гърне за варене 7л"
							}
						].map((review, index) => (
							<Card
								key={index}
								className="!border-slate-200 hover:shadow-xl transition-all duration-300 rounded-xl"
							>
								<div className="flex flex-col h-full">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F8C663] to-[#f5b940] flex items-center justify-center text-white font-bold text-lg">
												{review.name.charAt(0)}
											</div>
											<div>
												<h4 className="font-semibold text-slate-900 text-sm md:text-base">
													{review.name}
												</h4>
												<p className="text-xs text-slate-500">{review.date}</p>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-1 mb-3">
										{[...Array(5)].map((_, i) => (
											<span
												key={i}
												className={`text-lg ${
													i < review.rating ? "text-yellow-500" : "text-slate-300"
												}`}
											>
												★
											</span>
										))}
									</div>
									<p className="text-slate-700 text-sm md:text-base mb-3 flex-1">
										"{review.review}"
									</p>
									<div className="pt-3 border-t border-slate-100">
										<p className="text-xs text-slate-500">
											<span className="font-medium">Продукт:</span> {review.product}
										</p>
									</div>
								</div>
							</Card>
						))}
					</div>
					<div className="text-center mt-8 md:mt-12">
						<Button
							type="primary"
							size="large"
							className="!bg-[#F8C663] hover:!bg-[#f5b940] !border-none font-semibold px-8"
						>
							Виж всички отзиви
						</Button>
					</div>
				</div>
			</div>

			{/* Newsletter Section */}
			<div className="w-full px-4 md:px-8 lg:px-12 py-16 md:py-20 bg-gradient-to-br from-[#F8C663] to-[#f5b940]">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
						Бъди в течение с традицията
					</h2>
					<p className="text-slate-700 text-sm md:text-base mb-6 md:mb-8">
						Получавай новини за нови гърнета, рецепти и традиционни техники за готвене директно в пощата си
					</p>
					<div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
						<Input
							size="large"
							placeholder="Въведи своя имейл"
							className="flex-1 rounded-lg"
						/>
						<Button
							type="primary"
							size="large"
							className="!bg-slate-900 hover:!bg-slate-800 !border-none font-semibold rounded-lg px-8"
						>
							Абонирай се
						</Button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-slate-900 text-slate-300">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
						<div>
							<h3 className="text-white font-bold text-lg mb-4">За нас</h3>
							<ul className="space-y-2 text-sm">
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Нашата история
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Майстори керамици
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Контакти
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-white font-bold text-lg mb-4">Информация</h3>
							<ul className="space-y-2 text-sm">
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Грижа за керамиката
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Доставка и връщане
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Рецепти с гърнета
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-white font-bold text-lg mb-4">Поръчки</h3>
							<ul className="space-y-2 text-sm">
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Моят акаунт
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Специални поръчки
								</li>
								<li className="hover:text-[#F8C663] cursor-pointer transition-colors">
									Проследяване
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-white font-bold text-lg mb-4">Следвай ни</h3>
							<div className="flex gap-4">
								<div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#F8C663] transition-colors cursor-pointer">
									<span className="text-lg">f</span>
								</div>
								<div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#F8C663] transition-colors cursor-pointer">
									<span className="text-lg">in</span>
								</div>
								<div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#F8C663] transition-colors cursor-pointer">
									<span className="text-lg">ig</span>
								</div>
							</div>
						</div>
					</div>
					<div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
						<p>© 2025 Гърне Похлупак - Традиционна българска керамика. Всички права запазени.</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
