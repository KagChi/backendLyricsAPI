import type { FastifyPluginCallback } from "fastify";
import { fetch } from "undici";
import config from "../config";
import { geniusSongResult } from "../types";
import extractLyrics from "../utils/extractLyrics";

const lyrics: FastifyPluginCallback = async (fastify): Promise<void> => {
  fastify.get<{ Params: { id?: string }, Body: { auth?: string } }>(
    "/lyrics/:id",
    {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        description: 'The lyrics id',
                        type: 'string',
                    },
                },
            },
            body: {
                type: 'object',
                required: ['auth'],
                properties: {
                    auth: {
                        description: 'The secret of this lyrics API instance',
                        type: 'string',
                    }
                },
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const { auth } = request.body;
        if (auth !== config.auth) return reply.code(401).send({ status: 401, message: "Authorization missing "})
        const lyricsCache = fastify.cache.get(id);
        if (lyricsCache) return lyricsCache;
        const fetchResponse = await fetch(`https://api.genius.com/songs/${encodeURIComponent(id!)}`, { headers: { 'Authorization': `Bearer ${config.geniusToken}`} });
        const lyricsInfo = await fetchResponse.json() as geniusSongResult;
        if(!lyricsInfo.response?.song) return reply.code(404).send({ message: "Lyrics not found", status: 404 });
        const lyrics = await extractLyrics(lyricsInfo.response.song.url);
        const responseObj = {
            results: {
                title: lyricsInfo.response.song.title,
                id: lyricsInfo.response.song.id,
                url: lyricsInfo.response.song.url,
                thumbnail: lyricsInfo.response.song.header_image_thumbnail_url,
                lyrics: lyrics
            },
            status: 200,
            message: "Lyrics found"
        }
        fastify.cache.set(id, responseObj);
        return reply.code(200).send(
            responseObj
        )
    }
  );
};

export default lyrics;