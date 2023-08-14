// import chakram from 'chakram';
// import {expect} from 'chai';
// import express from 'express';

// const app = express();

// // describe('Your API Routes', function () {
// //   describe('GET /getCurrentUser', function () {
// //     it('should return the current user', function () {
// //       const response = chakram.get('http://localhost:3000/getCurrentUser');
// //       return expect(response).to.have.status(200)
// //         .and.to.have.json('message', 'some-user-id'); // Replace 'some-user-id' with the expected user ID
// //     });

// //     it('should handle errors', function () {
// //       const response = chakram.get('http://localhost:3000/getCurrentUser');
// //       return expect(response).to.have.status(500);
// //     });
// //   });

// describe('POST /events/', function () {
//   it('should create a new UserEvent', function () {
//     const eventData = {
//       event_id: 'event_123',
//       event_type: 'userRegistration',
//       user_id: 'user_123',
//       additional_data: {
//         // Add your additional data here
//       },
//     };

//     const response = chakram.post('http://localhost:3000/events/', eventData);
//     return expect(response).to.have.status(201);
//   });

//   it('should handle invalid event type', function () {
//     const eventData = {
//       event_id: 'event_123',
//       event_type: 'invalidEventType',
//       user_id: 'user_123',
//       additional_data: {},
//     };

//     const response = chakram.post('http://localhost:3000/events/', eventData);
//     return expect(response).to.have.status(400);
//   });

//   it('should handle errors', function () {
//     const eventData = {
//       // Missing required fields, causing a 500 error
//     };

//     const response = chakram.post('http://localhost:3000/events/', eventData);
//     return expect(response).to.have.status(500);
//   });
// });

// // Add tests for other routes
