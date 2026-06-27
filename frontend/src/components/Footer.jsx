import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0a1f38] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-lg">VF</div>
              <div>
                <div className="text-white font-bold text-xl">VYAS <span className="text-teal-400">FINSERV</span></div>
                <div className="text-teal-400 text-xs tracking-widest">WE HELP YOU GROW</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted financial partner for quick and easy personal loans. Making your dreams a reality with fast disbursals.
            </p>
            <div className="flex gap-3">
              <a href="https://wa.me/917878793428" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {['Home', 'Personal Loan', 'Loan Calculator', 'Apply Now', 'Contact Us'].map(item => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : item === 'Apply Now' ? '/apply' : `/#${item.toLowerCase().replace(' ','-')}`}
                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-teal-500 rounded-full" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Loan Types */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">Our Services</h3>
            <ul className="space-y-3 text-sm">
              {['Personal Loan', 'Home Loan', 'Business Loan', 'Education Loan', 'Vehicle Loan'].map(item => (
                <li key={item} className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-1 h-1 bg-teal-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:+917878793428" className="flex items-start gap-3 hover:text-teal-400 transition-colors">
                  <Phone size={16} className="mt-0.5 text-teal-500 shrink-0" />
                  +91 7878793428
                </a>
              </li>
              <li>
                <a href="mailto:info@vyasfinserv.com" className="flex items-start gap-3 hover:text-teal-400 transition-colors">
                  <Mail size={16} className="mt-0.5 text-teal-500 shrink-0" />
                  info@vyasfinserv.com
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-teal-500 shrink-0" />
                  <span>Mansarovar, Jaipur, Rajasthan 302018</span>
                </div>
              </li>
              <li>
                <a href="https://www.vyasfinserv.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors">
                  <ExternalLink size={14} />
                  www.vyasfinserv.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2024 Vyas Finserv. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
