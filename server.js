/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require('path');

// Require the fastify framework and instantiate it
const fastify = require('fastify')({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.register(require('@fastify/cookie'), { decodeValues: true });

fastify.register(require('fastify-socket.io'), {});

const users = {};

const rooms = [
  {
    name: 'комната 1',
    admin: 'max',
    id: 'aa',
    users: [
      {
        name: 'dad',
        word: 'new',
      },
    ],
  },
  {
    name: 'комната 2',
    admin: 'max',
    id: 'bb',
    users: [
      {
        name: 'geg',
        word: 'new2',
      },
    ],
  },
];

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/', // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require('@fastify/formbody'));

// View is a templating manager for fastify
fastify.register(require('@fastify/view'), {
  engine: {
    handlebars: require('handlebars'),
  },
  includeViewExtension: true, // add this line to include view extension
  templates: './src/pages', // set templates folder

  partials: {
    header: './src/components/header.hbs',
    footer: './src/components/footer.hbs',
  },
});

// Load and parse SEO data
const seo = require('./src/seo.json');
if (seo.url === 'glitch-default') {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

const getUserInfo = (request) => {
  const { cookies } = request;

  // Проверяем наличие параметра name в куках
  if (cookies && cookies.userInfo) {
    const userInfo = JSON.parse(cookies.userInfo);
    // Если параметр name существует, возвращаем главную страницу
    if (userInfo.id && userInfo.name) return userInfo;
  }

  return false;
};

const saveUser = (userInfo) => {
  const { id, name } = userInfo;
  users[id] = userInfo;
};

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get('/', function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  const userInfo = getUserInfo(request);
  fastify.io.emit('hello');

  if (userInfo) {
    saveUser(userInfo);
    return reply.view('index.hbs', { userInfo, ...params });
  }

  return reply.view('register.hbs', { backUrl: '' });
});

fastify.get('/room/:roomId', function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    params = {
      seo: seo,
    };
  }

  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view('room.hbs', params);
});

fastify.get('/create', function (request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  const userInfo = getUserInfo(request);
  fastify.io.emit('hello');

  if (userInfo) {
    saveUser(userInfo);
    return reply.view('create.hbs', params);
  }

  return reply.view('register.hbs', { backUrl: 'create' });

  // The Handlebars template will use the parameter values to update the page with the chosen color
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post('/create', function (request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  // The Handlebars template will use the parameter values to update the page with the chosen color
  return reply.view('index.hbs', params);
});

// Run the server and report out to the logs
fastify.listen(
  { port: /*process.env.PORT*/ 3000, host: '0.0.0.0' },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    socketEvents(fastify.io);
  }
);

function socketEvents(io) {
  io.on('connection', (socket) => {
    console.log('Новый пользователь подключился');

    io.emit('hello');
    io.emit('rooms', rooms);

    io.on('message', (data) => {
      console.log('Получено сообщение от клиента:', data);
      io.emit('message', data);
    });

    io.on('getRoomInfo', (data) => {
      console.log('Получено сообщение от клиента:', data);
      io.emit('roomInfo', rooms);
    });

    io.on('disconnect', () => {
      console.log('Пользователь отключился');
    });
  });
}
