const btnStartGameElem = document.getElementById('btn-start-game');
const btnLeaveTeamElem = document.getElementById('btn-leave-team');
const btnQuitGameElem = document.getElementById('btn-quit-game');
const usersElem = document.getElementById('users');
const teamId = document.getElementById('team-id').value;


const STATUS_GAME = {
    START: 1,
    READY: 2,
    RUN: 3
}


const userInfo = getCookie('userInfo');

const curUser = JSON.parse(userInfo);

const showNeedBtn = (team, isAdmin) => {
    if (isAdmin && team.status === STATUS_GAME.READY) {
        btnStartGameElem.style.display = 'flex';
    } else if (!isAdmin && team.status !== STATUS_GAME.RUN) {
        btnLeaveTeamElem.style.display = 'flex';
    }
     else if (!isAdmin && team.status === STATUS_GAME.RUN) {
        btnQuitGameElem.style.display = 'flex';
        btnLeaveTeamElem.style.display = 'none';
     }
    else {
        btnStartGameElem.style.display = 'none';
    }

}

handleQuitTeam = (userId, teamId) => {
    socket.emit('removeUserTeam', {userId, teamId});

    location.replace('/teams');
}

btnLeaveTeamElem.addEventListener('click', () => handleQuitTeam(curUser.id, teamId));
btnQuitGameElem.addEventListener('click', () => handleQuitTeam(curUser.id, teamId));

socket.on(`changeTeam${teamId}`, (team) => {

    const isAdmin = curUser.id === team.adminId;
    showNeedBtn(team, isAdmin);

    renderTeam(team, usersElem, isAdmin);
});

socket.emit('getTeam', teamId);

socket.on(`removeUserTeam${teamId}${curUser.id}`, () => {
    location.replace('/teams');
});

btnStartGameElem.addEventListener('click', () => {
    socket.emit('runGame', teamId);
});


function renderTeam(team, rootElem, isAdmin) {
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

            if (isAdmin && team.adminId !== user.id) {
                const userIconRemoveElem = document.createElement('span');
                userIconRemoveElem.classList.add('user__icons_icon','remove');
                userIconsElem.append(userIconRemoveElem);

                userIconRemoveElem.addEventListener('click', () => {

                    socket.emit('removeUserTeam', {userId: user.id, teamId: team.id});
                })
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
                userWordElem.innerHTML = curUser.id === user.id ? '???' : user.word;

                userElem.append(userMainElem, userWordElem);
            }

            rootElem.append(userElem);

        });
    }
}

function removeUserFromTeam(teamId, userId) {
    const url = `/team/${teamId}/remove_user`;
    const data = {
        id: userId
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {

            if (data.status === 'success') {

            } else {

            }

            btnSaveElem.disabled = true;

        })
        .catch(error => {
            console.error('Error:', error);
        });
}








