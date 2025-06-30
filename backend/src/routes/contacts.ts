import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ContactParams {
  id: string;
}

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

export default async function contactsRoutes(fastify: FastifyInstance) {
  // GET: Listar todos os contatos
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const contacts = await prisma.contact.findMany();
    return contacts;
  });

  // GET: Buscar um contato por ID
  fastify.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ContactParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const contact = await prisma.contact.findUnique({
        where: { id: parseInt(id) },
      });
      if (!contact) {
        reply.code(404).send({ error: 'Contato não encontrado' });
      }
      return contact;
    }
  );

  // POST: Criar um novo contato
  fastify.post(
    '/',
    async (
      request: FastifyRequest<{ Body: ContactBody }>,
      reply: FastifyReply
    ) => {
      const { name, email, message } = request.body;
      const contact = await prisma.contact.create({
        data: {
          name,
          email,
          message,
        },
      });
      reply.code(201);
      return contact;
    }
  );

  // PUT: Atualizar um contato
  fastify.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ContactParams; Body: ContactBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { name, email, message } = request.body;
      const contact = await prisma.contact
        .update({
          where: { id: parseInt(id) },
          data: {
            name,
            email,
            message,
          },
        })
        .catch(() => null);
      if (!contact) {
        reply.code(404).send({ error: 'Contato não encontrado' });
      }
      return contact;
    }
  );

  // DELETE: Excluir um contato
  fastify.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: ContactParams }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const contact = await prisma.contact
        .delete({
          where: { id: parseInt(id) },
        })
        .catch(() => null);
      if (!contact) {
        reply.code(404).send({ error: 'Contato não encontrado' });
      }
      reply.code(204).send();
    }
  );
}
