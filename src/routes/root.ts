import type { FastifyPluginCallback } from "fastify";

const root: FastifyPluginCallback = async (fastify): Promise<void> => {
  fastify.get("/", async (request, reply) => {
    reply.raw.writeHead(200, { "Content-Type": "text/plain" });
    reply.raw.write("</Lyrics>");
    return reply.raw.end();
  });
};

export default root;