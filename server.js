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

const {generateId} = require('./src/helpers/index.js');

fastify.register(require('@fastify/cookie'), {decodeValues: true});

fastify.register(require('fastify-socket.io'), {});

const users = {};

const rooms = {}

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
    const {cookies} = request;

    // Проверяем наличие параметра name в куках
    if (cookies && cookies.userInfo) {
        const userInfo = JSON.parse(cookies.userInfo);
        // Если параметр name существует, возвращаем главную страницу
        if (userInfo.id && userInfo.name) return userInfo;
    }

    return false;
};

const saveUser = (userInfo) => {
    const {id, name} = userInfo;
    users[id] = {...users[id] ?? [], ...userInfo};

    console.log('saveUser', userInfo, users)
};

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get('/', function (request, reply) {
    // params is an object we'll pass to our handlebars template
    let params = {seo: seo};

    const userInfo = getUserInfo(request);
    fastify.io.emit('hello');

    const isRooms = Object.keys(rooms).length;
    if (userInfo) {
        saveUser(userInfo);
        return reply.view('index.hbs', {userInfo, isRooms, ...params});
    }

    return reply.view('register.hbs', {backUrl: ''});
});

fastify.get('/room/:roomId', function (request, reply) {
    // params is an object we'll pass to our handlebars template
    let params = {seo: seo};

    const roomId = request.params.roomId ?? null;
    if (!roomId) return reply.redirect('/');

    const room = rooms[roomId] ?? null;
    if (!room) return reply.redirect('/');

    const userInfo = getUserInfo(request);
    fastify.io.emit('hello');

    if (userInfo) {
        saveUser(userInfo);

        if (!room.users[userInfo.id]) {
            room.users[userInfo.id] = {...userInfo}
        }

        const user = room.users[userInfo.id];

        const data = {room, user};

        fastify.io.emit(`roomUpdate${roomId}`, data);

        return reply.view('room.hbs', data);
    }

    return reply.view('register.hbs', {backUrl: `/room/${roomId}`, ...params});
});


fastify.get('/create', function (request, reply) {
    // Build the params object to pass to the template
    let params = {seo: seo};

    const userInfo = getUserInfo(request);
    fastify.io.emit('hello');

    if (userInfo) {
        saveUser(userInfo);
        return reply.view('create.hbs', {userInfo, ...params});
    }

    return reply.view('register.hbs', {backUrl: '/create'});

    // The Handlebars template will use the parameter values to update the page with the chosen color
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post('/create', function (request, reply) {
    console.log(request.body);

    // Build the params object to pass to the template
    let params = {seo: seo};

    const {name, adminId} = request.body;

    const id = generateId();

    const admin = users[adminId];

    rooms[id] = {
        id, name, admin, users: {}
    }

    // The Handlebars template will use the parameter values to update the page with the chosen color
    return reply.redirect(`/room/${id}`);
});

// Run the server and report out to the logs
fastify.listen(
    {port: /*process.env.PORT*/ 3000, host: '0.0.0.0'},
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
    io.on('connection', (io) => {
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

        io.on('addWord', (data) => {
            const {word, userId, roomId} = data;
            const room = rooms[roomId];
            const user = room.users[userId] ?? null;

            if (user) {
                user.word = word;

                console.log(`roomUpdate${roomId}`, room)
                fastify.io.emit(`roomUpdate${roomId}`, {room});
            }


        });

        io.on('disconnect', () => {
            console.log('Пользователь отключился');
        });
    });
}
