const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

// Helper function to get auth token
const getAuthToken = (): string | null => {
	return localStorage.getItem("token")
}

// Helper function to create headers
const createHeaders = (includeAuth = true): HeadersInit => {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	}

	if (includeAuth) {
		const token = getAuthToken()
		if (token) {
			headers["Authorization"] = `Bearer ${token}`
		}
	}

	return headers
}

// Generic API request handler
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers: {
				...createHeaders(),
				...options.headers,
			},
		})

		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.error || `HTTP error! status: ${response.status}`)
		}

		return data
	} catch (error) {
		console.error("API request error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "An error occurred",
		}
	}
}

// ============= AUTH API =============

export interface User {
	id: number
	email: string
	firstName?: string
	lastName?: string
	role: "customer" | "admin" | "guest"
}

export interface AuthResponse {
	user: User
	token: string
}

export const authAPI = {
	register: async (data: {
		email: string
		password: string
		firstName?: string
		lastName?: string
	}): Promise<{ success: boolean; data?: AuthResponse; error?: string }> => {
		return apiRequest<AuthResponse>("/auth/register", {
			method: "POST",
			body: JSON.stringify(data),
		})
	},

	login: async (data: {
		email: string
		password: string
	}): Promise<{ success: boolean; data?: AuthResponse; error?: string }> => {
		return apiRequest<AuthResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		})
	},

	getGuestToken: async (): Promise<{ success: boolean; data?: { token: string }; error?: string }> => {
		return apiRequest<{ token: string }>("/auth/guest", {
			method: "POST",
		})
	},
}

// ============= PRODUCTS API =============

export interface Product {
	id: number
	name: string
	description?: string
	price: number // in cents
	imageUrl?: string
	stockQuantity: number
	categoryId?: number
	isActive?: number
	createdAt?: Date
	updatedAt?: Date
}

export interface ProductsResponse {
	products: Product[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export const productsAPI = {
	getAll: async (params?: {
		page?: number
		limit?: number
		search?: string
		minPrice?: number
		maxPrice?: number
		categoryId?: number
	}): Promise<{ success: boolean; data?: ProductsResponse; error?: string }> => {
		const queryParams = new URLSearchParams()
		if (params?.page) queryParams.append("page", params.page.toString())
		if (params?.limit) queryParams.append("limit", params.limit.toString())
		if (params?.search) queryParams.append("search", params.search)
		if (params?.minPrice) queryParams.append("minPrice", params.minPrice.toString())
		if (params?.maxPrice) queryParams.append("maxPrice", params.maxPrice.toString())
		if (params?.categoryId) queryParams.append("categoryId", params.categoryId.toString())

		const query = queryParams.toString()
		return apiRequest<ProductsResponse>(`/products${query ? `?${query}` : ""}`)
	},

	getById: async (
		id: number
	): Promise<{ success: boolean; data?: Product & { specs: { key: string; value: string }[] }; error?: string }> => {
		return apiRequest<Product & { specs: { key: string; value: string }[] }>(`/products/${id}`)
	},
}

// ============= ADMIN API =============

export const adminAPI = {
	// Products Management
	getAllProducts: async (): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
		return apiRequest<Product[]>("/admin/products")
	},

	getProduct: async (id: number): Promise<{ success: boolean; data?: Product; error?: string }> => {
		return apiRequest<Product>(`/admin/products/${id}`)
	},

	createProduct: async (data: {
		name: string
		description?: string
		price: number
		imageUrl?: string
		stockQuantity?: number
		categoryId?: number
	}): Promise<{ success: boolean; data?: Product; error?: string }> => {
		return apiRequest<Product>("/admin/products", {
			method: "POST",
			body: JSON.stringify(data),
		})
	},

	updateProduct: async (
		id: number,
		data: {
			name?: string
			description?: string
			price?: number
			imageUrl?: string
			stockQuantity?: number
			categoryId?: number
			isActive?: number
		}
	): Promise<{ success: boolean; data?: Product; error?: string }> => {
		return apiRequest<Product>(`/admin/products/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	},

	deleteProduct: async (
		id: number
	): Promise<{ success: boolean; message?: string; error?: string }> => {
		return apiRequest<{ message: string }>(`/admin/products/${id}`, {
			method: "DELETE",
		})
	},

	// Orders Management
	getAllOrders: async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
		return apiRequest<any[]>("/admin/orders")
	},

	getOrder: async (id: number): Promise<{ success: boolean; data?: any; error?: string }> => {
		return apiRequest<any>(`/admin/orders/${id}`)
	},

	updateOrderStatus: async (
		id: number,
		status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
	): Promise<{ success: boolean; data?: any; error?: string }> => {
		return apiRequest<any>(`/admin/orders/${id}/status`, {
			method: "PATCH",
			body: JSON.stringify({ status }),
		})
	},

	// Users Management
	getAllUsers: async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
		return apiRequest<any[]>("/admin/users")
	},
}

// ============= CART API =============

export interface CartItem {
	id: number
	productId: number
	quantity: number
	expiresAt: Date
	productName: string
	productPrice: number
	productImage?: string
	availableStock: number
}

export interface CartResponse {
	items: CartItem[]
	total: number
}

export const cartAPI = {
	get: async (): Promise<{ success: boolean; data?: CartResponse; error?: string }> => {
		return apiRequest<CartResponse>("/cart")
	},

	add: async (data: {
		productId: number
		quantity: number
	}): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
		return apiRequest<any>("/cart", {
			method: "POST",
			body: JSON.stringify(data),
		})
	},

	update: async (
		id: number,
		quantity: number
	): Promise<{ success: boolean; data?: any; error?: string }> => {
		return apiRequest<any>(`/cart/${id}`, {
			method: "PUT",
			body: JSON.stringify({ quantity }),
		})
	},

	remove: async (id: number): Promise<{ success: boolean; message?: string; error?: string }> => {
		return apiRequest<{ message: string }>(`/cart/${id}`, {
			method: "DELETE",
		})
	},

	clear: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
		return apiRequest<{ message: string }>("/cart", {
			method: "DELETE",
		})
	},
}
