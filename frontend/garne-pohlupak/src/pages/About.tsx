import React from "react"
import { Card, Button } from "antd"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export const About: React.FC = () => {
	const navigate = useNavigate()

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
					<h1 className="text-2xl md:text-3xl font-bold text-slate-900">За нас</h1>
				</div>
			</div>

			{/* Hero Section */}
			<div className="bg-gradient-to-br from-[#F8C663] to-[#f5b940] py-16 md:py-24">
				<div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
					<h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
						Традиция, която се предава от поколения
					</h2>
					<p className="text-lg md:text-xl text-slate-700">
						Вече над 50 години съхраняваме и развиваме българското керамично изкуство
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
				{/* Story Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
					<div>
						<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Нашата история</h3>
						<div className="space-y-4 text-slate-700 leading-relaxed">
							<p>
								Гърне Похлупак е семейна работилница, основана през 1970 година в сърцето на
								България. От три поколения създаваме автентични глинени съдове, следвайки
								традиционни методи и техники, предавани от баща на син.
							</p>
							<p>
								Всяко наше изделие е ръчно изработено от местна глина, която събираме от планините
								около нашето село. Процесът на създаване включва формоване на грънчарско колело,
								естествено изсушаване и изпичане във фурна на дърва при висока температура.
							</p>
							<p>
								Вярваме, че храната, приготвена в глинени съдове, има неповторим вкус и аромат.
								Нашите гърнета запазват всички полезни вещества и придават специален характер на
								всяко ястие.
							</p>
						</div>
					</div>
					<div className="bg-slate-200 rounded-2xl overflow-hidden aspect-square lg:aspect-auto">
						<img
							src="/src/assets/logo.png"
							alt="Нашата работилница"
							className="w-full h-full object-cover"
						/>
					</div>
				</div>

				{/* Values */}
				<div className="mb-16">
					<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
						Нашите ценности
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="!border-slate-200 rounded-xl text-center hover:shadow-xl transition-shadow">
							<div className="text-4xl mb-4">🏺</div>
							<h4 className="font-bold text-lg mb-2 text-slate-900">Автентичност</h4>
							<p className="text-slate-600">
								Използваме само традиционни техники и материали, без компромиси с качеството
							</p>
						</Card>
						<Card className="!border-slate-200 rounded-xl text-center hover:shadow-xl transition-shadow">
							<div className="text-4xl mb-4">🌿</div>
							<h4 className="font-bold text-lg mb-2 text-slate-900">Екологичност</h4>
							<p className="text-slate-600">
								100% природни материали и ръчна изработка без използване на химикали
							</p>
						</Card>
						<Card className="!border-slate-200 rounded-xl text-center hover:shadow-xl transition-shadow">
							<div className="text-4xl mb-4">❤️</div>
							<h4 className="font-bold text-lg mb-2 text-slate-900">Любов към занаята</h4>
							<p className="text-slate-600">
								Всяко изделие е създадено с грижа и внимание към детайлите
							</p>
						</Card>
					</div>
				</div>

				{/* Team */}
				<div className="mb-16">
					<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
						Нашият екип
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{ name: "Иван Петров", role: "Майстор керамик", exp: "40 години опит" },
							{ name: "Мария Петрова", role: "Дизайнер", exp: "25 години опит" },
							{ name: "Георги Иванов", role: "Майстор грънчар", exp: "15 години опит" },
							{ name: "Елена Димитрова", role: "Художник", exp: "20 години опит" },
						].map((member, index) => (
							<Card key={index} className="!border-slate-200 rounded-xl text-center">
								<div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F8C663] to-[#f5b940] flex items-center justify-center">
									<span className="text-3xl text-white font-bold">{member.name.charAt(0)}</span>
								</div>
								<h4 className="font-bold text-lg text-slate-900">{member.name}</h4>
								<p className="text-[#F8C663] font-medium text-sm">{member.role}</p>
								<p className="text-slate-500 text-xs mt-1">{member.exp}</p>
							</Card>
						))}
					</div>
				</div>

				{/* CTA */}
				<div className="bg-gradient-to-br from-[#F8C663] to-[#f5b940] rounded-2xl p-8 md:p-12 text-center">
					<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
						Вижте нашите изделия
					</h3>
					<p className="text-slate-700 mb-6 max-w-2xl mx-auto">
						Разгледайте нашата колекция от ръчно изработени гърнета и намерете перфектното
						допълнение за вашата кухня
					</p>
					<Button
						type="primary"
						size="large"
						onClick={() => navigate("/products")}
						className="!bg-slate-900 hover:!bg-slate-800 !border-none px-8"
					>
						Разгледай продуктите
					</Button>
				</div>
			</div>
		</div>
	)
}
