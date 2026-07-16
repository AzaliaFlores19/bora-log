import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

import authRoutes from './routes/authRoutes.js';
import showRoutes from './routes/showRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/users', userRoutes);
const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.json({ message: "¡Bora-Sync está en línea! 💜" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
