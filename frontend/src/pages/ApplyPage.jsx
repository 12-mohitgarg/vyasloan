import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ChevronRight, ChevronLeft, Upload, User, Briefcase, FileText, Users, CheckCircle, Calculator } from 'lucide-react'
import { submitStaticApplication } from '../services/staticSubmission'

const TOTAL_STEPS = 5

const stepTitles = [
  { label: 'Personal Info', icon: User },
  { label: 'Employment', icon: Briefcase },
  { label: 'Documents', icon: FileText },
  { label: 'References', icon: Users },
  { label: 'Review', icon: CheckCircle },
]

function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

export default function ApplyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [allData, setAllData] = useState({})
  const [files, setFiles] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Calculator state lifted here so it's included in submission
  const [calcState, setCalcState] = useState({ amount: 500000, tenure: 36, rate: 12 })
  const calcEMI = useCallback(() => {
    const { amount, tenure, rate } = calcState
    const r = rate / 12 / 100
    if (r === 0) return Math.round(amount / tenure)
    return Math.round((amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1))
  }, [calcState])
  const emiMonthly = calcEMI()

  const { register, formState: { errors }, trigger, getValues, setValue } = useForm({ mode: 'onBlur' })

  // Sync calculator amount back to form field
  useEffect(() => {
    const key = Object.keys(LOAN_AMOUNT_MAP).find(k => LOAN_AMOUNT_MAP[k] === calcState.amount)
    if (key) {
      setValue('loanAmount', key)
    } else {
      setValue('loanAmount', '')
    }
  }, [calcState.amount, setValue])

  const handleLoanAmountChange = (e) => {
    const valStr = e.target.value
    if (valStr) {
      const cleanVal = LOAN_AMOUNT_MAP[valStr]
      if (cleanVal) {
        setCalcState(prev => ({ ...prev, amount: cleanVal }))
      }
    }
  }

  const fieldsByStep = {
    1: ['fullName', 'mobile', 'personalEmail', 'motherName', 'residentialAddress'],
    2: ['companyName', 'companyAddress', 'officialEmail', 'monthlySalary', 'employmentType', 'loanAmount', 'loanPurpose'],
    3: [],
    4: ['ref1Name', 'ref1Mobile', 'ref1Email', 'ref2Name', 'ref2Mobile', 'ref2Email'],
    5: [],
  }

  const handleNext = async () => {
    const fields = fieldsByStep[step]
    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    setAllData(prev => ({ ...prev, ...getValues() }))
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileChange = (key, e) => {
    const file = e.target.files[0]
    if (file) setFiles(prev => ({ ...prev, [key]: file }))
  }

  const handleFinalSubmit = async () => {
    // Run validations for all fields
    const valid = await trigger()
    if (!valid) {
      toast.error('Please fill in all required fields.')
      // Find the first step with errors and jump to it
      for (let s = 1; s <= TOTAL_STEPS; s++) {
        const fields = fieldsByStep[s]
        if (fields.length > 0) {
          const stepValid = await trigger(fields)
          if (!stepValid) {
            setStep(s)
            break
          }
        }
      }
      return
    }

    setSubmitting(true)
    const calcData = {
      calcLoanAmount: calcState.amount,
      calcTenureMonths: calcState.tenure,
      calcInterestRate: calcState.rate,
      calcMonthlyEMI: emiMonthly,
      calcTotalPayable: emiMonthly * calcState.tenure,
      calcTotalInterest: (emiMonthly * calcState.tenure) - calcState.amount,
    }
    const finalData = { ...allData, ...getValues(), ...calcData }

    try {
      const result = await submitStaticApplication(finalData, files)
      toast.success('Application submitted successfully! Admin email sent.')
      navigate('/thank-you', { state: result })
    } catch (err) {
      console.error('Static submission failed:', err)
      toast.error(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="w-full px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-5 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2844] mb-2">Apply for Personal Loan</h1>
          <p className="text-sm sm:text-base text-gray-500">Quick approval · Minimal documents · Best rates</p>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-5 sm:space-y-6">

          <SidebarCalculator calcState={calcState} setCalcState={setCalcState} emiMonthly={emiMonthly} />

        {/* Step Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((s, i) => {
              const n = i + 1
              const Icon = s.icon
              const active = step === n
              const done = step > n
              return (
                <div key={n} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 transition-all ${done ? 'bg-teal-500 text-white' : active ? 'bg-[#0f2844] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-[#0f2844]' : done ? 'text-teal-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full progress-bar transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <FormStep title="Personal Information" subtitle="Tell us about yourself">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name *" error={errors.fullName?.message}>
                  <input {...register('fullName', { required: 'Full name is required' })}
                    placeholder="As per PAN card"
                    className="input-field" />
                </Field>
                <Field label="Mobile Number *" error={errors.mobile?.message}>
                  <input {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter valid 10-digit mobile' } })}
                    placeholder="+91 XXXXX XXXXX" maxLength={10}
                    className="input-field" />
                </Field>
                <Field label="Personal Email ID *" error={errors.personalEmail?.message}>
                  <input {...register('personalEmail', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter valid email' } })}
                    placeholder="you@example.com" type="email"
                    className="input-field" />
                </Field>
                <Field label="Mother's Name *" error={errors.motherName?.message}>
                  <input {...register('motherName', { required: "Mother's name is required" })}
                    placeholder="Mother's full name"
                    className="input-field" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Current Residential Address *" error={errors.residentialAddress?.message}>
                    <textarea {...register('residentialAddress', { required: 'Address is required' })}
                      placeholder="Full address with city, state and PIN"
                      rows={3}
                      className="input-field resize-none" />
                  </Field>
                </div>
              </div>
            </FormStep>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <FormStep title="Employment Details" subtitle="Your work and loan information">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <Field label="Employment Type *" error={errors.employmentType?.message}>
                  <select {...register('employmentType', { required: 'Select employment type' })} className="input-field">
                    <option value="">Select type</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business Owner</option>
                  </select>
                </Field>
                <Field label="Monthly Salary / Income (₹) *" error={errors.monthlySalary?.message}>
                  <input {...register('monthlySalary', { required: 'Salary is required', min: { value: 15000, message: 'Minimum ₹15,000 required' } })}
                    type="number" placeholder="e.g. 50000"
                    className="input-field" />
                </Field>
                <Field label="Company Name *" error={errors.companyName?.message}>
                  <input {...register('companyName', { required: 'Company name is required' })}
                    placeholder="Your employer's name"
                    className="input-field" />
                </Field>
                <Field label="Official Company Email *" error={errors.officialEmail?.message}>
                  <input {...register('officialEmail', { required: 'Official email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter valid email' } })}
                    type="email" placeholder="you@company.com"
                    className="input-field" />
                </Field>
                <Field label="Years at Current Job" error={errors.yearsEmployed?.message}>
                  <select {...register('yearsEmployed')} className="input-field">
                    <option value="">Select</option>
                    {['< 1 year', '1-2 years', '2-5 years', '5+ years'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <div className="md:col-span-2 xl:col-span-3">
                  <Field label="Company Address *" error={errors.companyAddress?.message}>
                    <textarea {...register('companyAddress', { required: 'Company address is required' })}
                      placeholder="Full company address"
                      rows={2} className="input-field resize-none" />
                  </Field>
                </div>
                <Field label="Loan Amount Required (₹) *" error={errors.loanAmount?.message}>
                  <select {...register('loanAmount', { required: 'Select loan amount', onChange: handleLoanAmountChange })} className="input-field">
                    <option value="">Select amount</option>
                    {['50,000','1,00,000','2,00,000','3,00,000','5,00,000','7,50,000','10,00,000','15,00,000','20,00,000','25,00,000','50,00,000'].map(a => (
                      <option key={a} value={a}>₹{a}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Loan Purpose *" error={errors.loanPurpose?.message}>
                  <select {...register('loanPurpose', { required: 'Select loan purpose' })} className="input-field">
                    <option value="">Select purpose</option>
                    {['Medical Emergency','Education','Home Renovation','Wedding','Travel','Debt Consolidation','Business','Vehicle Purchase','Other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormStep>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <FormStep title="Upload Documents" subtitle="Securely upload your required documents">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'bankStatement', label: '6 Months Bank Statement', accept: '.pdf,.jpg,.png', note: 'PDF preferred' },
                  { key: 'paySlips', label: 'Latest 3 Months Pay Slips', accept: '.pdf,.jpg,.png', note: 'PDF or image' },
                  { key: 'form16', label: 'Last 2 Year Form 16', accept: '.pdf,.jpg,.png', note: 'Both years in one PDF if possible' },
                  { key: 'photo', label: 'Passport Size Photo', accept: '.jpg,.jpeg,.png', note: 'Clear front-facing photo' },
                ].map(doc => (
                  <FileUploadField
                    key={doc.key}
                    label={doc.label}
                    note={doc.note}
                    accept={doc.accept}
                    file={files[doc.key]}
                    onChange={e => handleFileChange(doc.key, e)}
                  />
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <strong>Note:</strong> You can also send documents via WhatsApp (+91 7878793428) or Email (info@vyasfinserv.com) after submission. Document upload here is optional.
                </div>
              </div>
            </FormStep>
          )}

          {/* Step 4: References */}
          {step === 4 && (
            <FormStep title="Two References" subtitle="Provide 2 personal or professional references">
              <div className="space-y-5 sm:space-y-6">
                {[1, 2].map(n => (
                  <div key={n} className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                    <h4 className="font-semibold text-[#0f2844] mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{n}</div>
                      Reference {n}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label={`Name *`} error={errors[`ref${n}Name`]?.message}>
                        <input {...register(`ref${n}Name`, { required: `Reference ${n} name required` })}
                          placeholder="Full name" className="input-field" />
                      </Field>
                      <Field label="Mobile Number *" error={errors[`ref${n}Mobile`]?.message}>
                        <input {...register(`ref${n}Mobile`, { required: `Reference ${n} mobile required`, pattern: { value: /^\d{10}$/, message: 'Enter valid mobile' } })}
                          placeholder="10-digit mobile" maxLength={10} className="input-field" />
                      </Field>
                      <Field label="Email ID *" error={errors[`ref${n}Email`]?.message}>
                        <input {...register(`ref${n}Email`, { required: `Reference ${n} email required`, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter valid email' } })}
                          type="email" placeholder="email@example.com" className="input-field" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </FormStep>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <FormStep title="Review & Submit" subtitle="Please review your details before submitting">
              <ReviewSection data={{ ...allData, ...getValues() }} />

              {/* EMI Calculator Summary Card */}
              <div className="mt-5 bg-gradient-to-br from-[#0f2844] to-[#1e3a5f] rounded-xl p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 font-bold text-sm mb-4">
                  <Calculator size={16} className="text-teal-400" />
                  EMI Calculator Summary (will be sent to admin)
                </div>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    ['Loan Amount', `₹${fmtINR(calcState.amount)}`],
                    ['Tenure', `${calcState.tenure} months`],
                    ['Interest Rate', `${calcState.rate}% p.a.`],
                    ['Monthly EMI', `₹${fmtINR(emiMonthly)}`],
                    ['Total Payable', `₹${fmtINR(emiMonthly * calcState.tenure)}`],
                    ['Total Interest', `₹${fmtINR((emiMonthly * calcState.tenure) - calcState.amount)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white/10 rounded-lg p-3">
                      <div className="text-teal-300 text-xs mb-0.5">{k}</div>
                      <div className="text-white font-bold text-sm">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3 text-sm text-teal-800">
                  <CheckCircle size={18} className="shrink-0 mt-0.5 text-teal-600" />
                  <div>
                    <strong>After you submit:</strong> Your documents will be uploaded securely, your application details will be emailed to our team, and we will contact you within 24 hours.
                  </div>
                </div>
              </div>
            </FormStep>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-teal-500/30"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle size={18} /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </main>
  )
}

function FormStep({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0f2844]">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

function FileUploadField({ label, note, accept, file, onChange }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-5 hover:border-teal-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-700 text-sm">{label}</p>
          <p className="text-gray-400 text-xs mt-0.5">{note}</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept={accept} onChange={onChange} className="hidden" />
          <div className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${file ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
            <Upload size={14} />
            {file ? file.name.substring(0, 20) + (file.name.length > 20 ? '...' : '') : 'Choose File'}
          </div>
        </label>
      </div>
      {file && (
        <div className="mt-2 flex items-center gap-2 text-xs text-teal-600">
          <CheckCircle size={12} /> {file.name} ({(file.size / 1024).toFixed(0)} KB)
        </div>
      )}
    </div>
  )
}

function ReviewSection({ data }) {
  const sections = [
    {
      title: 'Personal Information',
      fields: [
        ['Full Name', data.fullName],
        ['Mobile', data.mobile],
        ['Personal Email', data.personalEmail],
        ["Mother's Name", data.motherName],
        ['Residential Address', data.residentialAddress],
      ]
    },
    {
      title: 'Employment Details',
      fields: [
        ['Employment Type', data.employmentType],
        ['Company', data.companyName],
        ['Company Address', data.companyAddress],
        ['Official Email', data.officialEmail],
        ['Monthly Salary', data.monthlySalary ? `₹${data.monthlySalary}` : ''],
        ['Years Employed', data.yearsEmployed],
        ['Loan Amount', data.loanAmount ? `₹${data.loanAmount}` : ''],
        ['Loan Purpose', data.loanPurpose],
      ]
    },
    {
      title: 'References',
      fields: [
        ['Ref 1 Name', data.ref1Name],
        ['Ref 1 Mobile', data.ref1Mobile],
        ['Ref 1 Email', data.ref1Email],
        ['Ref 2 Name', data.ref2Name],
        ['Ref 2 Mobile', data.ref2Mobile],
        ['Ref 2 Email', data.ref2Email],
      ]
    }
  ]

  return (
    <div className="space-y-5">
      {sections.map(sec => (
        <div key={sec.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-bold text-[#0f2844] text-sm mb-3 pb-2 border-b border-gray-200">{sec.title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sec.fields.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">{k}</span>
                <span className="text-sm text-gray-700 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Inject the .input-field class via JS
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `.input-field { width:100%; border:1px solid #d1d5db; border-radius:0.5rem; padding:0.75rem 1rem; color:#1f2937; background:white; transition:all 0.2s; font-size:0.875rem; } .input-field:focus { outline:none; border-color:#0d9488; box-shadow:0 0 0 3px rgba(13,148,136,0.1); }`
  document.head.appendChild(style)
}

// ─── Sidebar EMI Calculator ───────────────────────────────────────────────────

const LOAN_AMOUNT_MAP = {
  '50,000': 50000,
  '1,00,000': 100000,
  '2,00,000': 200000,
  '3,00,000': 300000,
  '5,00,000': 500000,
  '7,50,000': 750000,
  '10,00,000': 1000000,
  '15,00,000': 1500000,
  '20,00,000': 2000000,
  '25,00,000': 2500000,
  '50,00,000': 5000000,
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

function SidebarCalculator({ calcState, setCalcState, emiMonthly }) {
  const [open, setOpen] = useState(false)
  const { amount, tenure, rate } = calcState

  const set = (key) => (e) => setCalcState(prev => ({ ...prev, [key]: +e.target.value }))

  const totalPayable = Math.round(emiMonthly * tenure)
  const totalInterest = totalPayable - amount
  const principalPct = Math.round((amount / totalPayable) * 100)

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 bg-gradient-to-r from-[#0f2844] to-[#1e3a5f] text-white"
      >
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base min-w-0">
          <Calculator size={18} className="text-teal-400" />
          EMI Calculator
        </div>
        <div className="flex items-center justify-end gap-2 min-w-0">
          <span className="hidden min-[420px]:inline text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full font-medium">Saved to application</span>
          <span className="text-teal-300 text-xl leading-none">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 sm:p-5 space-y-5">

          {/* EMI result */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-center text-white">
            <p className="text-teal-100 text-xs font-medium mb-1">Monthly EMI</p>
            <p className="text-3xl font-extrabold">₹{fmt(emiMonthly)}</p>
            <p className="text-teal-100 text-xs mt-1">per month · sent to admin on submit</p>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-600">Loan Amount</span>
                <span className="font-bold text-teal-600">₹{fmt(amount)}</span>
              </div>
              <input type="range" min={50000} max={5000000} step={50000}
                value={amount} onChange={set('amount')}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹50K</span><span>₹50L</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-600">Tenure</span>
                <span className="font-bold text-teal-600">{tenure} months</span>
              </div>
              <input type="range" min={6} max={84} step={6}
                value={tenure} onChange={set('tenure')}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>6 mo</span><span>84 mo</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-600">Interest Rate</span>
                <span className="font-bold text-teal-600">{rate}% p.a.</span>
              </div>
              <input type="range" min={8} max={24} step={0.5}
                value={rate} onChange={set('rate')}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>8%</span><span>24%</span>
              </div>
            </div>
          </div>

          {/* Donut visual */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] gap-5 items-center">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 36 36" className="w-20 h-20 shrink-0 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0d9488" strokeWidth="4"
                  strokeDasharray={`${principalPct} ${100 - principalPct}`} strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="4"
                  strokeDasharray={`${100 - principalPct} ${principalPct}`}
                  strokeDashoffset={`-${principalPct}`} strokeLinecap="round" />
              </svg>
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /><span className="text-gray-500">Principal</span></div>
                  <span className="font-bold text-gray-700">₹{fmt(amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-gray-500">Interest</span></div>
                  <span className="font-bold text-gray-700">₹{fmt(totalInterest)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-extrabold text-teal-700">₹{fmt(totalPayable)}</span>
                </div>
              </div>
            </div>

            {/* Quick presets */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">Quick Select Amount</p>
              <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-1.5">
                {['1,00,000','3,00,000','5,00,000','10,00,000','20,00,000','50,00,000'].map(a => (
                  <button key={a}
                    onClick={() => setCalcState(prev => ({ ...prev, amount: LOAN_AMOUNT_MAP[a] }))}
                    className={`text-xs py-1.5 rounded-lg font-semibold transition-all ${amount === LOAN_AMOUNT_MAP[a] ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'}`}>
                    ₹{a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
