# Netlify SMTP Setup

This project is frontend-only on Netlify, with one Netlify Function for email.

## What Happens

1. The applicant fills the React form.
2. Uploaded documents go to Cloudinary using the unsigned upload preset.
3. The frontend calls `/.netlify/functions/send-application`.
4. The Netlify Function sends the admin email using SMTP.

SMTP credentials stay private because they are not prefixed with `VITE_`.

## Netlify Build Settings

The included `netlify.toml` already sets:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
```

## Required Netlify Environment Variables

In Netlify, open:

Site configuration > Environment variables

Add these:

```env
VITE_WHATSAPP_NUMBER=917878793428
VITE_ADMIN_EMAIL=info@vyasfinserv.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_CLOUDINARY_FOLDER=vyas-finserv/applications

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sender-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Vyas Finserv <your-sender-email@gmail.com>
ADMIN_EMAIL=info@vyasfinserv.com
```

## Gmail SMTP

For Gmail, do not use your normal Gmail password.

1. Enable 2-Step Verification on the Google account.
2. Go to Google Account > Security > App passwords.
3. Create an app password for Mail.
4. Use that generated 16-character password as `SMTP_PASS`.

Recommended Gmail values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sender-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Vyas Finserv <your-sender-email@gmail.com>
```

## Local Testing

The plain Vite dev server does not run Netlify Functions. To test SMTP locally, use Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Run it from the project root. Then open the local Netlify URL it prints.

## Important

Never add SMTP credentials as `VITE_SMTP_*`. Any `VITE_` value is included in the browser bundle and can be seen by users.
