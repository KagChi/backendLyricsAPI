import { FastifyPluginCallback } from "fastify";
import config from "../config";

const cache: FastifyPluginCallback = async (fastify): Promise<void> => {
    fastify.post<{ Body: { auth?: string } }>(
        "/clearCache",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["auth"],
                    properties: {
                        auth: {
                            description: "The secret of this lyrics API instance",
                            type: "string"
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { auth } = request.body;
            if (auth !== config.auth) return reply.code(401).send({ status: 401, message: "Authorization missing " });
            fastify.cache.clear();
            return reply.code(200).send({ status: 200, message: "Lyrics cache cleared " });
        }
    );
};

export default cache;
