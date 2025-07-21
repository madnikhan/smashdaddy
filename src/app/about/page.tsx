"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Clock,
  Star,
  Heart,
  Award,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-700">
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
              <Link href="/opening-hours" className="nav-link-inactive">
                Opening Hours
              </Link>
              <Link href="/about" className="nav-link-active">
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
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 border-t border-gray-700">
                <Link 
                  href="/menu" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link 
                  href="/opening-hours" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Opening Hours
                </Link>
                <Link 
                  href="/about" 
                  className="block px-3 py-2 text-secondary transition-colors"
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
                <div className="pt-4 pb-2 border-t border-gray-700">
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
            About <span className="text-gradient">SmashDaddy</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Daventry&apos;s premier destination for smashed burgers, grilled chicken, and wings. 
            We&apos;re passionate about quality, flavor, and delivering the best takeaway experience.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  SmashDaddy was born from a simple passion: creating the most delicious smashed burgers 
                  and grilled chicken in Daventry. What started as a dream has become a reality, 
                  serving our community with love and dedication.
                </p>
                <p>
                  Located in the heart of St John&apos;s Square, we&apos;ve been crafting premium burgers 
                  and chicken dishes since 2024. Our commitment to quality ingredients and 
                  authentic flavors has made us a favorite among locals and visitors alike.
                </p>
                <p>
                  Every burger is smashed to perfection, every piece of chicken is flame-grilled 
                  with care, and every order is prepared fresh to ensure you get the best 
                  SmashDaddy experience possible.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-tertiary rounded-xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-text mb-4">Why SmashDaddy?</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-secondary" />
                    <span className="text-text-secondary">Premium quality ingredients</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-secondary" />
                    <span className="text-text-secondary">Fresh preparation every time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-secondary" />
                    <span className="text-text-secondary">Made with love and care</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-secondary" />
                    <span className="text-text-secondary">Award-winning flavors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-tertiary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Our Values
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              The principles that guide everything we do at SmashDaddy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Quality First
              </h3>
              <p className="text-text-secondary">
                We never compromise on quality. Every ingredient is carefully selected 
                to ensure the best taste and freshness.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Community Focus
              </h3>
              <p className="text-text-secondary">
                We&apos;re proud to be part of the Daventry community and strive to give back 
                through great food and excellent service.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Star className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Excellence
              </h3>
              <p className="text-text-secondary">
                From our smashed burgers to our grilled chicken, we pursue excellence 
                in every dish we serve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Opening Hours */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Opening Hours
            </h2>
            <p className="text-xl text-text-secondary">
              Visit us or order online for delivery and collection
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Monday - Thursday</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>Lunch</span>
                    <span>11:00 - 22:00</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Friday - Saturday</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>Lunch & Dinner</span>
                    <span>11:00 - 23:00</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Sunday</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>Lunch & Dinner</span>
                    <span>12:00 - 21:00</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Online Orders</h3>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between">
                    <span>24/7 Ordering</span>
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready to Try SmashDaddy?</h2>
          <p className="text-xl text-primary/80 mb-8">Experience the best smashed burgers and grilled chicken in Daventry.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button variant="primary" size="lg" className="text-lg px-8 py-4">
                View Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-secondary">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient mb-4">SmashDaddy</h3>
              <p className="text-text-secondary">Premium smashed burgers, grilled chicken, and wings in Daventry. Fresh ingredients, bold flavours.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/menu" className="text-text-secondary hover:text-text">Menu</Link></li>
                <li><Link href="/order" className="text-text-secondary hover:text-text">Order Online</Link></li>
                <li><Link href="/about" className="text-text-secondary hover:text-text">About Us</Link></li>
                <li><Link href="/contact" className="text-text-secondary hover:text-text">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Order Types</h4>
              <ul className="space-y-2">
                <li><Link href="/order?type=delivery" className="text-text-secondary hover:text-text">Delivery</Link></li>
                <li><Link href="/order?type=collection" className="text-text-secondary hover:text-text">Collection</Link></li>
                <li><Link href="/order?type=takeaway" className="text-text-secondary hover:text-text">Takeaway</Link></li>
                <li><Link href="/opening-hours" className="text-text-secondary hover:text-text">Opening Hours</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text mb-4">Contact</h4>
              <div className="space-y-2 text-text-secondary">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>St John's Square, Daventry NN11 4HY</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+44 (0) 1327 123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>hello@smashdaddy-daventry.co.uk</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-text-secondary hover:text-secondary">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-text-secondary">
            <p>© 2024 SmashDaddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 