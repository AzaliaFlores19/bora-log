import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL no está definida en el entorno.');
    }
    // ... rest
    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }
// ... rest

  async connect() {
    try {
      await this.$connect();
      console.log('Conexión exitosa con PostgreSQL');
    } catch (error) {
      console.error(' Error al conectar a la DB:', error);
    }
  }

  async disconnect() {
    await this.$disconnect();
  }
}

const prisma = new PrismaService();
export default prisma;