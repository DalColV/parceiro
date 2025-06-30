import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserParams {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
}

export default async function usersRoutes(fastify: FastifyInstance) {
  // GET: Listar todos os usuários
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await prisma.user.findMany({
      include: { projects: true },
    });
    return users;
  });

  // GET: Buscar um usuário por ID
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: UserParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { projects: true },
      });
      if (!user) {
        reply.code(404).send({ error: 'Usuário não encontrado' });
      }
      return user;
    }
  );

  // POST: Criar um novo usuário
  fastify.post(
    '/',
    async (
      request: FastifyRequest<{ Body: UserBody }>,
      reply: FastifyReply
    ) => {
      const { name, email, bio, github_url, linkedin_url } = request.body;
      const user = await prisma.user.create({
        data: {
          name,
          email,
          bio,
          github_url,
          linkedin_url,
        },
      });
      reply.code(201);
      return user;
    }
  );

  // PUT: Atualizar um usuário
  fastify.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: UserParams; Body: UserBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { name, email, bio, github_url, linkedin_url } = request.body;
      const user = await prisma.user
        .update({
          where: { id: parseInt(id) },
          data: {
            name,
            email,
            bio,
            github_url,
            linkedin_url,
          },
        })
        .catch(() => null);
      if (!user) {
        reply.code(404).send({ error: 'Usuário não encontrado' });
      }
      return user;
    }
  );

  // DELETE: Excluir um usuário
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: UserParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const user = await prisma.user
        .delete({
          where: { id: parseInt(id) },
        })
        .catch(() => null);
      if (!user) {
        reply.code(404).send({ error: 'Usuário não encontrado' });
      }
      reply.code(204).send();
    }
  );
}
