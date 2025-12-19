
import { Resend } from 'resend';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, html } = req.body;

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("RESEND_API_KEY is not set in server environment.");
        }

        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'Nusion AI <onboarding@resend.dev>', // Use resend.dev for testing unless domain is verified
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return res.status(400).json({ error: error });
        }

        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Email Send Error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
