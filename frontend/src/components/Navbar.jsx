import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Personal Loan', href: '/#loans' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'Documents', href: '/#documents' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (href) => {
    setOpen(false)
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.querySelector(href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        document.querySelector(href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f2844] shadow-2xl' : 'bg-[#0f2844]/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:bg-teal-400 transition-colors">
              VF
            </div>
            <div>
              <div className="text-white font-bold text-xl leading-tight tracking-wide">
                VYAS <span className="text-teal-400">FINSERV</span>
              </div>
              <div className="text-teal-300 text-xs font-medium tracking-widest">WE HELP YOU GROW</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="text-gray-300 hover:text-teal-400 font-medium text-sm transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-200" />
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+917878793428" className="flex items-center gap-2 text-teal-300 hover:text-teal-200 text-sm font-medium transition-colors">
              <Phone size={16} />
              +91 7878793428
            </a>
            <button
              onClick={() => navigate('/apply')}
              className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-teal-500/30 text-sm"
            >
              Apply Now
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0f2844] border-t border-white/10 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left text-gray-300 hover:text-teal-400 font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <a href="tel:+917878793428" className="flex items-center gap-2 text-teal-300 py-2.5 px-3">
              <Phone size={16} /> +91 7878793428
            </a>
            <button
              onClick={() => { navigate('/apply'); setOpen(false) }}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
