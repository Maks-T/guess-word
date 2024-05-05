const btnAddTeamElem = document.getElementById('btn-start-game');
const usersElem = document.getElementById('users');
const teamId = document.getElementById('team-id').value;

const STATUS_GAME = {
    START: 1,
    READY: 2,
    RUN: 3
}

socket.on(`changeTeam${teamId}`, (team) => {

    console.log(team)

    renderTeam(team, usersElem);
});

socket.emit('getTeam', teamId);



function renderTeam(team, rootElem) {
    if (Object.values(team.users).length) {
        usersElem.innerHTML = '';

        Object.values(team.users).forEach((user, i) => {

            const userElem = document.createElement('div');
            userElem.classList.add('user');

            const userMainElem = document.createElement('div');
            userMainElem.classList.add('user__main');


            const userInfoElem = document.createElement('div');
            userInfoElem.classList.add('user__info');

            userInfoElem.innerHTML = `
            <div class="user__number">${i+1}.</div>
            <div class="user__avatar"><img src="${user.avatar}" alt=""></div>
            <div class="user__name">${user.name}</div><div class="user__surname">${user.surname[0]}.</div>
        `;

            const userIconsElem = document.createElement('div');
            userIconsElem.classList.add('user__icons');

            if (true/*isAdmin*/) {
                const userIconRemoveElem = document.createElement('span');
                userIconRemoveElem.classList.add('user__icons_icon','remove');
                userIconRemoveElem.dataset.userId = user.id;
                userIconsElem.append(userIconRemoveElem);
            }

            const userIconStatusElem = document.createElement('span');
            userIconStatusElem.classList.add('user__icons_icon', 'status');

            if (user.addWord) {
                userIconStatusElem.classList.add('ready');
            }

            userIconsElem.append(userIconStatusElem);

            userMainElem.append(userInfoElem, userIconsElem);

            userElem.append(userMainElem);

            if (team.status === STATUS_GAME.RUN && user.word) {
                const userWordElem = document.createElement('div');
                userWordElem.classList.add('user__word');
                userWordElem.innerHTML = user.word;


                userElem.append(userMainElem, userWordElem);
            }

            rootElem.append(userElem);
        });
    }
}








