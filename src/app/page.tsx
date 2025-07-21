"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Utensils, 
  Truck, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram,
  ArrowRight,
  Shield,
  Zap,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gradient cursor-pointer">
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
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-image.jpg"
                            alt="SmashDaddy Smashed Burgers and Grilled Chicken"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-text leading-tight">
                Smashed Burgers
                <span className="block text-gradient">& Grilled Chicken</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
                Premium smashed burgers, grilled chicken, and wings in Daventry. 
                Fresh ingredients, bold flavours, fast service.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/order">
                <Button size="lg" className="text-lg px-8 py-4">
                  Order Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Why Choose <span className="text-gradient">SmashDaddy</span>?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              We&apos;re not just another takeaway. We&apos;re your premium burger and chicken experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Utensils className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Fresh Ingredients
              </h3>
              <p className="text-text-secondary">
                Quality beef, fresh chicken, and locally sourced ingredients for the best taste.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Truck className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Fast Delivery
              </h3>
              <p className="text-text-secondary">
                Quick delivery to your doorstep in Daventry. Hot and fresh, every time.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Quick Collection
              </h3>
              <p className="text-text-secondary">
                Order online and collect from our takeaway in St John&apos;s Square.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Star className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Quality Guaranteed
              </h3>
              <p className="text-text-secondary">
                Every order is prepared fresh to ensure you get the best smashed burgers and grilled chicken.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Secure Payments
              </h3>
              <p className="text-text-secondary">
                Card payments online, or card and cash at our takeaway. Secure and convenient.
              </p>
            </Card>

            <Card className="hover-lift text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                Lightning Fast
              </h3>
              <p className="text-text-secondary">
                Quick preparation and fast service for the best takeaway experience in Daventry.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">100%</div>
              <div className="text-text-secondary">Fresh Beef</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">15min</div>
              <div className="text-text-secondary">Average Wait</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">4.9★</div>
              <div className="text-text-secondary">Customer Rating</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">24/7</div>
              <div className="text-text-secondary">Online Orders</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready for the Best Burgers in Daventry?</h2>
          <p className="text-xl text-primary/80 mb-8">Order online for delivery or collection. Fresh smashed burgers and grilled chicken waiting for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button variant="primary" size="lg" className="text-lg px-8 py-4">
                Order Now
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-secondary">
                View Menu
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
              <p className="text-text-secondary">Premium smashed burgers and grilled chicken takeaway in Daventry. Fresh ingredients, bold flavours.</p>
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
                  <span>St John&apos;s Square, Daventry NN11 4HY</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+44 (0) 1327 123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>hello@stackd-daventry.co.uk</span>
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
          <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary">
            <p>© 2025 SmashDaddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
