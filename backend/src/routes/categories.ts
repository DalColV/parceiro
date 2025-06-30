import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryParams {
  id: string;
}

interface CategoryBody {
  name: string;
}

export default async function categoriesRoutes(fastify: FastifyInstance) {
  // GET: Listar todas as categorias
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = await prisma.category.findMany({
      include: { projects: true },
    });
    return categories;
  });

  // GET: Buscar uma categoria por ID
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CategoryParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { projects: true },
      });
      if (!category) {
        reply.code(404).send({ error: 'Categoria não encontrada' });
      }
      return category;
    }
  );

  // POST: Criar uma nova categoria
  fastify.post(
    '/',
    async (
      request: FastifyRequest<{ Body: CategoryBody }>,
      reply: FastifyReply
    ) => {
      const { name } = request.body;
      const category = await prisma.category.create({
        data: {
          name,
        },
      });
      reply.code(201);
      return category;
    }
  );

  // PUT: Atualizar uma categoria
  fastify.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CategoryParams; Body: CategoryBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { name } = request.body;
      const category = await prisma.category
        .update({
          where: { id: parseInt(id) },
          data: {
            name,
          },
        })
        .catch(() => null);
      if (!category) {
        reply.code(404).send({ error: 'Categoria não encontrada' });
      }
      return category;
    }
  );

  // DELETE: Excluir uma categoria
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CategoryParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const category = await prisma.category
        .delete({
          where: { id: parseInt(id) },
        })
        .catch(() => null);
      if (!category) {
        reply.code(404).send({ error: 'Categoria não encontrada' });
      }
      reply.code(204).send();
    }
  );
}
