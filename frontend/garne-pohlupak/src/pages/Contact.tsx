/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { Card, Button, Input, Form, message } from "antd"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react"

const { TextArea } = Input

export const Contact: React.FC = () => {
	const navigate = useNavigate()
	const [form] = Form.useForm()

	const onFinish = (values: any) => {
		console.log("Contact form:", values)
		message.success("Съобщението е изпратено успешно!")
		form.resetFields()
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
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
						Свържете се с нас
					</h1>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
					{/* Contact Form */}
					<div>
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
							Изпратете ни съобщение
						</h2>
						<p className="text-slate-600 mb-6">
							Имате въпроси? Свържете се с нас и ние ще се радваме да ви
							помогнем.
						</p>

						<Card className="!border-slate-200 rounded-xl shadow-lg">
							<Form
								form={form}
								layout="vertical"
								onFinish={onFinish}
								size="large"
							>
								<Form.Item
									label="Име"
									name="name"
									rules={[
										{ required: true, message: "Моля въведете вашето име" },
									]}
								>
									<Input placeholder="Вашето име" className="rounded-lg" />
								</Form.Item>

								<Form.Item
									label="Имейл"
									name="email"
									rules={[
										{ required: true, message: "Моля въведете имейл" },
										{ type: "email", message: "Моля въведете валиден имейл" },
									]}
								>
									<Input placeholder="your@email.com" className="rounded-lg" />
								</Form.Item>

								<Form.Item
									label="Телефон"
									name="phone"
									rules={[{ required: true, message: "Моля въведете телефон" }]}
								>
									<Input
										placeholder="+359 ... ... ..."
										className="rounded-lg"
									/>
								</Form.Item>

								<Form.Item
									label="Съобщение"
									name="message"
									rules={[
										{ required: true, message: "Моля въведете съобщение" },
									]}
								>
									<TextArea
										rows={6}
										placeholder="Вашето съобщение..."
										className="rounded-lg"
									/>
								</Form.Item>

								<Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										size="large"
										className="w-full !bg-[#F8C663] hover:!bg-[#f5b940] !border-none rounded-lg"
									>
										Изпрати съобщение
									</Button>
								</Form.Item>
							</Form>
						</Card>
					</div>

					{/* Contact Info */}
					<div>
						<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
							Информация за контакт
						</h2>
						<p className="text-slate-600 mb-6">
							Можете да ни намерите в нашата работилница или да се свържете с
							нас по следните начини:
						</p>

						<div className="space-y-4">
							<Card className="!border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-full bg-[#F8C663] flex items-center justify-center flex-shrink-0">
										<MapPin size={24} className="text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-slate-900 mb-1">Адрес</h3>
										<p className="text-slate-600">
											ул. "Грънчарска" 15
											<br />
											с. Бусинци, област София
											<br />
											България, 1234
										</p>
									</div>
								</div>
							</Card>

							<Card className="!border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-full bg-[#F8C663] flex items-center justify-center flex-shrink-0">
										<Phone size={24} className="text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-slate-900 mb-1">
											Телефон
										</h3>
										<p className="text-slate-600">
											+359 888 123 456
											<br />
											+359 2 123 4567
										</p>
									</div>
								</div>
							</Card>

							<Card className="!border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-full bg-[#F8C663] flex items-center justify-center flex-shrink-0">
										<Mail size={24} className="text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-slate-900 mb-1">Имейл</h3>
										<p className="text-slate-600">
											info@garne-pohlupak.bg
											<br />
											sales@garne-pohlupak.bg
										</p>
									</div>
								</div>
							</Card>

							<Card className="!border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-full bg-[#F8C663] flex items-center justify-center flex-shrink-0">
										<Clock size={24} className="text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-slate-900 mb-1">
											Работно време
										</h3>
										<p className="text-slate-600">
											Понеделник - Петък: 9:00 - 18:00
											<br />
											Събота: 10:00 - 14:00
											<br />
											Неделя: Почивен ден
										</p>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mt-16">
					<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
						Често задавани въпроси
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="!border-slate-200 rounded-xl">
							<h3 className="font-bold text-lg mb-2 text-slate-900">
								Правите ли специални поръчки?
							</h3>
							<p className="text-slate-600">
								Да, приемаме специални поръчки за гърнета с индивидуален размер
								и дизайн. Срокът за изпълнение е 2-3 седмици.
							</p>
						</Card>

						<Card className="!border-slate-200 rounded-xl">
							<h3 className="font-bold text-lg mb-2 text-slate-900">
								Как да грижа за керамиката?
							</h3>
							<p className="text-slate-600">
								Препоръчваме ръчно измиване с топла вода и сапун. Избягвайте
								резки температурни промени и използването на абразивни
								препарати.
							</p>
						</Card>

						<Card className="!border-slate-200 rounded-xl">
							<h3 className="font-bold text-lg mb-2 text-slate-900">
								Доставяте ли до адрес?
							</h3>
							<p className="text-slate-600">
								Да, доставяме до цялата страна. Безплатна доставка за поръчки
								над 100 лв. Срок на доставка 2-5 работни дни.
							</p>
						</Card>

						<Card className="!border-slate-200 rounded-xl">
							<h3 className="font-bold text-lg mb-2 text-slate-900">
								Имате ли гаранция?
							</h3>
							<p className="text-slate-600">
								Всички наши продукти имат 12 месеца гаранция срещу
								производствени дефекти. Можете да върнете или замените продукт в
								рамките на 14 дни.
							</p>
						</Card>
					</div>
				</div>
			</div>

			{/* Map Section */}
			<div className="w-full bg-white py-12 md:py-16 border-t border-slate-200">
				<div className="max-w-7xl mx-auto px-4 md:px-8">
					<h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
						Нашето местоположение
					</h2>
					<p className="text-slate-600 mb-8 text-center max-w-2xl mx-auto">
						Посетете ни в нашата работилница и вижте как се раждават
						автентичните български гърнета
					</p>
					<Card className="!border-slate-200 rounded-xl overflow-hidden shadow-lg">
						<div className="bg-slate-200 h-96 flex items-center justify-center">
							<div className="text-center">
								<MapPin size={48} className="text-slate-400 mx-auto mb-4" />
								<p className="text-slate-500 text-lg">
									Карта на местоположението
								</p>
								<p className="text-slate-400 text-sm mt-2">
									ул. "Грънчарска" 15, с. Бусинци, област София
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}
