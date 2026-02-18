const API_URL = 'http://localhost:5001/api/auth';

const run = async () => {
    try {
        console.log('1. Logging in as John Doe...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john@example.com',
                password: 'UserPassword123!'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Data:', loginData);

        if (!loginRes.ok) {
            throw new Error('Login failed');
        }

        // Extract cookie
        // Note: Node's fetch might not expose Set-Cookie easily if not using a cookie jar, 
        // but let's check headers.
        // Actually, in Node.js fetch, we can access headers.
        const cookie = loginRes.headers.get('set-cookie');
        console.log('Set-Cookie Header:', cookie);

        if (!cookie) {
            console.warn('WARNING: No Set-Cookie header received! Auth might fail.');
        }

        console.log('First Login Required:', loginData.user.firstLoginRequired);

        console.log('2. Attempting to update password...');
        const updateRes = await fetch(`${API_URL}/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie // Send back the cookie
            },
            body: JSON.stringify({
                newPassword: 'NewSecurePassword123!'
            })
        });

        const updateData = await updateRes.json();
        console.log('Update Status:', updateRes.status);
        console.log('Update Data:', updateData);

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

run();
