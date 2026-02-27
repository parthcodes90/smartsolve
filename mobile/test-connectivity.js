// Test script to verify backend connectivity
// Run this in your browser console on your physical device

const testBackendConnection = async () => {
    try {
        console.log('Testing backend connection...');
        const response = await fetch('http://172.24.71.6:3000/health');
        const data = await response.json();
        console.log('✅ Backend connected successfully:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        console.log('Troubleshooting steps:');
        console.log('1. Ensure your device and computer are on the same WiFi');
        console.log('2. Check if firewall is blocking port 3000');
        console.log('3. Verify backend is running on your computer');
        console.log('4. Try accessing http://172.24.71.6:3000/health in your device browser');
        return false;
    }
};

// Auto-run the test
testBackendConnection();
