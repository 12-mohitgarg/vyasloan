import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, TrendingUp } from 'lucide-react'

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

export default function LoanCalculator() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(500000)
  const [tenure, setTenure] = useState(36)
  const [rate, setRate] = useState(12)

  const calcEMI = useCallback(() => {
    const p = amount
    const r = rate / 12 / 100
    const n = tenure
    if (r === 0) return p / n
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [amount, tenure, rate])

  const emi = calcEMI()
  const totalPayable = emi * tenure
  const totalInterest = totalPayable - amount
  const principalPct = Math.round((amount / totalPayable) * 100)
  const interestPct = 100 - principalPct

  return (
    <section id="calculator" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Calculator size={16} />
            Loan Calculator
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f2844] mb-3">
            Calculate Your EMI
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Find out your monthly installment instantly
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Sliders */}
            <div className="p-8 lg:p-10 space-y-8">
              {/* Loan Amount */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-gray-700 font-semibold">Loan Amount</label>
                  <span className="text-teal-600 font-bold text-lg">₹{formatINR(amount)}</span>
                </div>
                <input
                  type="range" min={50000} max={5000000} step={10000}
                  value={amount} onChange={e => setAmount(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹50K</span><span>₹50L</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-gray-700 font-semibold">Loan Tenure</label>
                  <span className="text-teal-600 font-bold text-lg">{tenure} Months</span>
                </div>
                <input
                  type="range" min={6} max={84} step={6}
                  value={tenure} onChange={e => setTenure(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>6 Mo</span><span>84 Mo</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-gray-700 font-semibold">Interest Rate (p.a.)</label>
                  <span className="text-teal-600 font-bold text-lg">{rate}%</span>
                </div>
                <input
                  type="range" min={8} max={24} step={0.5}
                  value={rate} onChange={e => setRate(+e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>8%</span><span>24%</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/apply')}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-teal-500/30 text-lg"
              >
                Apply for This Loan →
              </button>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-[#0f2844] to-[#1e3a5f] p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="text-center mb-8">
                  <p className="text-teal-300 text-sm font-medium mb-2">Your Monthly EMI</p>
                  <div className="text-5xl font-bold text-white mb-1">
                    ₹{formatINR(Math.round(emi))}
                  </div>
                  <p className="text-gray-400 text-sm">per month</p>
                </div>

                {/* Pie chart visual */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e3a5f" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0d9488" strokeWidth="3.5"
                        strokeDasharray={`${principalPct} ${interestPct}`} strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f59e0b" strokeWidth="3.5"
                        strokeDasharray={`${interestPct} ${principalPct}`}
                        strokeDashoffset={`-${principalPct}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <TrendingUp size={20} className="text-teal-400" />
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {[
                    { label: 'Principal Amount', value: `₹${formatINR(amount)}`, color: 'bg-teal-500' },
                    { label: 'Total Interest', value: `₹${formatINR(Math.round(totalInterest))}`, color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-gray-300 text-sm">{item.label}</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <span className="text-gray-300 text-sm font-medium">Total Payable</span>
                    <span className="text-teal-300 font-bold">₹{formatINR(Math.round(totalPayable))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
