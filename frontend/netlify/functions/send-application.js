import nodemailer from 'nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function valueOrDash(value) {
  return value === undefined || value === null || value === '' ? '-' : String(value)
}

function escapeHtml(value) {
  return valueOrDash(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatCurrency(value) {
  if (!value) return '-'
  return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value))}`
}

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`${name} is missing in Netlify environment variables.`)
  }
  return process.env[name]
}

function makeRows(rows) {
  return rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#64748b;width:190px;">${escapeHtml(label)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-weight:600;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('')
}

function makeSection(title, rows) {
  return `
    <h2 style="font-size:16px;color:#0f2844;margin:24px 0 8px;">${escapeHtml(title)}</h2>
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${makeRows(rows)}
    </table>
  `
}

function buildHtml(data, documents) {
  const documentLinks = documents.length
    ? documents.map(doc => `<li><strong>${escapeHtml(doc.label)}:</strong> <a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">${escapeHtml(doc.name || doc.url)}</a></li>`).join('')
    : '<li>No documents were uploaded with this application.</li>'

  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
        <h1 style="margin:0 0 6px;color:#0f2844;font-size:22px;">New Loan Application - Vyas Finserv</h1>
        <p style="margin:0 0 18px;color:#64748b;">Submitted from the Netlify hosted website.</p>

        ${makeSection('Personal Details', [
          ['Name', data.fullName],
          ['Mobile', data.mobile],
          ['Personal Email', data.personalEmail],
          ["Mother's Name", data.motherName],
          ['Residential Address', data.residentialAddress],
        ])}

        ${makeSection('Employment Details', [
          ['Employment Type', data.employmentType],
          ['Company Name', data.companyName],
          ['Company Address', data.companyAddress],
          ['Official Email', data.officialEmail],
          ['Monthly Salary', formatCurrency(data.monthlySalary)],
          ['Years Employed', data.yearsEmployed],
        ])}

        ${makeSection('Loan Requirement', [
          ['Loan Amount Required', data.loanAmount ? `Rs. ${data.loanAmount}` : '-'],
          ['Loan Purpose', data.loanPurpose],
        ])}

        ${makeSection('EMI Calculator Summary', [
          ['Calculated Loan Amount', formatCurrency(data.calcLoanAmount)],
          ['Tenure', `${valueOrDash(data.calcTenureMonths)} months`],
          ['Interest Rate', `${valueOrDash(data.calcInterestRate)}% p.a.`],
          ['Monthly EMI', formatCurrency(data.calcMonthlyEMI)],
          ['Total Payable', formatCurrency(data.calcTotalPayable)],
          ['Total Interest', formatCurrency(data.calcTotalInterest)],
        ])}

        ${makeSection('References', [
          ['Reference 1', `${valueOrDash(data.ref1Name)} | ${valueOrDash(data.ref1Mobile)} | ${valueOrDash(data.ref1Email)}`],
          ['Reference 2', `${valueOrDash(data.ref2Name)} | ${valueOrDash(data.ref2Mobile)} | ${valueOrDash(data.ref2Email)}`],
        ])}

        <h2 style="font-size:16px;color:#0f2844;margin:24px 0 8px;">Uploaded Documents</h2>
        <ul style="line-height:1.8;margin:0;padding-left:20px;">${documentLinks}</ul>
      </div>
    </div>
  `
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const smtpHost = requireEnv('SMTP_HOST')
    const smtpPort = Number(process.env.SMTP_PORT || 465)
    const smtpUser = requireEnv('SMTP_USER')
    const smtpPass = requireEnv('SMTP_PASS')
    const adminEmail = requireEnv('ADMIN_EMAIL')

    const payload = JSON.parse(event.body || '{}')
    const data = payload.data || {}
    const documents = Array.isArray(payload.documents) ? payload.documents : []
    const text = payload.message || 'New loan application submitted.'

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: adminEmail,
      replyTo: data.personalEmail || smtpUser,
      subject: `New Loan Application - ${valueOrDash(data.fullName)}`,
      text,
      html: buildHtml(data, documents),
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('SMTP send failed:', error)
    const code = error.code ? ` (${error.code})` : ''
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `${error.message || 'Unable to send email'}${code}` }),
    }
  }
}
