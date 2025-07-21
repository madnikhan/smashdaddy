"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Menu, X } from "lucide-react";
import Link from "next/link";

export default function OpeningHoursPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gradient">
                  SmashDaddy
                </h1>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/menu" className="nav-link-inactive">
                Menu
              </Link>
              <Link href="/opening-hours" className="nav-link-active">
                Opening Hours
              </Link>
              <Link href="/about" className="nav-link-inactive">
                About
              </Link>
              <Link href="/contact" className="nav-link-inactive">
                Contact
              </Link>
              <Link href="/order" className="nav-link-inactive">
                Order Now
              </Link>
            </div>
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/order">
                <Button variant="primary" size="sm">
                  Order Now
                </Button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-text hover:text-secondary transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 border-t border-border">
                <Link 
                  href="/menu" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>

                <Link 
                  href="/opening-hours" 
                  className="block px-3 py-2 text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Opening Hours
                </Link>
                <Link 
                  href="/about" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/order" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Order Now
                </Link>
                <div className="pt-4 pb-2 border-t border-border">
                  <Link 
                    href="/order"
                    className="block px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Page Header */}
      <div className="pt-16 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-4">
              Opening <span className="text-gradient">Hours</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Find out when SmashDaddy is open for your next burger or chicken fix!
            </p>
          </div>
        </div>
      </div>
      {/* Hours Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-text mb-6 text-center">Regular Opening Times</h2>
            <table className="w-full text-left mb-6">
              <tbody>
                <tr>
                  <td className="py-2 font-semibold text-text">Monday - Friday</td>
                  <td className="py-2 text-text-secondary">11:00 - 22:00</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-text">Saturday</td>
                  <td className="py-2 text-text-secondary">11:00 - 23:00</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-text">Sunday</td>
                  <td className="py-2 text-text-secondary">12:00 - 21:00</td>
                </tr>
              </tbody>
            </table>
            <div className="text-center text-text-secondary text-sm">
              <p>Holiday hours may vary. Please check our social media for updates during bank holidays and festive periods.</p>
            </div>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black/80 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient mb-4">SmashDaddy</h3>
              <p className="text-text-secondary mb-4">
                Premium smashed burgers, grilled chicken, and wings in Daventry.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-text-secondary hover:text-secondary transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/menu" className="text-text-secondary hover:text-secondary transition-colors">
                    Menu
                  </Link>
                </li>

                <li>
                  <Link href="/opening-hours" className="text-text-secondary hover:text-secondary transition-colors">
                    Opening Hours
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-text-secondary hover:text-secondary transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <span className="text-text-secondary">Daventry, England</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-text-secondary">01327 123 456</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span className="text-text-secondary">hello@smashdaddy.co.uk</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-text-secondary">
                <li>Mon-Fri: 11:00 - 22:00</li>
                <li>Saturday: 11:00 - 23:00</li>
                <li>Sunday: 12:00 - 21:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-text-secondary">
              © 2024 SmashDaddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 