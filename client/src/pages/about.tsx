import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, Lightbulb, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{backgroundColor:'#f8fafc'}}>
      {/* SVG Grid Pattern BG */}
      <svg className="absolute inset-0 w-full h-full opacity-20 z-0" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="20" height="20" fill="#f8fafc" />
            <circle cx="1" cy="1" r="1" fill="#e5e7eb" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 flex items-center justify-center">
          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-[#374151]">
                CLKtech Hakkında
              </h1>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Eğitimde inovasyon ve teknolojide öncülük vizyonuyla, herkes için erişilebilir ve güçlü robotik platformlar geliştiriyoruz.
              </p>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 bg-white/80">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
            alt="CLKtech Robotik Çalışma Ortamı"
                  className="w-full max-w-[420px] h-auto object-cover"
          />
        </div>
            </div>
        </div>
        </section>

        {/* Misyon ve Değerler */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Misyon */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Lightbulb className="w-7 h-7" style={{color:'#f59e42'}} /> Misyonumuz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-[#374151]">
            Öğrenciler, öğretmenler ve teknoloji tutkunları için ilham verici, kolay kullanılabilir ve kaliteli ürünler sunmak. Eğitimde fırsat eşitliğini desteklemek ve yeni nesil teknolojilere erişimi kolaylaştırmak.
          </p>
                </CardContent>
              </Card>
              {/* Vizyon */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Award className="w-7 h-7" style={{color:'#34d399'}} /> Vizyonumuz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-[#374151]">
                    Robotik eğitimde yenilikçi, erişilebilir ve sürdürülebilir çözümlerle dünya çapında ilham kaynağı olmak.
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Değerler Grid */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center text-[#374151]">Değerlerimiz</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Lightbulb className="h-8 w-8 mb-3" style={{color:'#f59e42'}} />
                    <h3 className="text-lg font-semibold mb-2 text-[#374151]">Yenilikçilik</h3>
                    <p className="text-[#374151]">Sürekli gelişim ve yeni teknolojilerle eğitimde fark yaratmak.</p>
                  </CardContent>
                </Card>
                <Card className="text-center border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Users className="h-8 w-8 mb-3" style={{color:'#34d399'}} />
                    <h3 className="text-lg font-semibold mb-2 text-[#374151]">Erişilebilirlik</h3>
                    <p className="text-[#374151]">Herkes için ulaşılabilir ve kullanıcı dostu çözümler sunmak.</p>
                  </CardContent>
                </Card>
                <Card className="text-center border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 flex flex-col items-center">
                    <ShieldCheck className="h-8 w-8 mb-3" style={{color:'#374151'}} />
                    <h3 className="text-lg font-semibold mb-2 text-[#374151]">Kalite</h3>
                    <p className="text-[#374151]">Yüksek kalite ve güvenilirlik standartlarına bağlılık.</p>
                  </CardContent>
                </Card>
              </div>
        </div>
        </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="shadow-xl bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white">
              <CardContent className="py-12">
                <h2 className="text-2xl font-bold mb-4">Bize Katılın!</h2>
                <p className="text-lg mb-8">
            Ürünlerimizi keşfetmek veya bizimle iletişime geçmek için hemen tıklayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/products" className="bg-white text-[#f59e42] font-semibold px-8 py-3 rounded-lg shadow hover:bg-orange-50 transition-all duration-200 inline-block">
              Ürünleri Keşfet
            </a>
                  <a
                    href="/contact"
                    className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold px-8 py-3 rounded-lg shadow hover:scale-105 transition-all duration-200 inline-block"
                  >
              İletişime Geç
            </a>
          </div>
              </CardContent>
            </Card>
        </div>
        </section>
      </div>
    </div>
  );
}
