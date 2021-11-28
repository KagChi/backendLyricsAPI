import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import config from '../config';
import { geniusSearchResult, geniusSongResult } from '../types';
import extractLyrics from '../utils/extractLyrics';
import { fetch } from 'undici';
export default async function (instance: FastifyInstance, opts: FastifyServerOptions, done: any) {
    instance.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
        reply.raw.writeHead(200, { "Content-Type": "text/plain" });
        reply.raw.write("</backendLyricsAPI>");
        return reply.raw.end();
    })

    instance.post<{ Body: { q?: string, auth?: string } }>(
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
            const fetchResponse = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(q!)}`, { headers: { 'Authorization': `Bearer ${config.geniusToken}`} });
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


    instance.post<{ Params: { id?: string }, Body: { auth?: string } }>(
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
            const lyricsCache = instance.cache.get(id);
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
            instance.cache.set(id, responseObj);
            return reply.code(200).send(
                responseObj
            )
        }
    );
}