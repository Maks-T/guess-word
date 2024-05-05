const {initFastify} = require('./initFastify');
const {generateId} = require('./helpers/');

const STATUS_GAME = {
    START: 1,
    READY: 2,
    RUN: 3
}

class App {
    users = {};
    teams = {};

    constructor() {
        this.fastify = initFastify();
    }

    runServer = () => {
        this.initEndpoints();


        this.fastify.listen(
            {port: /*process.env.PORT*/ 3000, host: '0.0.0.0'},
            (err, address) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                console.log(`Your app is listening on ${address}`);

                this.initSocket();
            }
        );

    }

    initSocket = () => {
        this.fastify.io.on('connection', (socket) => {
            console.log('Пользователь подключился');

            socket.emit('hello');

            socket.on('disconnect', () => {
                console.log('Пользователь отключился');
            });

            socket.on('addUser', (userInfo) => {

                const userInfoAdded = this.addUser(userInfo)
                socket.emit('addUser', userInfoAdded);
                console.log('Пользователь добавлен', userInfo);
            });

            socket.on('getTeam', (teamId) => {

                const team = this.teams[teamId];

                if (team) {
                    socket.emit(`changeTeam${teamId}`, team);
                }
            });

            socket.on('getTeams', () => {
                    socket.emit(`changeTeams`, this.teams);
            });

        });
    }


    initEndpoints = () => {
        this.initPageIndex();
        this.initPageTeams();
        this.initPageTeamCreate();
        this.initPageTeamLink();
        this.initPageTeam();
        this.initPageTeamAddWord();
    }

    initPageIndex = () => {
        this.fastify.get('/', function (request, reply) {
            return reply.view('index.hbs', {});
        });
    }

    initPageTeams = () => {
        this.fastify.get('/teams', (request, reply) => {

            return this.getUserInfo(request)
                ? reply.view('teams.hbs', {})
                : reply.view('register.hbs', {});
        });
    }

    initPageTeamCreate = () => {
        this.fastify.get('/team_create', (request, reply) => {

            return this.getUserInfo(request)
                ? reply.view('team_create.hbs', {})
                : reply.view('register.hbs', {});
        });

        this.fastify.post('/team_create', (request, reply) => {

            const userInfo = this.getUserInfo(request);

            if (!userInfo) {
                return reply.send({status: 'error'});
            }

            const {name, isPrivate} = request.body;

            const admin = {...this.users[userInfo.id]}; //?

            const id = this.addTeam(name, isPrivate, admin);

            return reply.send({status: 'success', id});
        });
    }

    initPageTeam = () => {
        this.fastify.get('/team/:id', (request, reply) => {
            const id = request.params.id ?? null;

            if (!id) return reply.redirect('/teams');

            const team = this.teams[id];

            if (!team) return reply.redirect('/teams');

            const userInfo = this.getUserInfo(request);

            if (!userInfo) return reply.view('register.hbs', {});

            const user = this.users[userInfo.id];

            if (!team.users[user.id]) {
                team.users[user.id] = {...user};

                this.fastify.io.emit(`changeTeam${id}`, team);
                this.fastify.io.emit(`changeTeams`, this.teams);
            }

            const params = {
                teamId: id,
                userFullName: `${userInfo.name} ${userInfo.surname[0]}.`,
                teamName: team.name
            };

            const teamUser = team.users[user.id];

            if (!teamUser.addWord) {
                return reply.view('team_add_word.hbs', params);
            }


            return reply.view('team.hbs', params);
        });
    }

    initPageTeamAddWord = () => {

        this.fastify.post('/team/:id/add_word', (request, reply) => {

            const userInfo = this.getUserInfo(request);

            if (!userInfo) {
                return reply.send({status: 'error', message: 'user not registered'}); //ToDo error code
            }

            const {word, id} = request.body;


            const team = this.teams[id];

            if (!team) {
                return reply.send({status: 'error', message: "team does't exist"}); //ToDo error code
            }

            const user = this.users[userInfo.id]

            const teamUser = team.users[user.id];

            teamUser.addWord = word;

            this.fastify.io.emit(`changeTeam${id}`, team);


            return reply.send({status: 'success', id});
        });
    }

    initPageTeamLink = () => {
        this.fastify.get('/team/:id/link', (request, reply) => {
            const id = request.params.id ?? null;

            if (!id) return reply.redirect('/teams');

            const team = this.teams[id];

            if (!team) return reply.redirect('/teams');

            const userInfo = this.getUserInfo(request);

            if (!userInfo) reply.view('register.hbs', {});

            const protocol = request.protocol;
            const hostname = request.hostname;

            const serverUrl = `${protocol}://${hostname}`;

            const params = {
                teamId: id,
                userFullName: `${userInfo.name} ${userInfo.surname[0]}.`,
                link: `${serverUrl}/team/${id}`,
                teamName: team.name
            };

            return reply.view('team_link.hbs', params);
        });
    }

       getUserInfo = (request) => {
        const {cookies} = request;

        if (cookies && cookies.userInfo) {
            const userInfo = JSON.parse(cookies.userInfo);

            if (!this.users[userInfo.id]) {
                this.users[userInfo.id] = userInfo;
            }

            if (userInfo.id && userInfo.name && userInfo.surname) return userInfo;
        }

        return false;
    }

    addUser = (userInfo) => {
        const id = generateId();
        const timestamp = Date.now();
        userInfo.id = id;
        userInfo.timestamp = timestamp;

        this.users[id] = userInfo;


        return userInfo;
    }

    addTeam = (name, isPrivate, admin) => {
        const id = generateId();
        const timestamp = Date.now();

        this.teams[id] = {
            name,
            id,
            timestamp,
            isPrivate,
            status: STATUS_GAME.START,
            adminId: admin.id,
            users: {[admin.id]: admin}
        }

        this.fastify.io.emit(`changeTeams`, this.teams);

        return id;
    }


}

module.exports = {App};