import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TNP Placement Management API',
            version: '1.0.0',
            description: 'API documentation for the AI-powered Placement Management System. Supports both JWT Bearer tokens and Cookie-based authentication.',
        },
        servers: [
            {
                url: 'http://localhost:4001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'accessToken',
                },
                refreshTokenCookie: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken',
                }
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                cookieAuth: [],
            }
        ],
    },
    apis: ['./src/routes/**/*.ts', './src/routes/**/*.js', './src/modules/**/*.ts', './src/modules/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
