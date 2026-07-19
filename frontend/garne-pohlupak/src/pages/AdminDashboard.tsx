import React, { useState } from "react"
import {
	Layout,
	Menu,
	Card,
	Row,
	Col,
	Form,
	Input,
	InputNumber,
	Button,
	Upload,
	message,
	Select,
	Table,
	Avatar,
	Drawer,
} from "antd"
import {
	DashboardOutlined,
	InboxOutlined,
	LogoutOutlined,
	ShoppingOutlined,
	UserOutlined,
	DollarOutlined,
	HomeOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	MenuOutlined,
} from "@ant-design/icons"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import type { MenuProps } from "antd"
import type { Product, User, ProductFormValues } from "../types"
import { adminAPI } from "../services/api"

const { Header, Content } = Layout
const { TextArea } = Input

type MenuItemType = Required<MenuProps>["items"][number]

const SidebarContent: React.FC<{
	user: User | null
	selectedMenu: string
	onMenuClick: (key: string) => void
	onLogout: () => void
	menuItems: MenuItemType[]
}> = ({ user, selectedMenu, onMenuClick, onLogout, menuItems }) => (
	<>
		<div className="p-6 border-b border-slate-200">
			<div className="flex items-center gap-3">
				<Avatar size={48} style={{ backgroundColor: "#F8C663" }}>
					<span className="text-slate-900 font-bold">
						{user?.name?.charAt(0).toUpperCase()}
					</span>
				</Avatar>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm truncate text-slate-900">
						{user?.name}
					</h3>
					<p className="text-xs text-slate-500">Администратор</p>
				</div>
			</div>
		</div>
		<Menu
			mode="inline"
			selectedKeys={[selectedMenu]}
			onClick={({ key }) => onMenuClick(key)}
			className="border-0 mt-2 bg-white! px-2"
			items={menuItems}
		/>
		<div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
			<Button
				type="text"
				icon={<LogoutOutlined />}
				onClick={onLogout}
				className="w-full justify-start hover:bg-red-50 hover:text-red-600 rounded-md h-10"
				danger
			>
				<span className="font-medium text-sm">Изход</span>
			</Button>
		</div>
	</>
)

export const AdminDashboard: React.FC = () => {
	const [selectedMenu, setSelectedMenu] = useState("dashboard")
	const [products, setProducts] = useState<Product[]>([])
	const [drawerVisible, setDrawerVisible] = useState(false)
	const { logout, user } = useAuth()
	const navigate = useNavigate()
	const [form] = Form.useForm()

	const handleLogout = () => {
		logout()
		navigate("/")
	}

	const handleMenuClick = (key: string) => {
		setSelectedMenu(key)
		setDrawerVisible(false)
	}

	const handleProductSubmit = async (values: ProductFormValues) => {
		try {
			const response = await adminAPI.createProduct({
				name: values.name,
				description: values.description,
				price: Math.round(values.price * 100), // Convert to cents
				imageUrl: values.image?.[0]?.url || "",
				stockQuantity: values.stock || 0,
				categoryId: values.category ? parseInt(values.category) : undefined,
			})

			if (response.success && response.data) {
				const newProduct: Product = {
					id: response.data.id.toString(),
					name: response.data.name,
					description: response.data.description || "",
					price: response.data.price / 100,
					category: values.category || "",
					imageUrl: response.data.imageUrl || "",
					stock: response.data.stockQuantity,
					createdAt: new Date(),
				}
				setProducts([...products, newProduct])
				message.success("Продуктът е добавен успешно!")
				form.resetFields()
			} else {
				message.error(response.error || "Грешка при добавяне на продукт")
			}
		} catch (error) {
			message.error("Грешка при добавяне на продукт")
			console.error("Add product error:", error)
		}
	}

	const mockAnalytics = {
		totalProducts: products.length + 156,
		totalOrders: 1284,
		totalRevenue: 45678.9,
		newCustomers: 89,
	}

	const columns = [
		{
			title: "Име на продукт",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Категория",
			dataIndex: "category",
			key: "category",
		},
		{
			title: "Цена",
			dataIndex: "price",
			key: "price",
			render: (price: number) => `${price.toFixed(2)} лв`,
		},
		{
			title: "Количество",
			dataIndex: "stock",
			key: "stock",
		},
	]

	const menuItems = [
		{
			key: "dashboard",
			icon: <DashboardOutlined className="text-base" />,
			label: <span className="font-medium text-sm">Табло</span>,
			className: "rounded-md mb-1 hover:bg-slate-100",
		},
		{
			key: "products",
			icon: <ShoppingOutlined className="text-base" />,
			label: <span className="font-medium text-sm">Добави продукт</span>,
			className: "rounded-md mb-1 hover:bg-slate-100",
		},
		{
			type: "divider" as const,
			className: "my-4 bg-slate-200",
		},
		{
			key: "home",
			icon: <HomeOutlined className="text-base" />,
			label: <span className="font-medium text-sm">Към начало</span>,
			onClick: () => navigate("/"),
			className: "rounded-md mb-1 hover:bg-slate-100",
		},
	]

	const renderContent = () => {
		switch (selectedMenu) {
			case "dashboard":
				return (
					<div className="space-y-6 md:space-y-8">
						<div>
							<h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
								Табло за управление
							</h2>
							<p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
								Добре дошли, {user?.name}!
							</p>
						</div>

						<Row gutter={[16, 16]}>
							<Col xs={24} sm={12} lg={6}>
								<Card className="!border-slate-200 hover:shadow-md transition-all duration-300 rounded-lg !bg-white">
									<div className="flex flex-row items-center justify-between pb-2">
										<h3 className="text-xs md:text-sm font-medium text-slate-600">
											Общо продукти
										</h3>
										<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center">
											<ShoppingOutlined className="text-base md:text-lg text-blue-600" />
										</div>
									</div>
									<div className="flex items-baseline gap-2 mt-2">
										<div className="text-2xl md:text-3xl font-bold text-slate-900">
											{mockAnalytics.totalProducts}
										</div>
										<span className="text-xs text-green-600 flex items-center gap-1 font-medium">
											<ArrowUpOutlined className="text-xs" />
											12%
										</span>
									</div>
									<p className="text-xs text-slate-500 mt-2">
										+20 от миналия месец
									</p>
								</Card>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<Card className="!border-slate-200 hover:shadow-md transition-all duration-300 rounded-lg !bg-white">
									<div className="flex flex-row items-center justify-between pb-2">
										<h3 className="text-xs md:text-sm font-medium text-slate-600">
											Общо поръчки
										</h3>
										<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-50 flex items-center justify-center">
											<InboxOutlined className="text-base md:text-lg text-purple-600" />
										</div>
									</div>
									<div className="flex items-baseline gap-2 mt-2">
										<div className="text-2xl md:text-3xl font-bold text-slate-900">
											{mockAnalytics.totalOrders}
										</div>
										<span className="text-xs text-green-600 flex items-center gap-1 font-medium">
											<ArrowUpOutlined className="text-xs" />
											8%
										</span>
									</div>
									<p className="text-xs text-slate-500 mt-2">
										+180 от миналия месец
									</p>
								</Card>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<Card className="!border-slate-200 hover:shadow-md transition-all duration-300 rounded-lg !bg-white">
									<div className="flex flex-row items-center justify-between pb-2">
										<h3 className="text-xs md:text-sm font-medium text-slate-600">
											Общи приходи
										</h3>
										<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center">
											<DollarOutlined className="text-base md:text-lg text-emerald-600" />
										</div>
									</div>
									<div className="flex items-baseline gap-2 mt-2">
										<div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
											{mockAnalytics.totalRevenue.toFixed(2)} лв
										</div>
										<span className="text-xs text-red-600 flex items-center gap-1 font-medium">
											<ArrowDownOutlined className="text-xs" />
											3%
										</span>
									</div>
									<p className="text-xs text-slate-500 mt-2">
										-1,234 лв от миналия месец
									</p>
								</Card>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<Card className="!border-slate-200 hover:shadow-md transition-all duration-300 rounded-lg !bg-white">
									<div className="flex flex-row items-center justify-between pb-2">
										<h3 className="text-xs md:text-sm font-medium text-slate-600">
											Нови клиенти
										</h3>
										<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center">
											<UserOutlined className="text-base md:text-lg text-amber-600" />
										</div>
									</div>
									<div className="flex items-baseline gap-2 mt-2">
										<div className="text-2xl md:text-3xl font-bold text-slate-900">
											{mockAnalytics.newCustomers}
										</div>
										<span className="text-xs text-green-600 flex items-center gap-1 font-medium">
											<ArrowUpOutlined className="text-xs" />
											24%
										</span>
									</div>
									<p className="text-xs text-slate-500 mt-2">
										+19 от миналия месец
									</p>
								</Card>
							</Col>
						</Row>

						<Card
							className="!border-slate-200 rounded-lg !bg-white shadow-sm"
							title={
								<span className="text-base md:text-lg font-semibold text-slate-900">
									Последни продукти
								</span>
							}
						>
							<div className="overflow-x-auto">
								<Table
									dataSource={products}
									columns={columns}
									rowKey="id"
									pagination={{ pageSize: 5 }}
									className="[&_.ant-table]:rounded-md [&_thead_th]:bg-slate-50 [&_thead_th]:text-slate-700 [&_thead_th]:font-semibold [&_tbody_tr:hover]:bg-slate-50"
								/>
							</div>
						</Card>
					</div>
				)

			case "products":
				return (
					<div className="space-y-6 md:space-y-8">
						<div>
							<h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
								Добави нов продукт
							</h2>
							<p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
								Попълнете детайлите за новия продукт
							</p>
						</div>
						<Card className="!border-slate-200 rounded-lg !bg-white shadow-sm">
							<Form
								form={form}
								layout="vertical"
								onFinish={handleProductSubmit}
								size="large"
							>
								<Row gutter={[16, 16]}>
									<Col xs={24} md={12}>
										<Form.Item
											label={
												<span className="text-sm font-medium text-slate-700">
													Име на продукт
												</span>
											}
											name="name"
											rules={[
												{
													required: true,
													message: "Моля въведете име на продукт",
												},
											]}
										>
											<Input
												placeholder="Въведете име на продукт"
												className="rounded-md hover:border-slate-400 focus:border-[#F8C663]"
											/>
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item
											label={
												<span className="text-sm font-medium text-slate-700">
													Категория
												</span>
											}
											name="category"
											rules={[
												{ required: true, message: "Моля изберете категория" },
											]}
										>
											<Select
												placeholder="Изберете категория"
												className="[&_.ant-select-selector]:rounded-md [&_.ant-select-selector]:hover:border-slate-400"
											>
												<Select.Option value="electronics">
													Електроника
												</Select.Option>
												<Select.Option value="clothing">Дрехи</Select.Option>
												<Select.Option value="food">Храна</Select.Option>
												<Select.Option value="books">Книги</Select.Option>
												<Select.Option value="toys">Играчки</Select.Option>
												<Select.Option value="other">Друго</Select.Option>
											</Select>
										</Form.Item>
									</Col>
								</Row>

								<Form.Item
									label={
										<span className="text-sm font-medium text-slate-700">
											Описание
										</span>
									}
									name="description"
									rules={[
										{ required: true, message: "Моля въведете описание" },
									]}
								>
									<TextArea
										rows={4}
										placeholder="Въведете описание на продукта"
										className="rounded-md hover:border-slate-400 focus:border-[#F8C663]"
									/>
								</Form.Item>

								<Row gutter={[16, 16]}>
									<Col xs={24} md={12}>
										<Form.Item
											label={
												<span className="text-sm font-medium text-slate-700">
													Цена (лв)
												</span>
											}
											name="price"
											rules={[
												{ required: true, message: "Моля въведете цена" },
											]}
										>
											<InputNumber
												min={0}
												step={0.01}
												className="w-full [&_input]:rounded-md hover:border-slate-400"
												placeholder="0.00"
											/>
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item
											label={
												<span className="text-sm font-medium text-slate-700">
													Количество
												</span>
											}
											name="stock"
											rules={[
												{ required: true, message: "Моля въведете количество" },
											]}
										>
											<InputNumber
												min={0}
												className="w-full [&_input]:rounded-md hover:border-slate-400"
												placeholder="0"
											/>
										</Form.Item>
									</Col>
								</Row>

								<Form.Item
									label={
										<span className="text-sm font-medium text-slate-700">
											Снимка на продукт
										</span>
									}
									name="image"
								>
									<Upload.Dragger
										name="files"
										maxCount={1}
										listType="picture"
										beforeUpload={() => false}
										className="rounded-lg !border-slate-300 border-2 border-dashed hover:!border-[#F8C663] transition-colors bg-slate-50/50"
									>
										<p className="ant-upload-drag-icon">
											<InboxOutlined className="text-3xl md:text-4xl text-slate-400" />
										</p>
										<p className="ant-upload-text text-sm font-medium text-slate-700">
											Кликнете или плъзнете файл за качване
										</p>
										<p className="ant-upload-hint text-xs text-slate-500">
											Поддръжка за качване на една снимка (PNG, JPG до 10MB)
										</p>
									</Upload.Dragger>
								</Form.Item>

								<Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										size="large"
										className="w-full md:w-auto md:px-8 rounded-md h-10 md:h-11 text-sm font-medium shadow-sm hover:shadow"
									>
										Добави продукт
									</Button>
								</Form.Item>
							</Form>
						</Card>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<Layout className="min-h-screen bg-slate-50">
			{/* Mobile Drawer */}
			<Drawer
				placement="left"
				onClose={() => setDrawerVisible(false)}
				open={drawerVisible}
				className="[&_.ant-drawer-body]:p-0 [&_.ant-drawer-body]:bg-white"
				width={260}
			>
				<div className="h-full flex flex-col bg-white relative">
					<SidebarContent
						user={user}
						selectedMenu={selectedMenu}
						onMenuClick={handleMenuClick}
						onLogout={handleLogout}
						menuItems={menuItems}
					/>
				</div>
			</Drawer>

			<Layout className="bg-slate-50">
				<Header className="bg-white! border-b border-slate-200 px-4 md:px-6 flex items-center justify-between h-16 shadow-sm sticky top-0 z-20">
					<div className="flex items-center gap-2">
						<Button
							type="text"
							icon={<MenuOutlined className="text-lg" />}
							onClick={() => setDrawerVisible(true)}
							className="-ml-2"
						/>
						<h1 className="text-lg md:text-xl font-semibold text-slate-900">
							Админ панел
						</h1>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-xs md:text-sm text-slate-600 hidden sm:block">
							{new Date().toLocaleDateString("bg-BG", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
				</Header>
				<Content className="p-4 md:p-6 lg:p-8">{renderContent()}</Content>
			</Layout>
		</Layout>
	)
}
