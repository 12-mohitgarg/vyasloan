import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Shield, Clock, Zap, Star, ChevronRight, Phone, MessageCircle, ArrowRight, TrendingUp, Award, Headphones } from 'lucide-react'
import LoanCalculator from '../components/LoanCalculator'

const stats = [
  { value: '₹500Cr+', label: 'Loans Disbursed' },
  { value: '50,000+', label: 'Happy Customers' },
  { value: '24 Hrs', label: 'Approval Time' },
  { value: '10.5%', label: 'Starting Rate' },
]

const features = [
  { icon: Zap, title: 'Instant Approval', desc: 'Get loan approval within 24 hours with minimal documentation' },
  { icon: Shield, title: 'Secure & Trusted', desc: 'Your data is safe with us. RBI compliant processes' },
  { icon: Clock, title: 'Quick Disbursal', desc: 'Money in your account within 2-3 business days' },
  { icon: TrendingUp, title: 'Low Interest Rates', desc: 'Competitive rates starting from 10.5% per annum' },
  { icon: Award, title: 'No Hidden Charges', desc: 'Transparent pricing with zero hidden fees or charges' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team available round the clock' },
]

const steps = [
  { step: '01', title: 'Fill Application', desc: 'Complete our simple online application form in minutes' },
  { step: '02', title: 'Upload Documents', desc: 'Submit required documents securely through our portal' },
  { step: '03', title: 'Get Approved', desc: 'Receive instant approval decision within 24 hours' },
  { step: '04', title: 'Get Money', desc: 'Funds directly transferred to your bank account' },
]

const documents = [
  '6 Months Bank Statement',
  'Latest 3 Months Pay Slips',
  'Last 2 Year Form 16',
  'Personal Email ID',
  'Mobile Number',
  'Company Address',
  "Mother's Name",
  'Current Residential Address',
  'Official Company Email ID',
  'Passport Size Photo',
  '2 References (Mobile & Email)',
]

const testimonials = [
  { name: 'Rahul Sharma', city: 'Jaipur', rating: 5, text: 'Got my personal loan approved in just 18 hours! Excellent service and very professional team at Vyas Finserv.' },
  { name: 'Priya Mehta', city: 'Delhi', rating: 5, text: 'The process was smooth and the interest rate was much lower than other banks. Highly recommend!' },
  { name: 'Amit Verma', city: 'Mumbai', rating: 5, text: 'Quick approval, transparent process, and great customer support. Vyas Finserv is the best!' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="pt-16 lg:pt-20">

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden min-h-screen flex items-center">
        {/* Background decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                Easy & Quick Personal Loan
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Your Dreams,{' '}
                <span className="text-teal-400">Our Support</span>
                <br />— Fast Cash When You Need It!
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                Get personal loans up to ₹50 Lakhs with minimal documentation, quick approval, and competitive interest rates. Trusted by 50,000+ customers across India.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => navigate('/apply')}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-xl hover:shadow-teal-500/40"
                >
                  Apply Now <ArrowRight size={20} />
                </button>
                <a
                  href="https://wa.me/917878793428"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-xl hover:shadow-green-500/40"
                >
                  <MessageCircle size={20} />
                  WhatsApp Us
                </a>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['S', 'R', 'P', 'A'].map((l, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-[#0f2844] ${['bg-teal-500','bg-blue-500','bg-purple-500','bg-amber-500'][i]}`}>
                      {l}
                    </div>
                  ))}
                </div>
                <div className="text-gray-300 text-sm">
                  <span className="text-white font-bold">50,000+</span> happy customers
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                    <span className="text-amber-400 font-semibold ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Quick eligibility card */}
            <div className="hidden lg:block">
              <div className="glass-card rounded-3xl p-8 shadow-2xl">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <TrendingUp size={22} className="text-teal-400" />
                  Check Eligibility
                </h3>
                <EligibilityQuickForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-teal-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-teal-100 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="loans" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Award size={16} />
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2844] mb-3">
              Why Vyas Finserv?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We make personal loans simple, fast, and affordable for everyone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon size={24} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-[#0f2844] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMI Calculator */}
      <LoanCalculator />

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <ChevronRight size={16} />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2844] mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Get your loan in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-200">
                  <span className="text-white font-extrabold text-xl">{s.step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5 bg-gradient-to-r from-teal-300 to-gray-200" />
                )}
                <h3 className="font-bold text-[#0f2844] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section id="documents" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <CheckCircle size={16} />
                Required Documents
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f2844] mb-4">
                Documents You'll Need
              </h2>
              <p className="text-gray-500 text-lg mb-8">
                Keep these documents ready for a smooth and quick loan approval process.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map(doc => (
                  <div key={doc} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle size={18} className="text-teal-500 shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0f2844] to-[#1e3a5f] rounded-3xl p-8 text-white">
                <h3 className="font-bold text-2xl mb-2">Submit Documents Via</h3>
                <p className="text-gray-300 mb-6">Choose your preferred method to submit documents</p>
                <div className="space-y-4">
                  <a href="https://wa.me/917878793428" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-4 rounded-xl transition-all">
                    <MessageCircle size={22} />
                    Send via WhatsApp
                    <ArrowRight size={18} className="ml-auto" />
                  </a>
                  <a href="mailto:info@vyasfinserv.com"
                    className="flex items-center gap-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-6 py-4 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send via Email
                    <ArrowRight size={18} className="ml-auto" />
                  </a>
                  <button
                    onClick={() => navigate('/apply')}
                    className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl transition-all border border-white/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Apply Online
                    <ArrowRight size={18} className="ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star size={16} />
              Customer Reviews
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f2844] mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#0f2844] text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="contact" className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Get Your Loan?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Apply now and get approval within 24 hours. Our experts are ready to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/apply')}
              className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-xl hover:shadow-teal-500/30"
            >
              Apply Now <ArrowRight size={20} />
            </button>
            <a href="tel:+917878793428"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all">
              <Phone size={20} /> Call Us Now
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">+91 7878793428 | info@vyasfinserv.com | Mansarovar, Jaipur 302018</p>
        </div>
      </section>
    </main>
  )
}

function EligibilityQuickForm() {
  const navigate = useNavigate()
  const [salary, setSalary] = useState('')
  const [result, setResult] = useState(null)

  const check = () => {
    const s = parseFloat(salary)
    if (!s) return
    const eligible = s >= 15000
    const maxLoan = eligible ? Math.min(s * 30, 5000000) : 0
    setResult({ eligible, maxLoan, salary: s })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Monthly Salary (₹)</label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={salary}
          onChange={e => setSalary(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>
      <button onClick={check}
        className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-lg transition-all">
        Check Eligibility
      </button>
      {result && (
        <div className={`rounded-xl p-4 ${result.eligible ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {result.eligible ? (
            <>
              <div className="text-green-300 font-semibold mb-1">✓ You are Eligible!</div>
              <div className="text-white text-sm">Max loan amount: <strong>₹{new Intl.NumberFormat('en-IN').format(result.maxLoan)}</strong></div>
              <button onClick={() => navigate('/apply')} className="mt-3 w-full bg-white text-teal-700 font-bold py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors">
                Apply Now →
              </button>
            </>
          ) : (
            <div className="text-red-300 text-sm">Minimum salary required is ₹15,000/month. Contact us for more options.</div>
          )}
        </div>
      )}
    </div>
  )
}
