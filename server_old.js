

class Server {

}

const users = {};
const teams = {}


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

    const isteams = Object.keys(teams).length;

    if (userInfo) {
        saveUser(userInfo);
        return reply.view('index.hbs', {userInfo, isteams, ...params});
    }

    return reply.view('register.hbs', {backUrl: ''});
});

fastify.get('/team/:teamId', function (request, reply) {
    // params is an object we'll pass to our handlebars template
    let params = {seo: seo};

    const teamId = request.params.teamId ?? null;
    if (!teamId) return reply.redirect('/');

    const team = teams[teamId] ?? null;
    if (!team) return reply.redirect('/');

    const userInfo = getUserInfo(request);
    fastify.io.emit('hello');

    if (userInfo) {
        saveUser(userInfo);

        if (!team.users[userInfo.id]) {
            team.users[userInfo.id] = {...userInfo}
        }

        const user = team.users[userInfo.id];
        user.isAdmin = user.id === team.admin.id

        const data = {team, user};


        fastify.io.emit(`teamUpdate${teamId}`, data);

        return reply.view('team.hbs', data);
    }

    return reply.view('register.hbs', {backUrl: `/team/${teamId}`, ...params});
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

    teams[id] = {
        id, name, admin, users: {}
    }

    // The Handlebars template will use the parameter values to update the page with the chosen color
    return reply.redirect(`/team/${id}`);
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
        socketEvents(fastify);
    }
);

function socketEvents(fastify) {
    fastify.io.on('connection', (socket) => {
        console.log('Новый пользователь подключился');

        socket.emit('hello');
        socket.emit('teams', teams); //ToDo only index page

        socket.on('getteam', (data) => {
            const {teamId} = data;

            if (teamId) {
                const team = teams[teamId];
                console.log(`teamUpdate${teamId}`, team)
                team && fastify.io.emit(`teamUpdate${teamId}`, {team});
            }
        });

        socket.on('addWord', (data) => {
            const {word, userId, teamId} = data;
            const team = teams[teamId];
            const user = team.users[userId] ?? null;

            if (user) {
                user.word = word;

                console.log(`teamUpdate${teamId}`, team)
                fastify.io.emit(`teamUpdate${teamId}`, {team});
            }

        });

        socket.on('startGame', (data) => {
            const {teamId} = data;
            const team = teams[teamId];

            team.isStart = true;

            fastify.io.emit(`teamUpdate${teamId}`, {team});
        });

        socket.on('disconnect', () => {
            console.log('Пользователь отключился');
        });
    });
}
