import fp from 'fastify-plugin';
import compression, { FastifyCompressOptions } from 'fastify-compress';
import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

/**
 * This plugins adds compression utils
 *
 * @see https://github.com/fastify/fastify-compress
 */
export default fp<FastifyCompressOptions>(async (fastify: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>) => {
	await fastify.register(compression);
});