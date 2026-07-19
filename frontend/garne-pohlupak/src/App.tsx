import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ConfigProvider } from "antd"
import { AuthProvider } from "./contexts/AuthContext"
import { Home } from "./pages/Home"
import { Products } from "./pages/Products"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { AdminDashboard } from "./pages/AdminDashboard"
import { ProtectedRoute } from "./components/ProtectedRoute"

/** Main app file */
export default function App() {
	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: "#F8C663",
				},
				components: {
					Input: {
						activeBorderColor: "#F8C663",
						hoverBorderColor: "#F8C663",
						activeShadow: "0 0 0 2px rgba(248, 198, 99, 0.2)",
					},
					Button: {
						colorPrimary: "#F8C663",
						algorithm: true,
					},
				},
			}}
		>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/products" element={<Products />} />
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route
							path="/admin"
							element={
								<ProtectedRoute requireAdmin>
									<AdminDashboard />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</ConfigProvider>
	)
}
