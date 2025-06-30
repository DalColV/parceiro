import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProjectParams {
  id: string;
}

interface ProjectBody {
  title: string;
  description?: string;
  repository_url?: string;
  demo_url?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  userId: number;
  categoryId?: number;
  skillIds?: number[];
}

export default async function projectsRoutes(fastify: FastifyInstance) {
  // GET: Listar todos os projetos
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const projects = await prisma.project.findMany({
      include: { user: true, category: true, skills: true },
    });
    return projects;
  });

  // GET: Buscar um projeto por ID
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ProjectParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
        include: { user: true, category: true, skills: true },
      });
      if (!project) {
        reply.code(404).send({ error: 'Projeto não encontrado' });
      }
      return project;
    }
  );

  // POST: Criar um novo projeto
  fastify.post(
    '/',
    async (
      request: FastifyRequest<{ Body: ProjectBody }>,
      reply: FastifyReply
    ) => {
      const {
        title,
        description,
        repository_url,
        demo_url,
        image_url,
        start_date,
        end_date,
        userId,
        categoryId,
        skillIds,
      } = request.body;
      const project = await prisma.project.create({
        data: {
          title,
          description,
          repository_url,
          demo_url,
          image_url,
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          user: { connect: { id: parseInt(userId.toString()) } },
          category: categoryId
            ? { connect: { id: parseInt(categoryId.toString()) } }
            : undefined,
          skills: skillIds
            ? {
                connect: skillIds.map((id) => ({
                  id: parseInt(id.toString()),
                })),
              }
            : undefined,
        },
      });
      reply.code(201);
      return project;
    }
  );

  // PUT: Atualizar um projeto
  fastify.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ProjectParams; Body: ProjectBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const {
        title,
        description,
        repository_url,
        demo_url,
        image_url,
        start_date,
        end_date,
        userId,
        categoryId,
        skillIds,
      } = request.body;
      const project = await prisma.project
        .update({
          where: { id: parseInt(id) },
          data: {
            title,
            description,
            repository_url,
            demo_url,
            image_url,
            start_date: start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            user: userId
              ? { connect: { id: parseInt(userId.toString()) } }
              : undefined,
            category: categoryId
              ? { connect: { id: parseInt(categoryId.toString()) } }
              : undefined,
            skills: skillIds
              ? { set: skillIds.map((id) => ({ id: parseInt(id.toString()) })) }
              : undefined,
          },
        })
        .catch(() => null);
      if (!project) {
        reply.code(404).send({ error: 'Projeto não encontrado' });
      }
      return project;
    }
  );

  // DELETE: Excluir um projeto
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ProjectParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const project = await prisma.project
        .delete({
          where: { id: parseInt(id) },
        })
        .catch(() => null);
      if (!project) {
        reply.code(404).send({ error: 'Projeto não encontrado' });
      }
      reply.code(204).send();
    }
  );
}
