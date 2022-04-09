import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import { registerUser } from './accounts/register.js';
import { authorizeUser } from './accounts/authorize.js';
import { logUserIn } from './accounts/logUserIn.js';
import { getUserFromCookies } from './accounts/user.js';

// ESM specific features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });

    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });

    app.post('/api/register', {}, async (request, reply) => {
      try {
        await registerUser(request.body.email, request.body.password);
      } catch (e) {
        console.error(e);
      }
    });

    app.post('/api/authorize', {}, async (request, reply) => {
      try {
        console.log(request.body.email, request.body.password);
        const { isAuthorized, userId } = await authorizeUser(
          request.body.email,
          request.body.password
        );
        if (isAuthorized) {
          await logUserIn(userId, request, reply);
          reply.send({
            data: 'User Logged In',
          });
        }
        reply.send({
          data: 'Auth Failed',
        });
      } catch (e) {
        console.error(e);
      }
    });

    app.get('/test', {}, async (request, reply) => {
      try {
        // Verify user login
        const user = await getUserFromCookies(request);
        console.log({ user }, user);
        // return user email, if it exists, otherwise return unauthorized
        if (user?._id) {
          reply.send({
            data: user,
          });
        } else {
          reply.send({
            data: 'User Lookup Failed',
          });
        }
      } catch (e) {
        throw new Error(e);
      }
    });

    await app.listen(3000, () => console.log('Listening on 3000...'));
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(() => {
  startApp();
});
