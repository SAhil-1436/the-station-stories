import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake 
} from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    inquiryType: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', inquiryType: 'General Inquiry', message: '' });
    }, 6000);
  };

  const whatsappNumber = '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello The Station Stories, I would like to inquire about dining.')}`;

  return (
    <div className="py-12 min-h-screen bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
            {t('brand.name')}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ivory-100">
            {t('contact.title')}
          </h1>
          <p className="text-ivory-200/80 text-sm sm:text-base font-light">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* 2-Column Layout: Details + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Col 1: Contact Details & Authentic Reception Photo */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Hours Card */}
              <div className="p-6 rounded-2xl bg-plum-950/70 border border-gold-500/20 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-ivory-100">
                  {t('contact.hoursTitle')}
                </h3>
                <p className="text-xs text-ivory-200/80 leading-relaxed font-light">
                  {t('contact.hoursVal')}
                </p>
              </div>

              {/* Location Card */}
              <div className="p-6 rounded-2xl bg-plum-950/70 border border-gold-500/20 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-ivory-100">
                  {t('contact.addressTitle')}
                </h3>
                <p className="text-xs text-ivory-200/80 leading-relaxed font-light">
                  {t('contact.addressPlaceholder')}
                </p>
              </div>

              {/* Phone Card */}
              <div className="p-6 rounded-2xl bg-plum-950/70 border border-gold-500/20 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-plum-900 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-ivory-100">
                  {t('contact.phoneTitle')}
                </h3>
                <p className="text-xs text-ivory-200/80 leading-relaxed font-light">
                  {t('contact.phonePlaceholder')}
                </p>
              </div>

              {/* Direct WhatsApp Card */}
              <div className="p-6 rounded-2xl bg-plum-950/70 border border-gold-500/20 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-ivory-100 mt-2.5">
                    {t('contact.whatsappTitle')}
                  </h3>
                  <p className="text-xs text-ivory-200/80 leading-relaxed font-light">
                    Direct instant chat for quick responses.
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:brightness-110 transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t('contact.whatsappButton')}</span>
                </a>
              </div>
            </div>

            {/* Reception Photo Card */}
            <div className="relative rounded-2xl overflow-hidden border border-gold-500/30 shadow-xl bg-plum-950/60 p-2">
              <img
                src="/images/restaurant/reception-counter-front.jpeg"
                alt="The Station Stories Hospitality & Reception Counter"
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-lg bg-plum-950/90 backdrop-blur-md border border-gold-500/20 text-xs text-gold-400 font-mono">
                The Station Stories Hospitality & Reception Desk
              </div>
            </div>
          </div>

          {/* Col 2: Interactive Inquiries Form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-plum-950/80 border border-gold-500/30 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-2xl text-ivory-100">
                  {t('contact.sendInquiry')}
                </h3>
                <p className="text-xs text-ivory-200/70 font-light mt-1">
                  Have questions about menu items, private cabin reservations, or catering? Reach out to our hospitality team.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-green-950/50 border border-green-500/40 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                  <h4 className="font-serif font-bold text-lg text-ivory-100">
                    {t('contact.submittedSuccess')}
                  </h4>
                  <p className="text-xs text-ivory-200/80">
                    Our team will contact you shortly on your provided mobile number.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-ivory-200 mb-1.5">
                      Full Name <span className="text-gold-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('contact.namePlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-plum-900/60 border border-gold-500/30 text-ivory-100 placeholder-ivory-200/40 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-semibold text-ivory-200 mb-1.5">
                      10-Digit Mobile Number <span className="text-gold-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder={t('contact.phoneFieldPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-plum-900/60 border border-gold-500/30 text-ivory-100 placeholder-ivory-200/40 text-sm focus:outline-none focus:border-gold-400 transition-colors font-mono"
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-xs font-semibold text-ivory-200 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={e => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-plum-900/60 border border-gold-500/30 text-ivory-100 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="General Inquiry">General Dining & Menu Inquiry</option>
                      <option value="Private Cabin Reservation">Private Cabin 1, 2, or 3 Reservation</option>
                      <option value="Birthday / Celebration">Birthday / Celebration Booking</option>
                      <option value="Feedback / Suggestions">Customer Feedback / Suggestions</option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-semibold text-ivory-200 mb-1.5">
                      Message / Special Requests
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact.msgPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-plum-900/60 border border-gold-500/30 text-ivory-100 placeholder-ivory-200/40 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-sm font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 active:scale-98 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('contact.submitBtn')}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-plum-900/80 text-[11px] text-ivory-200/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-500" />
              <span>We respect your privacy. Contact details are never shared with third parties.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
