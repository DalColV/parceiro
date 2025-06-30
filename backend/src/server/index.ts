import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import projectsRoutes from '../routes/projects';
import contactsRoutes from '../routes/contacts';
import skillsRoutes from '../routes/skills';
import usersRoutes from '../routes/users';
import categoriesRoutes from '../routes/categories';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

// Habilitar CORS para permitir requisições do frontend
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
});

// Registrar rotas
fastify.register(projectsRoutes, { prefix: '/projects' });
fastify.register(contactsRoutes, { prefix: '/contacts' });
fastify.register(skillsRoutes, { prefix: '/skills' });
fastify.register(usersRoutes, { prefix: '/users' });
fastify.register(categoriesRoutes, { prefix: '/categories' });

// Rota inicial
fastify.get('/', async (request, reply) => {
  return { message: 'API de Portfólio de Desenvolvedor' };
});

// Desconectar o Prisma ao encerrar o servidor
fastify.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Iniciar o servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Servidor rodando em http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
