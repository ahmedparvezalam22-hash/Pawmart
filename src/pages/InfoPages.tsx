import React, { useEffect, useState } from 'react';
import { Link } from '../utils/navigation';
import { ChevronRight, ShieldCheck, Mail, CheckCircle2, Copy, Check, Send, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us — PawMart';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800">About Us</span>
        </nav>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About PawMart
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            PawMart is an independent product discovery platform dedicated to uncovering and recommending high quality products for cats, dogs, lifestyle fashion, and book lovers.
          </p>
          <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
            <p>
              We believe online shopping shouldn't be an overwhelming maze of sponsored ads and low-grade knockoffs. Our team curates genuine, practical, and enduring products available on Amazon, cutting through the clutter so you can make confident choices.
            </p>
            <p>
              PawMart does not sell products directly or process payments on this website. When you find an item you love, clicking <strong>VIEW AMAZON</strong> transfers you directly to the verified product page on Amazon, where you can complete your order with standard Amazon shipping and return guarantees.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-amber-600 font-bold text-sm block mb-1">Curation First</span>
              <p className="text-xs text-slate-500">Every item is chosen for durability, verified reviews, and real-world usefulness.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-amber-600 font-bold text-sm block mb-1">Transparent Pricing</span>
              <p className="text-xs text-slate-500">We never inflate prices or hide fees. Amazon handles full fulfillment.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-amber-600 font-bold text-sm block mb-1">Seamless Experience</span>
              <p className="text-xs text-slate-500">Fast, distraction-free discovery with cross-device personal wishlists.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const supportEmail = 'supportpawmart@gmail.com';

  useEffect(() => {
    document.title = 'Contact Us — PawMart';
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(formSubject.trim() || 'Inquiry from PawMart Visitor');
    const body = encodeURIComponent(
      `Hello PawMart Support Team,\n\nName: ${formName}\nEmail: ${formEmail}\n\nMessage:\n${formMessage}\n\nSent from PawMart Contact Page`
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800">Contact</span>
        </nav>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with PawMart
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed mt-2">
              Have questions about a curated product, partnership suggestions, or recommendation feedback? We're here to help.
            </p>
          </div>

          {/* Primary Email Card */}
          <div className="p-6 bg-amber-50/60 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Official Support & Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click below to open your email app with our address automatically in the "To:" field.
                </p>
                <a
                  href={`mailto:${supportEmail}?subject=PawMart%20Support%20Inquiry`}
                  className="text-base font-black text-amber-700 hover:text-amber-800 hover:underline mt-1.5 inline-flex items-center gap-1.5"
                  title="Click to email supportpawmart@gmail.com"
                >
                  <span>{supportEmail}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-slate-800 hover:bg-amber-100/50 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${supportEmail}?subject=PawMart%20Support%20Inquiry`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Compose Mail</span>
              </a>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-slate-900">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500">
              Fill in your details below and click "Send Email". Your email client will open with all details prefilled directly to <span className="font-bold text-slate-800">{supportEmail}</span>.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Alex Taylor"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Product Question / Partnership Inquiry"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="How can we help you? Feel free to ask about any product or topic..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email to supportpawmart@gmail.com</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — PawMart';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6 text-sm text-slate-600 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>
          <p>
            At PawMart, your privacy is fundamental to our service. This Privacy Policy details what information we collect, how it is used, and how your data is protected.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">1. Information We Collect</h3>
          <p>
            When you register an account, we collect your name and email address through Firebase Authentication. If you save products to Favorites, these preferences are stored securely in your private user profile in Cloud Firestore.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">2. Third-Party Links & Amazon</h3>
          <p>
            Our website contains outbound links to Amazon.com. When you navigate to Amazon, their privacy policy and terms apply. PawMart does not collect, view, or process your credit card numbers, billing addresses, or payment credentials.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">3. Data Retention</h3>
          <p>
            You may request deletion of your account and wishlist data at any time by contacting our support desk at <a href="mailto:supportpawmart@gmail.com" className="text-amber-600 hover:underline font-bold">supportpawmart@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Use — PawMart';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6 text-sm text-slate-600 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-slate-400">Last updated: 2026</p>
          <p>
            Welcome to PawMart. By accessing or using our product discovery website, you agree to comply with and be bound by the following Terms of Use.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">1. Nature of the Service</h3>
          <p>
            PawMart is a curated product discovery engine. PawMart is not an online store, seller, or marketplace. All transactions occur on Amazon.com, and customer support for product shipment, returns, or refunds must be directed to Amazon.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">2. Accuracy of Information</h3>
          <p>
            While we strive for accurate descriptions, product details and availability may change at any time on Amazon.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DisclosurePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Store Disclosure — PawMart';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Amazon Partner Disclosure
          </h1>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 font-semibold text-sm">
            PawMart is a participant in the Amazon Services LLC Associates Program, a partner advertising program designed to provide a means for sites to earn fees by advertising and linking to Amazon.com.
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-6">How Our Product Links Work</h3>
          <p>
            When you click on the <strong>VIEW AMAZON</strong> button on any product card or details page, you are directed to Amazon through a verified referral link. If you decide to make a purchase, we may earn a small referral commission at no additional cost to you.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-6">Product Pricing and Availability</h3>
          <p>
            Prices and availability for Amazon products are accurate at the time of publication and are subject to change by Amazon and third-party sellers. Any price and availability information displayed on Amazon at the time of purchase will govern the purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export const AffiliateDisclosurePage = DisclosurePage;

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Page Not Found — PawMart';
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 font-extrabold text-2xl">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm max-w-md mb-8">
        The page you are looking for doesn't exist or has moved. Explore our latest discoveries instead!
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
      >
        Back to Home
      </Link>
    </div>
  );
};
