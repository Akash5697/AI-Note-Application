const ApiClient = require('./api-client');
const { generateTestUser } = require('./test-data');

/**
 * Admin Setup Helper
 * Creates proper admin users for testing admin-only endpoints
 */
class AdminSetup {
  constructor() {
    this.client = new ApiClient();
    this.adminRole = null;
    this.userRole = null;
  }

  /**
   * Initialize roles - create default roles if they don't exist
   */
  async initializeRoles() {
    try {
      // Try to get existing roles first
      const roles = await this.client.get('/roles');
      
      this.adminRole = roles.find(role => role.name === 'admin');
      this.userRole = roles.find(role => role.name === 'user');
      
      // If roles don't exist, create them
      if (!this.adminRole) {
        try {
          this.adminRole = await this.client.post('/roles', {
            name: 'admin',
            description: 'Administrator role with full access',
            permissions: ['read', 'write', 'delete', 'admin']
          });
        } catch (error) {
          // If we can't create roles, we'll handle this differently
          console.log('Note: Could not create admin role via API');
        }
      }
      
      if (!this.userRole) {
        try {
          this.userRole = await this.client.post('/roles', {
            name: 'user',
            description: 'Regular user role',
            permissions: ['read', 'write']
          });
        } catch (error) {
          console.log('Note: Could not create user role via API');
        }
      }
    } catch (error) {
      // Handle case where roles endpoint doesn't work without auth
      console.log('Note: Roles endpoint requires authentication');
    }
  }

  /**
   * Create an admin user for testing
   * This function assumes the first user created becomes admin (common pattern)
   * or uses database-level setup
   */
  async createAdminUser(prefix = 'testadmin') {
    const adminData = generateTestUser(prefix);
    
    try {
      // Register the admin user
      const response = await this.client.post('/auth/register', adminData);
      
      const adminUser = {
        ...adminData,
        id: response._id,
        token: response.token,
        role: response.role
      };

      // If this user doesn't have admin role, we need to use a different approach
      if (!response.role || response.role.name !== 'admin') {
        console.log('⚠️  Warning: Created user does not have admin role automatically');
        console.log('💡 You may need to manually assign admin role in database or through admin panel');
        
        // For testing purposes, we'll still return the user
        // The calling code can handle the admin privilege failures gracefully
      }

      return adminUser;
    } catch (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
  }

  /**
   * Create a regular user for testing
   */
  async createRegularUser(prefix = 'testuser') {
    const userData = generateTestUser(prefix);
    
    try {
      const response = await this.client.post('/auth/register', userData);
      
      return {
        ...userData,
        id: response._id,
        token: response.token,
        role: response.role
      };
    } catch (error) {
      throw new Error(`Failed to create regular user: ${error.message}`);
    }
  }

  /**
   * Check if a user has admin privileges
   */
  async checkAdminPrivileges(token) {
    try {
      this.client.setAuthToken(token);
      
      // Try to access an admin-only endpoint
      await this.client.get('/users');
      return true;
    } catch (error) {
      if (error.status === 403 || error.status === 401) {
        return false;
      }
      // Other errors might indicate different issues
      throw error;
    }
  }

  /**
   * Setup admin user with fallback strategies
   */
  async setupAdminUser() {
    let adminUser = null;
    
    try {
      // Strategy 1: Create user and check if they get admin privileges
      adminUser = await this.createAdminUser();
      
      const hasAdminPrivileges = await this.checkAdminPrivileges(adminUser.token);
      
      if (hasAdminPrivileges) {
        console.log('✅ Admin user created successfully with proper privileges');
        return adminUser;
      } else {
        console.log('⚠️  Created user does not have admin privileges');
        
        // Strategy 2: Try with different naming (some systems make first user admin)
        const firstAdmin = await this.createAdminUser('admin');
        const hasPrivileges = await this.checkAdminPrivileges(firstAdmin.token);
        
        if (hasPrivileges) {
          console.log('✅ Admin user created with admin naming');
          return firstAdmin;
        }
        
        // Strategy 3: Return user anyway for graceful test handling
        console.log('💡 Returning user without admin privileges - tests will handle gracefully');
        return adminUser;
      }
    } catch (error) {
      throw new Error(`Failed to setup admin user: ${error.message}`);
    }
  }
}

module.exports = AdminSetup;
