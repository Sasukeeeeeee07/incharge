require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const testApiSubmit = async () => {
    try {
        const secret = 'secret'; // Try default fallback
        const userId = '6993ff6b398632f0b2a4be43'; // Admin user ID
        const token = jwt.sign({ id: userId, role: 'admin' }, secret, { expiresIn: '1h' });

        const payload = JSON.stringify({
            quizId: '6993ff6b398632f0b2a4be48',
            responses: [
                { questionId: '6993ff6b398632f0b2a4be49', answerType: 'In-Charge' },
                { questionId: '6993ff6b398632f0b2a4be4a', answerType: null }
            ],
            language: 'english'
        });

        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/api/quiz/submit',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length,
                'Authorization': `Bearer ${token}`
            }
        };

        console.log('Sending Payload:', payload);

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Response Status:', res.statusCode);
                console.log('Response Data:', data);
            });
        });

        req.on('error', (e) => {
            console.error('API Error:', e.message);
        });

        req.write(payload);
        req.end();

    } catch (err) {
        console.error('Script Error:', err.message);
    }
};

testApiSubmit();
