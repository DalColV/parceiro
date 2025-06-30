import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SkillParams {
  id: string;
}

interface SkillBody {
  name: string;
  proficiency?: number;
}

export default async function skillsRoutes(fastify: FastifyInstance) {
  // GET: Listar todas as habilidades
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const skills = await prisma.skill.findMany({
      include: { projects: true },
    });
    return skills;
  });

  // GET: Buscar uma habilidade por ID
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: SkillParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const skill = await prisma.skill.findUnique({
        where: { id: parseInt(id) },
        include: { projects: true },
      });
      if (!skill) {
        reply.code(404).send({ error: 'Habilidade não encontrada' });
      }
      return skill;
    }
  );

  // POST: Criar uma nova habilidade
  fastify.post(
    '/',
    async (
      request: FastifyRequest<{ Body: SkillBody }>,
      reply: FastifyReply
    ) => {
      const { name, proficiency } = request.body;
      const skill = await prisma.skill.create({
        data: {
          name,
          proficiency: proficiency ? parseInt(proficiency.toString()) : null,
        },
      });
      reply.code(201);
      return skill;
    }
  );

  // PUT: Atualizar uma habilidade
  fastify.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: SkillParams; Body: SkillBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { name, proficiency } = request.body;
      const skill = await prisma.skill
        .update({
          where: { id: parseInt(id) },
          data: {
            name,
            proficiency: proficiency ? parseInt(proficiency.toString()) : null,
          },
        })
        .catch(() => null);
      if (!skill) {
        reply.code(404).send({ error: 'Habilidade não encontrada' });
      }
      return skill;
    }
  );

  // DELETE: Excluir uma habilidade
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: SkillParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const skill = await prisma.skill
        .delete({
          where: { id: parseInt(id) },
        })
        .catch(() => null);
      if (!skill) {
        reply.code(404).send({ error: 'Habilidade não encontrada' });
      }
      reply.code(204).send();
    }
  );
}
