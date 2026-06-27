import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Home, MessageCircle, Phone, AlertCircle, Cloud } from 'lucide-react'

const WA_NUMBER = '917878793428'
const WA_ADMIN_MSG = encodeURIComponent('Hi Vyas Finserv! I just submitted a loan application. Please review it at the earliest.')

export default function ThankYouPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { emailOk = true, documentCount = 0 } = location.state || {}

  return (
    <main className="min-h-screen hero-gradient flex items-center justify-center px-4 pt-20">
      <div className="max-w-lg w-full text-center py-10">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">

          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${emailOk ? 'bg-green-100' : 'bg-amber-100'}`}>
            <CheckCircle size={40} className={emailOk ? 'text-green-500' : 'text-amber-500'} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-[#0f2844] mb-2">
            {emailOk ? 'Application Submitted!' : 'Application Status'}
          </h1>
          <p className="text-gray-500 mb-5">
            Thank you for applying with <strong>Vyas Finserv</strong>.
          </p>

          {/* Status chips */}
          <div className="flex flex-col gap-2 mb-6">
            <StatusRow
              ok={emailOk}
              okText="Application emailed to our admin team"
              failText="Submission Error - Please try again or contact support"
              failNote="If the issue persists, contact us directly"
            />
            {emailOk && documentCount > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-left text-sm bg-blue-50 text-blue-800">
                <Cloud size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{documentCount} document{documentCount === 1 ? '' : 's'} uploaded to Cloudinary</div>
                  <div className="text-xs mt-0.5 opacity-80">Secure view links were included in the admin email.</div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp prompt — show if submission failed */}
          {!emailOk && (
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_ADMIN_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all mb-5 shadow-lg"
            >
              <MessageCircle size={20} />
              Open WhatsApp &amp; Send Details
            </a>
          )}

          {!emailOk && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left text-sm">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Tip:</strong> You can send details via WhatsApp above or email us at <a href="mailto:info@vyasfinserv.com" className="underline">info@vyasfinserv.com</a>.
                </div>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-teal-50 rounded-2xl p-5 mb-6 text-left space-y-3">
            <p className="text-teal-800 font-semibold text-sm">What happens next:</p>
            {[
              'Our team will call you within 24 hours',
              'Keep your documents ready for verification',
              'Track your application status on WhatsApp',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-teal-700">
                <span className="w-5 h-5 bg-teal-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate('/')}
              className="flex items-center justify-center gap-1.5 bg-[#0f2844] hover:bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl transition-all text-sm">
              <Home size={15} /> Home
            </button>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl transition-all text-sm">
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a href="tel:+917878793428"
              className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-all text-sm">
              <Phone size={15} /> Call Us
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatusRow({ ok, okText, failText, failNote }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left text-sm ${ok ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
      {ok
        ? <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
        : <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
      }
      <div>
        <div className="font-semibold">{ok ? okText : failText}</div>
        {!ok && <div className="text-xs mt-0.5 opacity-80">{failNote}</div>}
      </div>
    </div>
  )
}
