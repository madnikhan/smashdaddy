"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  Send,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log("Contact form submitted:", formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <Link href="/about" className="nav-link-inactive">
                About
              </Link>
              <Link href="/contact" className="nav-link-active">
                Contact
              </Link>
              <Link href="/track" className="nav-link-inactive">
                Track Order
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
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block px-3 py-2 text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/track" 
                  className="block px-3 py-2 text-text hover:text-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Track Order
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
            Contact <span className="text-gradient">SmashDaddy</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Get in touch with us for orders, feedback, or any questions. 
            We&apos;re here to help and always happy to hear from our customers.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">Visit Us</h3>
                    <p className="text-text-secondary">
                      St John&apos;s Square<br />
                      Daventry, NN11 4HY<br />
                      United Kingdom
                    </p>
                  </div>
                </div>

                {/* Map Embed */}
                <div className="mt-6">
                  <iframe
                    title="SmashDaddy Location Map"
                    src="https://www.google.com/maps?q=St+John's+Square,+Daventry,+NN11+4HY,+United+Kingdom&output=embed"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: '0.75rem', width: '100%' }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full rounded-xl border border-secondary/30 shadow-sm"
                  ></iframe>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">Call Us</h3>
                    <p className="text-text-secondary">
                      +44 (0) 1327 123 4567<br />
                      Available during opening hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Mail className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">Email Us</h3>
                    <p className="text-text-secondary">
                      hello@smashdaddy-daventry.co.uk<br />
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">Opening Hours</h3>
                    <div className="text-text-secondary space-y-1">
                      <div>Monday - Thursday: 11:00 - 22:00</div>
                      <div>Friday - Saturday: 11:00 - 23:00</div>
                      <div>Sunday: 12:00 - 21:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-text mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <Link href="#" className="p-3 bg-tertiary rounded-full hover:bg-secondary/20 transition-colors">
                    <Facebook className="h-5 w-5 text-text" />
                  </Link>
                  <Link href="#" className="p-3 bg-tertiary rounded-full hover:bg-secondary/20 transition-colors">
                    <Twitter className="h-5 w-5 text-text" />
                  </Link>
                  <Link href="#" className="p-3 bg-tertiary rounded-full hover:bg-secondary/20 transition-colors">
                    <Instagram className="h-5 w-5 text-text" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-text mb-6">Send us a Message</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                          Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(value) => handleInputChange('name', value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(value) => handleInputChange('email', value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-text mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        placeholder="+44 (0) 123 456 7890"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-text mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(value) => handleInputChange('subject', value)}
                        placeholder="What&apos;s this about?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border bg-tertiary px-3 py-2 text-text placeholder:text-text-secondary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-tertiary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-text-secondary">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Do you deliver to my area?
                </h3>
                <p className="text-text-secondary">
                  We deliver within a 5-mile radius of St John's Square, Daventry. 
                  Delivery takes 20-30 minutes and costs £2.50 (free over £15).
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-text-secondary">
                  For delivery: Card payments only. For collection and takeaway: 
                  Card and cash payments accepted.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Can I customize my order?
                </h3>
                <p className="text-text-secondary">
                  Yes! Our grilled chicken comes with your choice of peri sauce, 
                  and you can add extra toppings to your burgers.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text mb-2">
                  Do you have vegetarian options?
                </h3>
                <p className="text-text-secondary">
                  Absolutely! We offer meat-free classic burgers and veggie patty 
                  burgers, plus plenty of sides and drinks.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready to Order?</h2>
          <p className="text-xl text-primary/80 mb-8">Don't wait - order your favorite SmashDaddy smashed burgers and grilled chicken now!</p>
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