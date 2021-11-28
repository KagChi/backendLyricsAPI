import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import config from "../config";
import { geniusSearchResult, geniusSongResult } from "../types";
import extractLyrics from "../utils/extractLyrics";
import fetch from "petitio";

/* eslint func-names: "off" */
export default async function (instance: FastifyInstance): Promise<void> {
    instance.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
        reply.raw.writeHead(200, { "Content-Type": "text/plain" });
        reply.raw.write("</backendLyricsAPI>");
        return reply.raw.end();
    });

    instance.post<{ Body: { auth?: string } }>(
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
            instance.cache.clear();
            return reply.code(200).send({ status: 200, message: "Lyrics cache cleared " });
        }
    );

    instance.post<{ Body: { q?: string; auth?: string } }>(
        "/search",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["q", "auth"],
                    properties: {
                        q: {
                            description: "The search query",
                            type: "string"
                        },
                        auth: {
                            description: "The secret of this lyrics API instance",
                            type: "string"
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { q, auth } = request.body;
            if (auth !== config.auth) return reply.code(401).send({ status: 401, message: "Authorization missing " });
            /* eslint @typescript-eslint/restrict-template-expressions: "off" */
            const fetchResponse = fetch(`https://api.genius.com/search?q=${encodeURIComponent(q!)}`).header({ Authorization: `Bearer ${config.geniusToken}` });
            /* eslint @typescript-eslint/no-unnecessary-type-assertion: "off" */
            const lyricsInfo = await fetchResponse.json() as geniusSearchResult;
            if (!lyricsInfo.response.hits.length) return reply.code(404).send({ message: "Lyrics not found", status: 404 });
            return reply.code(200).send(
                {
                    results: lyricsInfo.response.hits.map(x => ({
                        title: x.result.title,
                        url: x.result.url,
                        id: x.result.id,
                        thumbnail: x.result.song_art_image_thumbnail_url
                    })),
                    status: 200,
                    message: "Lyrics found"
                }
            );
        }
    );


    instance.post<{ Params: { id?: string }; Body: { auth?: string } }>(
        "/lyrics/:id",
        {
            schema: {
                params: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: {
                            description: "The lyrics id",
                            type: "string"
                        }
                    }
                },
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
            const { id } = request.params;
            const { auth } = request.body;
            if (auth !== config.auth) return reply.code(401).send({ status: 401, message: "Authorization missing " });
            const lyricsCache = instance.cache.get(id!);
            if (lyricsCache) return lyricsCache;
            const fetchResponse = fetch(`https://api.genius.com/songs/${encodeURIComponent(id!)}`).header({ Authorization: `Bearer ${config.geniusToken}` });
            const lyricsInfo = await fetchResponse.json() as geniusSongResult;
            if (!lyricsInfo.response.song) return reply.code(404).send({ message: "Lyrics not found", status: 404 });
            const lyrics = await extractLyrics(lyricsInfo.response.song.url);
            const responseObj = {
                results: {
                    id: lyricsInfo.response.song.id,
                    lyrics,
                    thumbnail: lyricsInfo.response.song.header_image_thumbnail_url,
                    title: lyricsInfo.response.song.title,
                    url: lyricsInfo.response.song.url
                },
                status: 200,
                message: "Lyrics found"
            };
            instance.cache.set(id, responseObj);
            return reply.code(200).send(
                responseObj
            );
        }
    );
}
