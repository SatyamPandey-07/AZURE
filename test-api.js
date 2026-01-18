const axios = require('axios');

async function testAPI() {
    try {
        console.log('Testing Cloud-Based Smart Monitoring System API...');
        
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:3000/health');
        console.log('✓ Health check passed:', healthResponse.data.status);
        
        // Test data submission
        console.log('\n2. Testing data submission...');
        const testData = {
            sensorType: 'aqi',
            value: 45.5,
            location: 'Test Location',
            description: 'Test submission'
        };
        
        const submitResponse = await axios.post('http://localhost:3000/api/sensor-data', testData);
        console.log('✓ Data submission successful:', submitResponse.data.message);
        console.log('  Submitted data ID:', submitResponse.data.data.id);
        
        // Test data retrieval
        console.log('\n3. Testing data retrieval...');
        const getResponse = await axios.get('http://localhost:3000/api/sensor-data');
        console.log('✓ Data retrieval successful:', getResponse.data.data.length, 'records found');
        
        console.log('\n🎉 All tests passed! The API is working correctly.');
        console.log('\nYou can now:');
        console.log('- Open your browser to http://localhost:3000 to see the web interface');
        console.log('- Submit sensor data through the form');
        console.log('- View the data in the in-memory storage (for development)');
        console.log('- Deploy to Azure when ready');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAPI();