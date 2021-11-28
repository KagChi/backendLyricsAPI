import type { FastifyPluginCallback } from "fastify";
import fetch from "petitio";
import config from "../config";
import { geniusSearchResult } from "../types";

const search: FastifyPluginCallback = async (fastify): Promise<void> => {
  fastify.post<{ Body: { q?: string, auth?: string } }>(
    "/search",
    {
        schema: {
            body: {
                type: 'object',
                required: ['q', 'auth'],
                properties: {
                    q: {
                        description: 'The search query',
                        type: 'string',
                    },
                    auth: {
                        description: 'The secret of this lyrics API instance',
                        type: 'string',
                    }
                },
            },
        },
    },
    async (request, reply) => {
        const { q, auth } = request.body;
        if (auth !== config.auth) return reply.code(401).send({ status: 401, message: "Authorization missing "})
        const fetchResponse = fetch(`https://api.genius.com/search?q=${encodeURIComponent(q!)}`).header({ 'Authorization': `Bearer ${config.geniusToken}` });
        const lyricsInfo = await fetchResponse.json() as geniusSearchResult;
        if(!lyricsInfo.response.hits.length) return reply.code(404).send({ message: "Lyrics not found", status: 404 });
        return reply.code(200).send(
            {
                results: lyricsInfo.response.hits.map(x => {
                    return {
                        title: x.result.title ?? x.result.full_title,
                        url: x.result.url,
                        id: x.result.id,
                        thumbnail: x.result.song_art_image_thumbnail_url
                    }
                }),
                status: 200,
                message: "Lyrics found"
            }
        )
    }
  );
};

export default search;