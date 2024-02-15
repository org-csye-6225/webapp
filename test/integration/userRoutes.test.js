const request = require('supertest');
const app = require('../../app');
const db = require('../../init/index');
const User = require('../../models/User');

describe('User Routes Integration Tests', () => {
  beforeAll(async () => {
    await db.initDatabase();
    await db.sequelize.sync();
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('Test 1: Create User and validate with GET', () => {
    test('should create a new user and validate data with GET', async () => {
      const userData = {
        email: 'danny@gmail.com',
        password: '1234@Data',
        firstName: 'daniel',
        lastName: 'radclif'
      };

      await request(app)
        .post('/v1/user')
        .send(userData)
        .expect(201);

      const getUserResponse = await request(app) 
        .get('/v1/user/self')
        .auth('danny@gmail.com', '1234@Data')
        .expect(200);

      expect(getUserResponse.body.email).toBe(userData.email);
      expect(getUserResponse.body.firstName).toBe(userData.firstName);
      expect(getUserResponse.body.lastName).toBe(userData.lastName);
    });
  });

  describe('Test 2: Update User and validate data with GET', () => {
    test('should update user and validate data with GET', async () => {
      const userData = {
        email: 'danny@gmail.com',
        password: '1234@Data',
        firstName: 'daniel',
        lastName: 'radclif'
      };

      await request(app)
        .post('/v1/user')
        .send(userData)
        .expect(201);

      const updatedUserData = {
        firstName: 'abhinav',
        lastName: 'pandey'
      };

      await request(app)
        .put('/v1/user/self')
        .auth('danny@gmail.com', '1234@Data')
        .send(updatedUserData)
        .expect(200);

      const getUserResponse = await request(app)
        .get('/v1/user/self')
        .auth('danny@gmail.com', '1234@Data')
        .expect(200);

      expect(getUserResponse.body.firstName).toBe(updatedUserData.firstName);
      expect(getUserResponse.body.lastName).toBe(updatedUserData.lastName);
    });
  });
});
