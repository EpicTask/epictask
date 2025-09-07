import request from 'supertest';
import {expect} from 'chai';
import app from '../src/index.js';

describe('API Routes', function () {
  describe('GET /', function () {
    it('should return welcome message', function (done) {
      request(app)
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).to.include('Welcome to the User Management Service');
        })
        .end(done);
    });
  });

  describe('GET /users/me', function () {
    it('should return 401 without authentication', function (done) {
      request(app).get('/users/me').expect(401).end(done);
    });
  });

  describe('POST /registerWithPassword', function () {
    it('should return 400 for missing required fields', function (done) {
      const userData = {
        // Missing required fields
      };

      request(app)
        .post('/registerWithPassword')
        .send(userData)
        .expect(400)
        .end(done);
    });

    it('should return 400 for invalid email format', function (done) {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Test User',
        role: 'user',
      };

      request(app)
        .post('/registerWithPassword')
        .send(userData)
        .expect(400)
        .end(done);
    });
  });

  describe('POST /loginWithPassword', function () {
    it('should return 401 for invalid credentials', function (done) {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      request(app)
        .post('/loginWithPassword')
        .send(loginData)
        .expect(401)
        .expect((res) => {
          expect(res.body).to.have.property('error', 'Invalid credentials.');
        })
        .end(done);
    });

    it('should return 400 for missing credentials', function (done) {
      const loginData = {
        // Missing email and password
      };

      request(app)
        .post('/loginWithPassword')
        .send(loginData)
        .expect(401)
        .end(done);
    });
  });

  describe('PUT /profileUpdate', function () {
    it('should return 401 without authentication', function (done) {
      const updateData = {
        displayName: 'Updated Name',
      };

      request(app).put('/profileUpdate').send(updateData).expect(401).end(done);
    });
  });

  describe('DELETE /deleteAccount', function () {
    it('should return 401 without authentication', function (done) {
      request(app).delete('/deleteAccount').expect(401).end(done);
    });
  });

  describe('POST /users/generate-invite-code', function () {
    it('should return 401 without authentication', function (done) {
      request(app).post('/users/generate-invite-code').expect(401).end(done);
    });
  });

  describe('POST /users/link-child', function () {
    it('should return 401 without authentication', function (done) {
      const linkData = {
        inviteCode: 'TEST123',
      };

      request(app)
        .post('/users/link-child')
        .send(linkData)
        .expect(401)
        .end(done);
    });
  });

  describe('GET /users/me/children', function () {
    it('should return 401 without authentication', function (done) {
      request(app).get('/users/me/children').expect(401).end(done);
    });
  });
});
