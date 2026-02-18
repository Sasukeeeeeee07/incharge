const API_URL = 'http://localhost:5001/api/auth';

async function testPasswordUpdate() {
    try {
        console.log('1. Logging in as John (already updated password)...');

        // Login with NEW password
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john@example.com',
                password: 'NewPassword123!'
            })
        });

        if (!loginRes.ok) {
            const errorText = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} ${errorText}`);
        }

        const data = await loginRes.json();
        console.log('Login successful. User:', data.user);

        // Fetch cookies
        const cookieHeader = loginRes.headers.get('set-cookie');
        if (!cookieHeader) {
            throw new Error('No cookies received');
        }
        const cookie = cookieHeader.split(';')[0];

        console.log('2. Attempting to update password AGAIN (should fail 403)...');
        const updateRes = await fetch(`${API_URL}/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                newPassword: 'NewPassword1234!'
            })
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.log(`Expected Failure: ${updateRes.status} ${errorText}`);
        } else {
            const updateData = await updateRes.json();
            console.log('UNEXPECTED SUCCESS:', updateData);
        }

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

testPasswordUpdate();
