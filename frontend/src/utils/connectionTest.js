import api from '../services/api';

/**
 * Test API connectivity and return detailed diagnostic information
 */
export async function testConnection() {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test basic health endpoint
    const healthResponse = await api.get('/health', { 
      timeout: 5000,
      validateStatus: (status) => status < 500 // Accept 4xx errors for testing
    });
    
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test theatres endpoint
    const theatresResponse = await api.get('/theatres', {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });
    
    console.log('✅ Theatres data loaded:', theatresResponse.data?.data?.length || 0, 'theatres');
    
    return {
      success: true,
      health: healthResponse.data,
      theatresCount: theatresResponse.data?.data?.length || 0,
      message: 'Connection successful'
    };
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    
    let diagnostic = {
      success: false,
      error: error.message,
      message: 'Connection failed'
    };
    
    if (error.response) {
      // Server responded with error status
      diagnostic.status = error.response.status;
      diagnostic.statusText = error.response.statusText;
      diagnostic.data = error.response.data;
      diagnostic.message = `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      diagnostic.message = 'Network error - server not reachable';
      diagnostic.suggestions = [
        'Check if backend server is running on 192.168.1.217:3000',
        'Verify device/emulator is on the same network as backend',
        'Check firewall settings',
        'Try using localhost instead of IP if running on simulator'
      ];
    } else {
      // Request setup error
      diagnostic.message = `Request error: ${error.message}`;
    }
    
    return diagnostic;
  }
}
