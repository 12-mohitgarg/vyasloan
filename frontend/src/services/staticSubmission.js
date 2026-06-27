const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || 'vyas-finserv/applications'

const DOCUMENT_LABELS = {
  bankStatement: '6 Months Bank Statement',
  paySlips: 'Latest 3 Months Pay Slips',
  form16: 'Last 2 Year Form 16',
  photo: 'Passport Size Photo',
}

function requireConfig(value, label) {
  if (!value) {
    throw new Error(`${label} is missing. Add it to frontend/.env before using static submissions.`)
  }
}

function valueOrDash(value) {
  return value === undefined || value === null || value === '' ? '-' : value
}

function formatCurrency(value) {
  if (!value) return '-'
  return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value))}`
}

async function uploadToCloudinary(file, key, applicantName) {
  if (!file) return null

  requireConfig(CLOUDINARY_CLOUD_NAME, 'VITE_CLOUDINARY_CLOUD_NAME')
  requireConfig(CLOUDINARY_UPLOAD_PRESET, 'VITE_CLOUDINARY_UPLOAD_PRESET')

  const uploadData = new FormData()
  uploadData.append('file', file)
  uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  uploadData.append('folder', CLOUDINARY_FOLDER)
  uploadData.append('context', `document=${DOCUMENT_LABELS[key] || key}|applicant=${applicantName || 'Unknown'}`)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: uploadData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cloudinary upload failed for ${DOCUMENT_LABELS[key] || key}: ${message}`)
  }

  const uploaded = await response.json()
  return {
    key,
    label: DOCUMENT_LABELS[key] || key,
    name: file.name,
    type: file.type,
    size: file.size,
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
  }
}

function buildDocumentsText(documents) {
  if (!documents.length) return 'No documents were uploaded with this application.'

  return documents
    .map(doc => `${doc.label}: ${doc.url}`)
    .join('\n')
}

function buildApplicationSummary(data, documents) {
  return [
    'NEW LOAN APPLICATION - Vyas Finserv',
    '',
    'Personal Details',
    `Name: ${valueOrDash(data.fullName)}`,
    `Mobile: ${valueOrDash(data.mobile)}`,
    `Personal Email: ${valueOrDash(data.personalEmail)}`,
    `Mother's Name: ${valueOrDash(data.motherName)}`,
    `Residential Address: ${valueOrDash(data.residentialAddress)}`,
    '',
    'Employment Details',
    `Employment Type: ${valueOrDash(data.employmentType)}`,
    `Company Name: ${valueOrDash(data.companyName)}`,
    `Company Address: ${valueOrDash(data.companyAddress)}`,
    `Official Email: ${valueOrDash(data.officialEmail)}`,
    `Monthly Salary: ${formatCurrency(data.monthlySalary)}`,
    `Years Employed: ${valueOrDash(data.yearsEmployed)}`,
    '',
    'Loan Requirement',
    `Loan Amount Required: ${data.loanAmount ? `Rs. ${data.loanAmount}` : '-'}`,
    `Loan Purpose: ${valueOrDash(data.loanPurpose)}`,
    '',
    'EMI Calculator Summary',
    `Calculated Loan Amount: ${formatCurrency(data.calcLoanAmount)}`,
    `Tenure: ${valueOrDash(data.calcTenureMonths)} months`,
    `Interest Rate: ${valueOrDash(data.calcInterestRate)}% p.a.`,
    `Monthly EMI: ${formatCurrency(data.calcMonthlyEMI)}`,
    `Total Payable: ${formatCurrency(data.calcTotalPayable)}`,
    `Total Interest: ${formatCurrency(data.calcTotalInterest)}`,
    '',
    'References',
    `Ref 1: ${valueOrDash(data.ref1Name)} | ${valueOrDash(data.ref1Mobile)} | ${valueOrDash(data.ref1Email)}`,
    `Ref 2: ${valueOrDash(data.ref2Name)} | ${valueOrDash(data.ref2Mobile)} | ${valueOrDash(data.ref2Email)}`,
    '',
    'Uploaded Documents',
    buildDocumentsText(documents),
  ].join('\n')
}

async function sendAdminEmail(data, documents) {
  const message = buildApplicationSummary(data, documents)
  const response = await fetch('/.netlify/functions/send-application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
      documents,
      message,
      documentsText: buildDocumentsText(documents),
    }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => '')
    let result = null
    try {
      result = raw ? JSON.parse(raw) : null
    } catch {
      result = null
    }

    const detail = result?.error || raw || `HTTP ${response.status}`
    throw new Error(`SMTP email send failed: ${detail}`)
  }
}

export async function submitStaticApplication(data, files) {
  const documents = await Promise.all(
    Object.entries(files).map(([key, file]) => uploadToCloudinary(file, key, data.fullName))
  )

  const uploadedDocuments = documents.filter(Boolean)
  await sendAdminEmail(data, uploadedDocuments)

  return {
    emailOk: true,
    documentCount: uploadedDocuments.length,
    documents: uploadedDocuments,
  }
}
