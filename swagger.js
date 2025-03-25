const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project 400 API Documentation',
      version: '1.0.0',
      description: 'API documentation for Project 400',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: process.env.PRODUCTION_URL || 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Schemas are defined in docs/auth.js
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './docs/*.js',
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
