import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Play, Check, AppWindowMac } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";


export default function CodingApp() {
  const { t } = useTranslation();
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1333] via-[#232b4d] to-[#1a1333] text-white overflow-x-hidden relative">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden flex items-center justify-center">
        {/* SVG Pattern BG */}
        <svg className="absolute inset-0 w-full h-full opacity-10 z-0" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="800" height="400" fill="url(#pattern)" />
          <defs>
            <linearGradient id="pattern" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6EE7B7" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Metin Alanı */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow mb-4 tracking-widest uppercase">
            {t("codingApp.title")}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Sürükle-Bırak ile <span className="text-blue-400">Robotunu Programla</span>
          </h1>
            <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("codingApp.visualProgrammingDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href={settings?.downloadUrl || "/downloads/clk-block-code-windows.exe"} download>
                <Button size="lg" className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200 flex items-center gap-2">
                  <span className="font-semibold">{t("codingApp.downloadBtn", "İndir")}</span>
                  </Button>
                </a>
              </div>
            <div className="mt-4">
              <span className="inline-block bg-orange-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow animate-pulse">
                {t("codingApp.onlyWindowsAvailable")}
              </span>
              <span className="block text-xs text-slate-300 mt-2">
                {t("codingApp.systemRequirements")}
              </span>
            </div>
          </div>
          {/* Görsel Alanı */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-transparent rounded-3xl blur-2xl z-0 animate-pulse" />
              <img
                src="/uploads/block_programming_interface.png"
                alt={t("codingApp.screenshotAlt")}
                className="w-full max-w-[520px] h-auto max-h-[340px] object-contain bg-white rounded-2xl shadow-2xl border-4 border-white/10 relative z-10 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute left-1/2 -translate-x-1/2 bg-white/90 text-slate-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-20 animate-fade-in-up mt-8" style={{top: '100%'}}>
                {t("codingApp.screenshotAlt")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("codingApp.visualProgrammingTitle")}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("codingApp.visualProgrammingDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[0,1,2,3,4,5].map((i) => (
              <Card key={i} className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
                <CardContent className="p-6 flex flex-col items-center">
                  <Check className="h-8 w-8 text-blue-600 mb-4 animate-bounce" />
                  <h3 className="text-lg font-semibold mb-2">{t(`codingApp.keyFeatures.${i}`)}</h3>
                </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">{t("codingApp.screenshotAlt")}</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t("codingApp.visualProgrammingDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src="/uploads/robot_selection_interface.png" 
                alt="Robot Seçimi" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">Robot Seçimi</h3>
              <p className="text-slate-300">MazeX, LineX ve VivianX platformlarını tek tıkla seçin.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src="/uploads/block_programming_interface.png" 
                alt="Görsel Programlama" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">Görsel Programlama</h3>
              <p className="text-slate-300">Blokları sürükleyip bırakarak robot davranışlarını kolayca oluşturun.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src="/uploads/real_time_testing.png" 
                alt="Gerçek Zamanlı Test" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">Gerçek Zamanlı Test</h3>
              <p className="text-slate-300">Kodunuzu anında test edin, sonuçları gerçek zamanlı görün.</p>
            </div>
          </div>
        </div>
      </section>

        {/* Video Tutorial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
          <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-slate-900">
              {t("codingApp.tutorialTitle")}
            </CardTitle>
            <p className="text-center text-gray-600">
              {t("codingApp.tutorialDesc")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/X6oj8d3w4Ug?si=cQmFUHC40DawQPqS"
                title={t("codingApp.tutorialVideoTitle")}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </CardContent>
        </Card>
        </div>
      </section>

        {/* Getting Started Steps */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Başlarken</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t("codingApp.tutorialDesc")}</p>
          </div>
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-white/10 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
            <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("codingApp.steps.0.title")}</h3>
              <p className="text-slate-300">
              {t("codingApp.steps.0.desc")}
            </p>
          </Card>
            <Card className="text-center p-8 bg-white/10 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
            <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("codingApp.steps.1.title")}</h3>
              <p className="text-slate-300">
              {t("codingApp.steps.1.desc")}
            </p>
          </Card>
            <Card className="text-center p-8 bg-white/10 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
            <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("codingApp.steps.2.title")}</h3>
              <p className="text-slate-300">
              {t("codingApp.steps.2.desc")}
            </p>
          </Card>
        </div>
      </div>
      </section>
    </div>
  );
}
