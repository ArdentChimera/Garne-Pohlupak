import React, { createContext, useContext, useState } from "react"
import type { User, AuthContextType } from "../types"
import { authAPI } from "../services/api"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(() => {
		// Initialize user from localStorage on mount
		const storedUser = localStorage.getItem("user")
		return storedUser ? JSON.parse(storedUser) : null
	})

	const login = async (email: string, password: string) => {
		const response = await authAPI.login({ email, password })

		if (!response.success || !response.data) {
			throw new Error(response.error || "Login failed")
		}

		const { user: apiUser, token } = response.data

		const mappedUser: User = {
			id: apiUser.id.toString(),
			email: apiUser.email,
			name: apiUser.firstName || apiUser.email.split("@")[0],
			role: apiUser.role === "admin" ? "admin" : "user",
			createdAt: new Date(),
		}

		setUser(mappedUser)
		localStorage.setItem("user", JSON.stringify(mappedUser))
		localStorage.setItem("token", token)
	}

	const register = async (email: string, password: string, name: string) => {
		const [firstName, ...lastNameParts] = name.split(" ")
		const lastName = lastNameParts.join(" ")

		const response = await authAPI.register({
			email,
			password,
			firstName,
			lastName: lastName || undefined,
		})

		if (!response.success || !response.data) {
			throw new Error(response.error || "Registration failed")
		}

		const { user: apiUser, token } = response.data

		const mappedUser: User = {
			id: apiUser.id.toString(),
			email: apiUser.email,
			name: apiUser.firstName || apiUser.email.split("@")[0],
			role: apiUser.role === "admin" ? "admin" : "user",
			createdAt: new Date(),
		}

		setUser(mappedUser)
		localStorage.setItem("user", JSON.stringify(mappedUser))
		localStorage.setItem("token", token)
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem("user")
		localStorage.removeItem("token")
	}

	const value: AuthContextType = {
		user,
		login,
		register,
		logout,
		isAuthenticated: !!user,
		isAdmin: user?.role === "admin",
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
