import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: Integration status
  app.get('/api/email-status', (_req, res) => {
    const apiKey = process.env.RESEND_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('MY_RESEND_API_KEY'));

    res.json({
      configured: isConfigured,
      provider: isConfigured ? 'resend_api' : 'simulator',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'Maatram Connect <onboarding@resend.dev>',
      maskedKey: isConfigured ? `${apiKey!.trim().slice(0, 6)}...${apiKey!.trim().slice(-4)}` : null,
      message: isConfigured
        ? 'Resend API is connected and ready to deliver live emails.'
        : 'RESEND_API_KEY not configured. Outbound emails will use client-assisted dispatch (Gmail / mailto) or simulator.',
    });
  });

  // API Route: Send Email
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, text, recipientName, templateType } = req.body;

      if (!to || !subject) {
        return res.status(400).json({
          success: false,
          error: 'Recipient email ("to") and "subject" are required.',
        });
      }

      const apiKey = process.env.RESEND_API_KEY;
      const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('MY_RESEND_API_KEY'));

      if (!isConfigured) {
        console.warn(`[Maatram Email] RESEND_API_KEY is not configured. Simulating dispatch for: ${to}`);
        return res.json({
          success: true,
          configured: false,
          provider: 'simulator',
          simulated: true,
          to,
          subject,
          message: `Email prepared for ${to}. Note: RESEND_API_KEY is not configured in .env. Live sending will use direct mail client (Gmail/mailto).`,
        });
      }

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Maatram Connect <onboarding@resend.dev>';

      const payload: Record<string, any> = {
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text || subject}</p>`,
      };
      if (text) {
        payload.text = text;
      }

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey!.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resendData = await resendResponse.json() as any;

      if (!resendResponse.ok) {
        console.error('[Resend API Error]', resendData);
        return res.status(resendResponse.status).json({
          success: false,
          configured: true,
          provider: 'resend_api',
          error: resendData?.message || resendData?.error || 'Failed to dispatch email via Resend API.',
          details: resendData,
        });
      }

      console.log(`[Resend API Success] Email sent to ${to}, ID: ${resendData.id}`);
      return res.json({
        success: true,
        configured: true,
        provider: 'resend_api',
        messageId: resendData.id,
        to,
        subject,
        message: `Real email successfully dispatched to ${to} via Resend API (ID: ${resendData.id}).`,
      });
    } catch (err: any) {
      console.error('[Send Email Exception]', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while processing email dispatch.',
      });
    }
  });

  // Dev server or Production static serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maatram Connect server listening at http://localhost:${PORT}`);
  });
}

startServer();
