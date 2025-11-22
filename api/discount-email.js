const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.DISCOUNT_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const FROM_EMAIL = process.env.DISCOUNT_FROM_EMAIL || 'no-reply@studytok.app';

function sendJson(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
}

async function sendDiscountEmail({ userEmail, context }) {
    if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY ist nicht gesetzt.');
    }
    if (!ADMIN_EMAIL) {
        throw new Error('DISCOUNT_ADMIN_EMAIL oder ADMIN_EMAIL ist nicht gesetzt.');
    }

    const payload = {
        personalizations: [
            {
                to: [{ email: ADMIN_EMAIL }],
                subject: 'Neue Rabattcode-Anfrage - StudyTok',
            },
        ],
        from: { email: FROM_EMAIL, name: 'StudyTok Companion' },
        reply_to: userEmail ? { email: userEmail } : undefined,
        content: [
            {
                type: 'text/plain',
                value: `Ein Nutzer hat den Rabattcode angefragt.\n\nE-Mail des Nutzers: ${userEmail || 'unbekannt'}\nKontext: ${context || 'keine Angaben'}`,
            },
        ],
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid-Fehler ${response.status}: ${errorText}`);
    }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        sendJson(res, 405, { success: false, message: 'Only POST requests are allowed' });
        return;
    }

    let payload;
    try {
        payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch (error) {
        console.error('Ungültiger JSON-Body erhalten:', error);
        sendJson(res, 400, { success: false, message: 'Ungültiger JSON-Body' });
        return;
    }

    const { userEmail, context } = payload;

    if (!userEmail || typeof userEmail !== 'string') {
        sendJson(res, 400, { success: false, message: 'userEmail ist erforderlich.' });
        return;
    }

    try {
        await sendDiscountEmail({ userEmail, context });
        sendJson(res, 200, { success: true, message: 'E-Mail erfolgreich versendet.' });
    } catch (error) {
        console.error('Versand des Rabattcode-Hinweises fehlgeschlagen:', error);
        sendJson(res, 502, { success: false, message: 'E-Mail-Versand fehlgeschlagen', details: error.message });
    }
};
