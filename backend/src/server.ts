import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './routes/v1/index.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infra/swagger.js';

const app: Express = express();

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// cors setup to pass specific endpoints only
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow only your frontend origin
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
        credentials: true, // allow cookies / auth headers
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ message: 'Hello from auth service' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log('hello from app');

// all routes

app.use('/api', router);

export { app };
