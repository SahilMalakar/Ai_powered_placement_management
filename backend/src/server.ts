import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './routes/v1/index.js';

const app: Express = express();

// cors setup to pass specific endpoints only
app.use(
    cors({
        // origin: "http://localhost:5173", // Allow only your frontend origin
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
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

console.log('hello from app');

// all routes

app.use('/api', router);

export { app };
