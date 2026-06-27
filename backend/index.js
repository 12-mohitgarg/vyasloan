// Server restarted to pick up new environment configurations
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import ws from 'ws'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { notifyAdmin, confirmCustomer } from './services/whatsapp.js'

dotenv.config()

const app = express()

// Local Uploads Directory configuration
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
const DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}
if (!fs.existsSync(LOCAL_APPLICATIONS_FILE)) {
  fs.writeFileSync(LOCAL_APPLICATIONS_FILE, '[]')
}
const PORT = process.env.PORT || 5000

// Supabase client (used for Storage uploads)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder',
  {
    realtime: {
      transport: ws,
    },
  }
)

// PostgreSQL client pool
const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// Multer for file uploads (memory storage → upload to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPG, PNG, and PDF files are allowed'))
  },
})

const docFields = [
  { name: 'bankStatement', maxCount: 1 },
  { name: 'paySlips', maxCount: 1 },
  { name: 'form16', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key']
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Upload file to local uploads directory
async function uploadFile(file, folder, applicantId) {
  if (!file) return null
  try {
    const ext = path.extname(file.originalname) || ''
    const safeId = String(applicantId).replace(/[^a-zA-Z0-9-]/g, '')
    const fileName = `${safeId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`
    const folderDir = path.join(UPLOADS_DIR, folder)
    
    if (!fs.existsSync(folderDir)) {
      fs.mkdirSync(folderDir, { recursive: true })
    }
    
    const filePath = path.join(folderDir, fileName)
    await fs.promises.writeFile(filePath, file.buffer)
    
    // Return relative URL to serve statically
    return `/uploads/${folder}/${fileName}`
  } catch (err) {
    console.error('Local file upload error:', err)
    return null
  }
}

async function readLocalApplications() {
  try {
    const raw = await fs.promises.readFile(LOCAL_APPLICATIONS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Local application read error:', err)
    return []
  }
}

async function writeLocalApplications(applications) {
  await fs.promises.writeFile(
    LOCAL_APPLICATIONS_FILE,
    JSON.stringify(applications, null, 2)
  )
}

function applicationFromBody(b, id, urls = {}) {
  const now = new Date().toISOString()
  return {
    id,
    full_name: b.fullName,
    mobile: b.mobile,
    personal_email: b.personalEmail,
    mother_name: b.motherName || null,
    residential_address: b.residentialAddress || null,
    employment_type: b.employmentType || null,
    company_name: b.companyName || null,
    company_address: b.companyAddress || null,
    official_email: b.officialEmail || null,
    monthly_salary: b.monthlySalary ? Number(b.monthlySalary) : null,
    years_employed: b.yearsEmployed || null,
    loan_amount: b.loanAmount || null,
    loan_purpose: b.loanPurpose || null,
    ref1_name: b.ref1Name || null,
    ref1_mobile: b.ref1Mobile || null,
    ref1_email: b.ref1Email || null,
    ref2_name: b.ref2Name || null,
    ref2_mobile: b.ref2Mobile || null,
    ref2_email: b.ref2Email || null,
    bank_statement_url: urls.bankStatementUrl || null,
    pay_slips_url: urls.paySlipsUrl || null,
    form16_url: urls.form16Url || null,
    photo_url: urls.photoUrl || null,
    calc_loan_amount: b.calcLoanAmount ? Number(b.calcLoanAmount) : null,
    calc_tenure_months: b.calcTenureMonths ? Number.parseInt(b.calcTenureMonths, 10) : null,
    calc_interest_rate: b.calcInterestRate ? Number(b.calcInterestRate) : null,
    calc_monthly_emi: b.calcMonthlyEMI ? Number(b.calcMonthlyEMI) : null,
    calc_total_payable: b.calcTotalPayable ? Number(b.calcTotalPayable) : null,
    calc_total_interest: b.calcTotalInterest ? Number(b.calcTotalInterest) : null,
    status: 'pending',
    created_at: now,
    updated_at: now,
  }
}

async function saveLocalApplication(application) {
  const applications = await readLocalApplications()
  applications.unshift(application)
  await writeLocalApplications(applications)
}

async function updateLocalApplicationStatus(id, status) {
  const applications = await readLocalApplications()
  const index = applications.findIndex(app => app.id === id)
  if (index === -1) return null
  applications[index] = {
    ...applications[index],
    status,
    updated_at: new Date().toISOString(),
  }
  await writeLocalApplications(applications)
  return applications[index]
}

// POST /api/applications — submit new loan application
app.post('/api/applications', upload.fields(docFields), async (req, res) => {
  let appId = crypto.randomUUID()

  try {
    const b = req.body
    const files = req.files || {}

    const uploadResults = await Promise.all([
      uploadFile(files.bankStatement?.[0], 'bank-statements', appId),
      uploadFile(files.paySlips?.[0], 'pay-slips', appId),
      uploadFile(files.form16?.[0], 'form16', appId),
      uploadFile(files.photo?.[0], 'photos', appId),
    ])

    const [bankStatementUrl, paySlipsUrl, form16Url, photoUrl] = uploadResults
    const urls = { bankStatementUrl, paySlipsUrl, form16Url, photoUrl }
    const localApplication = applicationFromBody(b, appId, urls)

    // Insert application record
    const query = `
      INSERT INTO loan_applications (
        id, full_name, mobile, personal_email, mother_name, residential_address,
        employment_type, company_name, company_address, official_email,
        monthly_salary, years_employed, loan_amount, loan_purpose,
        ref1_name, ref1_mobile, ref1_email, ref2_name, ref2_mobile, ref2_email,
        bank_statement_url, pay_slips_url, form16_url, photo_url,
        calc_loan_amount, calc_tenure_months, calc_interest_rate, calc_monthly_emi,
        calc_total_payable, calc_total_interest, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, 'pending'
      ) RETURNING *
    `
    const values = [
      appId,
      b.fullName, b.mobile, b.personalEmail, b.motherName || null, b.residentialAddress || null,
      b.employmentType || null, b.companyName || null, b.companyAddress || null, b.officialEmail || null,
      b.monthlySalary ? parseFloat(b.monthlySalary) : null, b.yearsEmployed || null, b.loanAmount || null, b.loanPurpose || null,
      b.ref1Name || null, b.ref1Mobile || null, b.ref1Email || null, b.ref2Name || null, b.ref2Mobile || null, b.ref2Email || null,
      bankStatementUrl, paySlipsUrl, form16Url, photoUrl,
      b.calcLoanAmount ? parseFloat(b.calcLoanAmount) : null,
      b.calcTenureMonths ? parseInt(b.calcTenureMonths) : null,
      b.calcInterestRate ? parseFloat(b.calcInterestRate) : null,
      b.calcMonthlyEMI ? parseFloat(b.calcMonthlyEMI) : null,
      b.calcTotalPayable ? parseFloat(b.calcTotalPayable) : null,
      b.calcTotalInterest ? parseFloat(b.calcTotalInterest) : null
    ]

    let appData = localApplication
    let storage = 'local'
    try {
      const result = await pool.query(query, values)
      appData = result.rows[0]
      storage = 'database'
    } catch (dbErr) {
      console.error('Database unavailable, saved application locally:', dbErr.message)
      await saveLocalApplication(localApplication)
    }

    // Respond immediately — never block the user waiting for WhatsApp
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: appId, storage },
    })

    // Fire WhatsApp messages in background — fully isolated, each wrapped separately
    const fullApp = { ...appData, bank_statement_url: bankStatementUrl, pay_slips_url: paySlipsUrl }

    const safeNotifyAdmin = async () => {
      try {
        await notifyAdmin(fullApp)
        console.log(`✅ Admin WhatsApp sent for ${appId}`)
      } catch (e) {
        console.error(`⚠️  Admin WhatsApp failed for ${appId}:`, e.message)
        // Could write to a retry queue here in future
      }
    }

    const safeConfirmCustomer = async () => {
      try {
        await confirmCustomer(fullApp)
        console.log(`✅ Customer WhatsApp sent to ${fullApp.mobile}`)
      } catch (e) {
        console.error(`⚠️  Customer WhatsApp failed for ${fullApp.mobile}:`, e.message)
      }
    }

    // Run independently — one failure doesn't cancel the other
    safeNotifyAdmin()
    safeConfirmCustomer()

  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    })
  }
})

// GET /api/applications — list all (admin only)
app.get('/api/applications', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM loan_applications ORDER BY created_at DESC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('Database list unavailable, returning local applications:', err.message)
    const applications = await readLocalApplications()
    res.json({ success: true, data: applications, storage: 'local' })
  }
})

// GET /api/applications/:id — single application (admin only)
app.get('/api/applications/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM loan_applications WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('Database get unavailable, checking local applications:', err.message)
    const applications = await readLocalApplications()
    const application = applications.find(app => app.id === req.params.id)
    if (!application) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json({ success: true, data: application, storage: 'local' })
  }
})

// PATCH /api/applications/:id — update status (admin only)
app.patch('/api/applications/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'reviewing', 'approved', 'rejected']
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const result = await pool.query(
      'UPDATE loan_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('Database status update unavailable, updating local application:', err.message)
    const updated = await updateLocalApplicationStatus(req.params.id, req.body.status)
    if (!updated) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json({ success: true, data: updated, storage: 'local' })
  }
})

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Vyas Finserv API' }))

app.listen(PORT, () => {
  console.log(`✅ Vyas Finserv API running on http://localhost:${PORT}`)
})
