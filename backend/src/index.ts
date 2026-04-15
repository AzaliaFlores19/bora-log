import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import showRoutes from './routes/showRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.json({ message: "¡Bora-Sync está en línea! 💜" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});