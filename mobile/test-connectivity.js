// Test script to verify backend connectivity
// Usage:
//   BACKEND_URL=http://192.168.1.10:3000 node test-connectivity.js
// Defaults to localhost when BACKEND_URL is not set.

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

const testBackendConnection = async () => {
    try {
        console.log('Testing backend connection...');
        const response = await fetch(`${backendUrl}/health`);
        const data = await response.json();
        console.log('✅ Backend connected successfully:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        console.log('Troubleshooting steps:');
        console.log('1. Ensure your device and computer are on the same WiFi');
        console.log('2. Check if firewall is blocking port 3000');
        console.log('3. Verify backend is running on your computer');
        console.log(`4. Try accessing ${backendUrl}/health in your device browser`);
        return false;
    }
};

// Auto-run the test
testBackendConnection();
