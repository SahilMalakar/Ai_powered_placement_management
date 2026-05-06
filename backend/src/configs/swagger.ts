import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TNP Placement Management API',
            version: '1.0.0',
            description: 'API documentation for the TNP Placement Management System.',
        },
        servers: [
            {
                url: 'http://localhost:4001',
                description: 'API Documentation for the TNP Placement Management System',
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
            schemas: {
                Branch: {
                    type: 'string',
                    enum: ['CSE', 'ETE', 'EE', 'ME', 'IE', 'CE', 'CHE', 'IPE', 'MCA'],
                },
                VerificationStatus: {
                    type: 'string',
                    enum: ['NOT_VERIFIED', 'PROCESSING', 'VERIFIED', 'REJECTED'],
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        deletedAt: { type: 'string', format: 'date-time', nullable: true },
                        profile: {
                            type: 'object',
                            properties: {
                                fullName: { type: 'string' },
                                branch: { type: 'string' },
                                cgpa: { type: 'number' },
                                backlog: { type: 'boolean' },
                                verificationStatus: { type: 'string' },
                            }
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    message: { type: 'string', example: 'Unauthorized' }
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'User does not have the required permissions',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    message: { type: 'string', example: 'Forbidden' }
                                }
                            }
                        }
                    }
                }
            }
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
