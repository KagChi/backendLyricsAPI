import * as dotenv from "dotenv";
import readdirRecursive from "../utils/readdirRercusive";
import { join } from "path";
const routeDir = readdirRecursive(join(__dirname, '..', 'routes'));
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
    logger: false
});

app.decorate("cache", new Map());
for(const file of routeDir) {
    const routes = require(file);
    /* eslint @typescript-eslint/no-floating-promises: "off" */
    app.register(routes, {
        prefix: "/"
    });
}

export default async (req: any, res: any): Promise<void> => {
    await app.ready();
    app.server.emit("request", req, res);
};
