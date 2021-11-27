import Collection from "@discordjs/collection";
import { FastifyPluginAsync } from "fastify";
import AutoLoad, { AutoloadPluginOptions } from "fastify-autoload";
import { join } from "path";


declare module 'fastify' {
	export interface FastifyInstance {
		cache: Collection<unknown, unknown>;
	}
}

export type AppOptions = {
	logger: true;
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
    fastify.decorate('cache', new Collection());
    await fastify.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: opts,
	});

	await fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: opts,
	});
    fastify.server.keepAliveTimeout = 0
};
export { app };
export default app;