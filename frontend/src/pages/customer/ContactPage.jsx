import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Instagram, 
  Star, 
  ExternalLink 
} from 'lucide-react';
import SectionHeading from '../../components/sections/SectionHeading';
import ScrollReveal from '../../components/animations/ScrollReveal';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    inquiryType: 'General Dining Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', inquiryType: 'General Dining Inquiry', message: '' });
    }, 6000);
  };

  const whatsappNumber = '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello The Station Stories, I would like to inquire about dining and reservations.')}`;

  return (
    <div className="py-12 lg:py-20 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <ScrollReveal>
          <SectionHeading
            badge="Hospitality & Inquiries"
            title={t('contact.title')}
            subtitle={t('contact.subtitle')}
          />
        </ScrollReveal>

        {/* 2-Column Layout: Details + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Col 1: Details & Reception Photo (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <ScrollReveal direction="right">
              <div className="space-y-5">
                {/* Hours Card */}
                <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-soft flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal shrink-0">
                    <Clock className="w-5 h-5 text-plum-royal" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-plum-royal">
                      {t('contact.hoursTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-body-muted font-light mt-0.5">
                      {t('contact.hoursVal')}
                    </p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-soft flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal shrink-0">
                    <MapPin className="w-5 h-5 text-plum-royal" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-plum-royal">
                      {t('contact.addressTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-body-muted font-light mt-0.5">
                      {t('contact.addressPlaceholder')}
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-plum-royal hover:text-gold-700 transition-colors mt-2"
                    >
                      <span>Google Maps Location</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-soft flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal shrink-0">
                    <Phone className="w-5 h-5 text-plum-royal" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-plum-royal">
                      {t('contact.phoneTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-body-muted font-light mt-0.5">
                      {t('contact.phonePlaceholder')}
                    </p>
                  </div>
                </div>

                {/* Direct WhatsApp Card */}
                <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-soft flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-plum-royal">
                        Instant WhatsApp
                      </h3>
                      <p className="text-xs text-body-muted font-light">
                        Direct counter support
                      </p>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#25D366] text-white hover:brightness-105 transition-all shadow-sm"
                  >
                    <span>Chat Now</span>
                  </a>
                </div>
              </div>

              {/* Authentic Reception Desk Photo */}
              <div className="mt-8 rounded-3xl overflow-hidden border border-gold/30 shadow-luxury h-64 bg-plum-dark">
                <img
                  src="/images/restaurant/reception-counter-front.jpeg"
                  alt="The Station Stories Hospitality & Reception Desk"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-center text-xs font-mono text-body-muted">
                Hospitality & Reception Desk at The Station Stories
              </p>
            </ScrollReveal>
          </div>

          {/* Col 2: Interactive Inquiries Form (7 cols) */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="left">
              <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white border border-gold/30 shadow-luxury space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-plum-royal">
                    {t('contact.sendInquiry')}
                  </h3>
                  <p className="text-sm text-body-muted font-light mt-1">
                    Please leave your contact details and message below. Our hospitality team will be in touch shortly.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-8 rounded-2xl bg-lavender-100 border border-gold/40 text-center space-y-3 animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="font-serif font-bold text-2xl text-plum-royal">
                      {t('contact.submittedSuccess')}
                    </h4>
                    <p className="text-sm text-body-muted">
                      Your inquiry has been received. Our team will contact you on your registered mobile number.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-plum-royal mb-1.5">
                        Full Name <span className="text-rose-muted">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('contact.namePlaceholder')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-ivory border border-gold/40 text-body placeholder-body-muted/60 text-sm focus:outline-none focus:border-plum-royal transition-colors shadow-2xs"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-plum-royal mb-1.5">
                        10-Digit Mobile Number <span className="text-rose-muted">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder={t('contact.phoneFieldPlaceholder')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-ivory border border-gold/40 text-body placeholder-body-muted/60 text-sm focus:outline-none focus:border-plum-royal transition-colors shadow-2xs font-mono"
                      />
                    </div>

                    {/* Inquiry Category */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-plum-royal mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl bg-ivory border border-gold/40 text-body text-sm focus:outline-none focus:border-plum-royal transition-colors shadow-2xs"
                      >
                        <option value="General Dining Inquiry">General Dining & Menu Inquiry</option>
                        <option value="Private Cabin Reservation">Private Cabin 1, 2, or 3 Reservation</option>
                        <option value="Birthday & Celebration">Birthday & Group Party Celebration</option>
                        <option value="Feedback / Suggestions">Customer Feedback & Suggestions</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-plum-royal mb-1.5">
                        Message / Special Requests
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.msgPlaceholder')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-ivory border border-gold/40 text-body placeholder-body-muted/60 text-sm focus:outline-none focus:border-plum-royal transition-colors shadow-2xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-full text-sm font-bold bg-plum-royal text-ivory hover:bg-plum-dark active:scale-98 transition-all shadow-luxury flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-gold-300" />
                      <span>{t('contact.submitBtn')}</span>
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
