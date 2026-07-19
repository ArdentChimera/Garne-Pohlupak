import React, { useState } from "react"
import { Form, Input, Button, Card, message } from "antd"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

export const Login: React.FC = () => {
	const [loading, setLoading] = useState(false)
	const { login } = useAuth()
	const navigate = useNavigate()

	const onFinish = async (values: { role: string; password: string }) => {
		setLoading(true)
		try {
			await login(values.role, values.password)
			message.success("Login successful!")
			navigate(values.role.includes("admin") ? "/admin" : "/")
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			message.error("Login failed. Please try again.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8C663] to-[#F87C63] p-4">
			<motion.div
				className="bg-[url(/public/assets/shevica.png)] bg-[#F8C663] bg-size-[110px] bg-repeat-x absolute top-0 w-full h-[5vh]"
				animate={{ backgroundPositionX: ["0px", "110px"] }}
				transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
			/>

			<Card className="w-full max-w-md shadow-2xl border-2 border-[#F8C663]">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-[#F8C663] mb-2">
						Welcome Back
					</h1>
					<p className="text-gray-600">Login to your account</p>
				</div>

				<Form
					name="login"
					onFinish={onFinish}
					layout="vertical"
					size="large"
					autoComplete="off"
				>
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: "Please input your email!" },
							{ type: "email", message: "Please enter a valid email!" },
						]}
					>
						<Input placeholder="Enter your email" />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password placeholder="Enter your password" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							className="w-full h-12"
						>
							Login
						</Button>
					</Form.Item>
				</Form>

				<div className="text-center">
					<p className="text-gray-600">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-[#F8C663] hover:underline font-semibold"
						>
							Register here
						</Link>
					</p>
				</div>
			</Card>
		</div>
	)
}
