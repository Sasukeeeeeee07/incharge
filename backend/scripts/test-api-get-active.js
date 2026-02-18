require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const testGetActive = async () => {
    try {
        const secret = 'secret'; // fallback
        const userId = '6993ff6b398632f0b2a4be43';
        const token = jwt.sign({ id: userId, role: 'admin' }, secret, { expiresIn: '1h' });

        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/api/quiz/active',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Response Status:', res.statusCode);
                try {
                    const json = JSON.parse(data);
                    // Print structure of first question options
                    if (json.quiz) {
                        const q = json.quiz.questions ? json.quiz.questions[0] : null;
                        if (q) {
                            console.log('Sample Question 1 Options:');
                            console.log(JSON.stringify(q.options, null, 2));
                        } else {
                            console.log('No questions found in quiz object');
                            console.log(JSON.stringify(json.quiz, null, 2));
                        }
                    } else {
                        console.log('No quiz field in response');
                    }
                } catch (e) {
                    console.log('Response is not JSON:', data);
                }
            });
        });

        req.on('error', (e) => {
            console.error('API Error:', e.message);
        });

        req.end();

    } catch (err) {
        console.error('Script Error:', err.message);
    }
};

testGetActive();
