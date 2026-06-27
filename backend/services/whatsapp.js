import twilio from 'twilio'

const TWILIO_CONFIGURED =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_WHATSAPP_FROM &&
  !process.env.TWILIO_ACCOUNT_SID.startsWith('your_')

let client = null
if (TWILIO_CONFIGURED) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
} else {
  console.warn('⚠️  Twilio not configured — WhatsApp messages will be skipped. Fill TWILIO_* in backend/.env')
}

const FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`

function fmt(n) {
  if (!n) return '-'
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

/**
 * Sends WhatsApp notification to admin when a new application is submitted.
 */
export async function notifyAdmin(app) {
  if (!TWILIO_CONFIGURED || !client) return { skipped: true, reason: 'Twilio not configured' }
  const adminNumber = `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}` // e.g. whatsapp:+917878793428

  const body = `🏦 *NEW LOAN APPLICATION - Vyas Finserv*

👤 *Applicant*
• Name: ${app.full_name}
• Mobile: ${app.mobile}
• Email: ${app.personal_email}

💼 *Employment*
• Company: ${app.company_name || '-'}
• Salary: ${app.monthly_salary ? fmt(app.monthly_salary) : '-'}/mo
• Type: ${app.employment_type || '-'}

💰 *Loan Requirement*
• Amount: ${app.loan_amount || '-'}
• Purpose: ${app.loan_purpose || '-'}

📊 *EMI Calculator*
• Calc Amount: ${fmt(app.calc_loan_amount)}
• Tenure: ${app.calc_tenure_months ? app.calc_tenure_months + ' months' : '-'}
• Rate: ${app.calc_interest_rate ? app.calc_interest_rate + '% p.a.' : '-'}
• Monthly EMI: ${fmt(app.calc_monthly_emi)}
• Total Payable: ${fmt(app.calc_total_payable)}

👥 *References*
• ${app.ref1_name || '-'} | ${app.ref1_mobile || '-'}
• ${app.ref2_name || '-'} | ${app.ref2_mobile || '-'}

📋 Action required: Review and contact applicant within 24 hours.`

  return client.messages.create({ from: FROM, to: adminNumber, body })
}

/**
 * Sends WhatsApp confirmation to the customer after they apply.
 */
export async function confirmCustomer(app) {
  if (!TWILIO_CONFIGURED || !client) return { skipped: true, reason: 'Twilio not configured' }
  if (!app.mobile) return { skipped: true, reason: 'No mobile number' }
  const customerNumber = `whatsapp:+91${app.mobile}`

  const body = `✅ *Application Received - Vyas Finserv*

Dear *${app.full_name}*,

Thank you for applying for a Personal Loan with Vyas Finserv! 🎉

📋 *Your Application Summary*
• Loan Amount: ${app.loan_amount || '-'}
• Purpose: ${app.loan_purpose || '-'}
${app.calc_monthly_emi ? `• Estimated EMI: ${fmt(app.calc_monthly_emi)}/month` : ''}

⏳ *What happens next?*
Our team will review your application and contact you within *24 hours*.

📞 For queries, call us: *+91 7878793428*
🌐 Website: www.vyasfinserv.com

_Vyas Finserv — We Help You Grow_ 🌱`

  return client.messages.create({ from: FROM, to: customerNumber, body })
}
