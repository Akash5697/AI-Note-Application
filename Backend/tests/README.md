# API Test Suite

This directory contains comprehensive test suites for all API endpoints in the Notes Application.

## 🧪 Test Suites

### Available Test Files

1. **`auth.test.js`** - Authentication APIs
   - User registration
   - User login
   - Profile management
   - Token validation
   - Security checks

2. **`notes.test.js`** - Notes Management APIs
   - CRUD operations (Create, Read, Update, Delete)
   - Note archiving/unarchiving
   - Search functionality
   - Permission validation

3. **`users.test.js`** - User Management APIs
   - User profile operations
   - User sharing lists
   - Admin user management
   - Role-based access control

4. **`roles.test.js`** - Role Management APIs
   - Role CRUD operations
   - Permission validation
   - Admin-only access

5. **`analytics.test.js`** - Analytics APIs
   - Usage statistics
   - Popular tags
   - Active users
   - Summary reports

6. **`sharing.test.js`** - Note Sharing APIs
   - Share notes with permissions
   - Update sharing permissions
   - Remove sharing access
   - Access control validation

7. **`index.js`** - Main test runner
   - Runs all test suites
   - Provides summary reports
   - Error handling

## 🚀 Running Tests

### Prerequisites

1. **Backend Server**: Ensure your backend server is running on `http://localhost:5000`
   ```bash
   cd Backend
   npm start
   ```

2. **Database**: Make sure MongoDB is running and accessible

### Run All Tests

```bash
# Run complete test suite
npm test

# Or directly
node tests/index.js
```

### Run Individual Test Suites

```bash
# Authentication tests
npm run test:auth

# Notes tests
npm run test:notes

# Users tests
npm run test:users

# Roles tests
npm run test:roles

# Analytics tests
npm run test:analytics

# Sharing tests
npm run test:sharing
```

## 📊 Test Coverage

### API Endpoints Tested

#### Authentication (`/api/auth`)
- ✅ `POST /register` - User registration
- ✅ `POST /login` - User login
- ✅ `GET /me` - Get current user

#### Notes (`/api/notes`)
- ✅ `GET /` - Get all notes
- ✅ `POST /` - Create note
- ✅ `GET /search` - Search notes
- ✅ `GET /:id` - Get note by ID
- ✅ `PUT /:id` - Update note
- ✅ `DELETE /:id` - Delete note
- ✅ `POST /:id/share` - Share note
- ✅ `PUT /:id/share/:userId` - Update sharing
- ✅ `DELETE /:id/share/:userId` - Remove sharing

#### Users (`/api/users`)
- ✅ `GET /profile` - Get current user profile
- ✅ `PUT /profile` - Update current user profile
- ✅ `GET /sharing` - Get users for sharing
- ✅ `GET /` - Get all users (admin)
- ✅ `GET /:id` - Get user by ID (admin)
- ✅ `PUT /:id` - Update user (admin)
- ✅ `PUT /:id/role` - Update user role (admin)
- ✅ `DELETE /:id` - Delete user (admin)

#### Roles (`/api/roles`)
- ✅ `GET /` - Get all roles (admin)
- ✅ `POST /` - Create role (admin)
- ✅ `PUT /:id` - Update role (admin)
- ✅ `DELETE /:id` - Delete role (admin)

#### Analytics (`/api/analytics`)
- ✅ `GET /summary` - Get analytics summary (admin)
- ✅ `GET /active-users` - Get most active users (admin)
- ✅ `GET /popular-tags` - Get most used tags (admin)
- ✅ `GET /notes-per-day` - Get notes per day (admin)

### Security Tests

- ✅ **Authentication Required**: All protected endpoints
- ✅ **Authorization Checks**: Role-based access control
- ✅ **Input Validation**: Invalid data handling
- ✅ **Error Handling**: Proper error responses
- ✅ **Permission Validation**: Ownership and sharing rules

### Edge Cases

- ✅ **Invalid IDs**: Non-existent resource access
- ✅ **Duplicate Data**: Prevention of duplicate entries
- ✅ **Unauthorized Access**: Security boundary testing
- ✅ **Invalid Tokens**: Authentication validation
- ✅ **Missing Data**: Required field validation

## 📋 Test Results Format

Each test suite provides detailed results including:

```
📊 Test Results Summary
==================================================
✅ Passed: 5/6
❌ Failed: 1/6
⏱️  Duration: 3.45s
==================================================
```

### Individual Test Output

```
🧪 Test Name...
✅ Test Name - PASSED

🧪 Another Test...
❌ Another Test - FAILED: Error message
```

## 🔧 Configuration

### API Base URL

Tests are configured to use `http://localhost:5000/api` by default. 

To change this, update the `API_BASE` constant in each test file.

### Test Data

Tests create temporary users and data that are cleaned up automatically. No persistent test data remains after test completion.

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   ❌ Test failed: connect ECONNREFUSED ::1:5000
   ```
   **Solution**: Start the backend server first

2. **Admin Privileges Required**
   ```
   ❌ Test failed: Admin privileges required - user is not admin
   ```
   **Solution**: This is expected behavior. Admin tests verify access control.

3. **Database Connection**
   ```
   ❌ Test failed: MongoServerError
   ```
   **Solution**: Ensure MongoDB is running and accessible

### Debug Mode

For detailed debugging, you can modify the test files to include more console output or run individual test functions.

## 📈 Performance Notes

- Complete test suite typically runs in 10-30 seconds
- Individual test suites run in 2-8 seconds
- Tests run sequentially to avoid data conflicts
- Automatic cleanup prevents data pollution

## 🔄 Adding New Tests

To add new tests:

1. Create a new test file following the existing pattern
2. Add the test to `index.js`
3. Update this README
4. Add npm script to `package.json`

Example test structure:
```javascript
class NewTester {
  async runTest(name, testFn) { /* ... */ }
  async testSomething() { /* ... */ }
  async run() { /* ... */ }
}

module.exports = async function testNew() {
  const tester = new NewTester();
  return await tester.run();
};
```

## 📝 Notes

- Tests use axios for HTTP requests
- Each test suite is independent and self-contained
- Temporary test data is automatically cleaned up
- Tests verify both success and failure scenarios
- Security and permission boundaries are thoroughly tested
