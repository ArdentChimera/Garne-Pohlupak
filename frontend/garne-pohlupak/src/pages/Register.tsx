import React, { useState } from "react"
import { Form, Input, Button, Card, message } from "antd"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

export const Register: React.FC = () => {
	const [loading, setLoading] = useState(false)
	const { register } = useAuth()
	const navigate = useNavigate()

	const onFinish = async (values: {
		name: string
		email: string
		password: string
	}) => {
		setLoading(true)
		try {
			await register(values.email, values.password, values.name)
			message.success("Registration successful!")
			navigate("/")
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			message.error("Registration failed. Please try again.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8C663] to-[#F87C63] p-4">
			<motion.div
				className="bg-[url(/src/assets/shevica.png)] bg-[#F8C663] bg-size-[110px] bg-repeat-x absolute top-0 w-full h-[5vh]"
				animate={{ backgroundPositionX: ["0px", "110px"] }}
				transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
			/>

			<Card className="w-full max-w-md shadow-2xl border-2 border-[#F8C663]">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-[#F8C663] mb-2">
						Create Account
					</h1>
					<p className="text-gray-600">Register to get started</p>
				</div>

				<Form
					name="register"
					onFinish={onFinish}
					layout="vertical"
					size="large"
					autoComplete="off"
				>
					<Form.Item
						label="Full Name"
						name="name"
						rules={[{ required: true, message: "Please input your name!" }]}
					>
						<Input placeholder="Enter your full name" />
					</Form.Item>

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
						rules={[
							{ required: true, message: "Please input your password!" },
							{ min: 6, message: "Password must be at least 6 characters!" },
						]}
					>
						<Input.Password placeholder="Enter your password" />
					</Form.Item>

					<Form.Item
						label="Confirm Password"
						name="confirmPassword"
						dependencies={["password"]}
						rules={[
							{ required: true, message: "Please confirm your password!" },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue("password") === value) {
										return Promise.resolve()
									}
									return Promise.reject(new Error("Passwords do not match!"))
								},
							}),
						]}
					>
						<Input.Password placeholder="Confirm your password" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							className="w-full h-12"
						>
							Register
						</Button>
					</Form.Item>
				</Form>

				<div className="text-center">
					<p className="text-gray-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-[#F8C663] hover:underline font-semibold"
						>
							Login here
						</Link>
					</p>
				</div>
			</Card>
		</div>
	)
}
