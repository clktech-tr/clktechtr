import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export function Footer() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    const base = !raw || raw === "undefined" ? "" : raw; // fall back to same-origin
    fetch(`${base}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <footer className="clk-bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/clklogo_1752565795957.png" alt="CLKtech Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">CLKtech</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t("footer.companyInfo", "Advanced robotics solutions for education and professional development.")}
            </p>
            <div className="flex space-x-4">
              <a href={settings.facebook || "https://facebook.com/"} className="footer-link" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-6 h-6" />
              </a>
              <a href={settings.twitter || "https://twitter.com/"} className="footer-link" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-6 h-6" />
              </a>
              <a href={settings.instagram || "https://instagram.com/"} className="footer-link" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-6 h-6" />
              </a>
              <a href={settings.youtube || "https://youtube.com/"} className="footer-link" target="_blank" rel="noopener noreferrer">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.products")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products/1" className="footer-link">LineX Controller</Link></li>
              <li><Link to="/products/2" className="footer-link">MazeX Controller</Link></li>
              <li><Link to="/products/3" className="footer-link">VivianX Controller</Link></li>
              <li><Link to="/products" className="footer-link">{t("footer.allProducts")}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/docs" className="footer-link">{t("footer.documentation")}</Link></li>
              <li><Link to="/tutorials" className="footer-link">{t("footer.tutorials")}</Link></li>
              <li><Link to="/community" className="footer-link">{t("footer.community")}</Link></li>
              <li><Link to="/contact" className="footer-link">Teknik Destek</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="footer-link">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/contact" className="footer-link">{t("footer.contact")}</Link></li>
              <li><Link to="/privacy-policy" className="footer-link">{t("footer.privacyPolicy")}</Link></li>
              <li><Link to="/terms-of-service" className="footer-link">{t("footer.termsOfService")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 CLKtech. {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
