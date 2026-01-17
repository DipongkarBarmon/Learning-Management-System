import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, ChevronDown, ChevronUp, Heart, Globe, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-slate-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white to-slate-300">
              We're here for you
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Whether you're stuck on a lesson or just want to say hi, our team is ready to help you succeed.
            </p>

            <div className="mt-10 relative max-w-xl mx-auto">
              <input
                type="text"
                className="block w-full rounded-2xl border-0 py-4 pl-6 pr-14 text-slate-900 shadow-xl ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white/95 backdrop-blur-sm transition-all focus:bg-white"
                placeholder="Search for answers..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 px-2 py-1 font-sans text-xs text-slate-400 bg-slate-50">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meaningful Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-700">
                <Heart className="h-6 w-6 fill-current" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Community First</h2>
            <p className="mt-4 text-lg text-slate-600">
              At LMS ORG, we believe learning is a journey best taken together. Our support isn't just about fixing bugs; it's about ensuring you have the resources and encouragement to reach your goals.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24 -mt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Email */}
          <div className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Email Us</h3>
            <p className="mt-2 text-slate-500 text-center text-sm mb-6">
              Perfect for detailed inquiries. We aim to respond within 24 hours.
            </p>
            <a href="mailto:support@edulearn.com" className="text-indigo-600 font-medium hover:text-indigo-500 flex items-center gap-2">
              support@LMSORG.com
            </a>
          </div>

          {/* Chat */}
          <div className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Live Chat</h3>
            <p className="mt-2 text-slate-500 text-center text-sm mb-6">
              Get instant help from our friendly team during business hours.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8">
              Start Chat
            </Button>
          </div>

          {/* Phone */}
          <div className="group relative flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-14 w-14 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Call Us</h3>
            <p className="mt-2 text-slate-500 text-center text-sm mb-6">
              Speak directly with a human. Mon-Fri, 9am - 6pm EST.
            </p>
            <a href="tel:+1234567890" className="text-cyan-700 font-medium hover:text-cyan-800">
              +1 (234) 567-890
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50 py-24 sm:py-32 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Common Questions</h2>
            <p className="mt-4 text-slate-600">Everything you need to know about the platform.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your email to create a new secure password." },
              { q: "Can I download courses for offline viewing?", a: "Yes! Our mobile app supports offline downloads so you can learn on the go, even without an internet connection." },
              { q: "How do I become an instructor?", a: "We're always looking for experts. Sign up for an account, then navigate to 'Become an Instructor' in your profile settings to start the application process." },
              { q: "What is your refund policy?", a: "We offer a 30-day money-back guarantee on all courses. If you're not satisfied, simply contact support for a full refund." },
              { q: "Do you offer certificates?", a: "Yes, upon completing a course, you will receive a verifiable certificate of completion that you can share on LinkedIn." },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-indigo-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                >
                  <span className="text-base font-semibold text-slate-900">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                <div
                  className={`px-6 text-base text-slate-600 transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Presence */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Global Support</h2>
              <p className="mt-4 text-lg text-slate-600">
                Our team is distributed across 5 continents to ensure we're awake when you are. We speak 12 languages and are dedicated to solving your problems, no matter where you are.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">150+ Countries</p>
                    <p className="text-sm text-slate-500">Learners from all over the world</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">24/7 Availability</p>
                    <p className="text-sm text-slate-500">Always here when you need us</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Support Team"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-semibold text-lg">The A-Team</p>
                <p className="text-sm text-slate-200">Ready to assist you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
