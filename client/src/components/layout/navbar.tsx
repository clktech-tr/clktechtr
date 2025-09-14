import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: t("navbar.home") },
    { path: "/products", label: t("navbar.products") },
    { path: "/coding-app", label: t("navbar.codingApp") },
    { path: "/about", label: t("navbar.about") },
    { path: "/contact", label: t("navbar.contact") },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/clklogo_1752565795957.png" alt="CLKtech Logo" className="h-20 w-20 min-h-[80px] min-w-[80px] flex-shrink-0 mr-0" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link font-medium px-4 py-2 transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-clip-text text-transparent bg-gradient-to-r from-[#f59e42] to-[#34d399]"
                    : "text-gray-700 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[#f59e42] hover:to-[#34d399]"
                }`}
                style={isActive(item.path) ? { pointerEvents: 'none' } : {}}
              >
                {item.label}
              </Link>
            ))}
            {/* Dil seçici */}
            <select
              className="ml-4 border rounded px-2 py-1 text-sm"
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-3 font-medium px-4 transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-clip-text text-transparent bg-gradient-to-r from-[#f59e42] to-[#34d399]"
                    : "text-gray-700 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[#f59e42] hover:to-[#34d399]"
                }`}
                style={isActive(item.path) ? { pointerEvents: 'none' } : {}}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobilde de dil seçici */}
            <select
              className="mt-2 border rounded px-2 py-1 text-sm w-full"
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
}
