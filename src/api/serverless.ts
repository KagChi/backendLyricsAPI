import * as dotenv from "dotenv";
import vercelRoutes from "../vercelRoutes/index";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
    logger: false
});

app.decorate("cache", new Map());

// Register your application as a normal plugin.
/* eslint @typescript-eslint/no-floating-promises: "off" */
app.register(vercelRoutes, {
    prefix: "/"
});

export default async (req: any, res: any): Promise<void> => {
    await app.ready();
    app.server.emit("request", req, res);
};
