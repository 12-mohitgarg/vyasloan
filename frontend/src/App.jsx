import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import ApplyPage from './pages/ApplyPage'
import ThankYouPage from './pages/ThankYouPage'
import Navbar from './components/Navbar'
import WhatsAppButton from './components/WhatsAppButton'
import Footer from './components/Footer'

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </Router>
  )
}
