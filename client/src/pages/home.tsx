import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { Cog, Award, Truck, CheckCircle } from "lucide-react";
import type { Product } from "@shared/types";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('${settings?.blockCodeScreenshot1 || "/uploads/robot_selection_interface.png"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                {t("home.heroTitle1", "Eğitsel ")}
                <span style={{ color: '#34d399' }}>{t("home.heroTitle2", "Robotik")}</span> &{" "}
                <span style={{ color: '#f59e42' }}>{t("home.heroTitle3", "Programlama")}</span>{" "}
                {t("home.heroTitle4", "Platformları")}
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed animate-slide-up">
                {t("home.heroDesc", "Professional robotic controllers with visual block programming support. Perfect for education, competitions, and IoT development projects.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                <Button asChild size="lg" className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200">
                  <Link to="/products">{t("home.discoverProducts", "View Products")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white hover:bg-white hover:text-slate-900 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/10 backdrop-blur-sm">
                  <Link to="/contact">{t("home.getQuote", "Get Custom Quote")}</Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block animate-float">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-blue-500/20">
                <div className="aspect-video rounded-lg overflow-hidden mb-4 relative group">
                  <img
                    src={settings?.blockCodeScreenshot2 || "/uploads/VivianX2.gif"}
                    alt="CLK Block Code Arayüzü"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-1 animate-pulse">{t("home.codingAppTitle", "CLK Block Code")}</div>
                  <div className="text-slate-300 text-sm">{t("home.codingAppDescShort", "Advanced robotics platform in action")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("home.whyChoose", "Why Choose CLK Tech?")}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("home.whyChooseDesc", "Educational robotics platforms designed for visual programming, perfect for students, teachers, and robotics enthusiasts.")}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <Cog className="h-8 w-8 text-blue-600 transition-transform group-hover:rotate-180 duration-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t("home.featureCards.1.title", "Visual Programming")}</h3>
                <p className="text-slate-600">{t("home.featureCards.1.desc", "Easy-to-use block programming interface that makes robotics accessible to everyone.")}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
                  <Award className="h-8 w-8 text-emerald-600 transition-transform group-hover:scale-125 duration-300" />
              </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{t("home.featureCards.2.title", "Educational Focus")}</h3>
                <p className="text-slate-600">{t("home.featureCards.2.desc", "Designed specifically for educational environments and robotics competitions.")}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <Truck className="h-8 w-8 text-amber-600 transition-transform group-hover:scale-110 duration-300" />
              </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{t("home.featureCards.3.title", "Complete Platform")}</h3>
                <p className="text-slate-600">{t("home.featureCards.3.desc", "Hardware, software, and educational resources all included in one package.")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("home.productsTitle", "Featured Products")}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("home.productsDesc", "Explore our robotics platforms: LineX for beginners, MazeX for competitions, and VivianX for IoT projects.")}</p>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200">
              <Link to="/products">
                {t("home.viewAllProducts", "View All Products")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Block Code Programming Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">{t("home.visualBlockProgrammingTitle", "Visual Block Programming")}</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {t("home.visualBlockProgrammingDesc", "Our intuitive Block Code interface makes robotics programming accessible to everyone. No complex syntax – just drag, drop, and create!")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src={settings?.blockCodeScreenshot1 || "/uploads/robot_selection_interface.png"} 
                alt="Robot Selection Interface" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.block1Title", "Robot Selection")}</h3>
              <p className="text-slate-300">{t("home.block1Desc", "Choose from MazeX, LineX, and VivianX platforms with one click.")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src={settings?.blockCodeScreenshot2 || "/uploads/block_programming_interface.png"} 
                alt="Real-time Testing" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.block2Title", "Visual Programming")}</h3>
              <p className="text-slate-300">{t("home.block2Desc", "Drag and drop code blocks to create complex robot behaviors.")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <img 
                src={settings?.blockCodeScreenshot2 || "/uploads/real_time_testing.png"} 
                alt="Block Programming Interface" 
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.block3Title", "Real-time Testing")}</h3>
              <p className="text-slate-300">{t("home.block3Desc", "Test your code instantly and see results in real-time console output.")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
