export interface User {
	id: string
	email: string
	name: string
	role: "admin" | "user"
	createdAt: Date
}

export interface AuthContextType {
	user: User | null
	login: (email: string, password: string) => Promise<void>
	register: (email: string, password: string, name: string) => Promise<void>
	logout: () => void
	isAuthenticated: boolean
	isAdmin: boolean
}

export interface Product {
	id: string
	name: string
	description: string
	price: number
	category: string
	imageUrl: string
	stock: number
	createdAt: Date
}

export interface Analytics {
	totalProducts: number
	totalOrders: number
	totalRevenue: number
	newCustomers: number
}

export interface ProductFormValues {
	name: string
	description?: string
	price: number
	category?: string
	stock?: number
	image?: Array<{ url?: string }>
}
