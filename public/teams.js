const btnAddTeamElem = document.getElementById('btn-add-team');
const teamsElem = document.getElementById('teams');

const STATUS_GAME = {
    START: 1,
    READY: 2,
    RUN: 3
}

socket.on(`changeTeams`, (teams) => {
    renderTeams(teams, teamsElem);
});

socket.emit('getTeams');

function renderTeams(teams, rootElem) {
    if (Object.values(teams).length) {
        teamsElem.innerHTML = '';

        Object.values(teams).sort((a, b) => a.isPrivate - b.isPrivate).forEach((team) => {
            const isUnavailable = team.isPrivate || team.status === STATUS_GAME.RUN;

            const teamElem = document.createElement(isUnavailable  ? 'div': 'a');
            teamElem.classList.add('team');

            if (!isUnavailable) {
                teamElem.href=`/team/${team.id}`;
            }

            if (team.status === STATUS_GAME.RUN) {
                teamElem.classList.add('run');
            }

            const teamHeadingElem = document.createElement('div');
            teamHeadingElem.classList.add('team__heading');

            const teamNameElem = document.createElement('span');
            teamNameElem.classList.add('team__name');
            teamNameElem.innerHTML = team.name;

            const teamLockElem = document.createElement('span');
            teamLockElem.classList.add('team__lock', team.isPrivate ? 'lock': 'unlock');

            teamHeadingElem.append(teamNameElem,  teamLockElem);

            const teamAvatarsElem = document.createElement('div');
            teamAvatarsElem.classList.add('team__avatars');

            Object.values(team.users).forEach(user => {
                const teamAvatarElem = document.createElement('span');
                teamAvatarElem.classList.add('team__avatar');

                const teamAvatarImgElem = document.createElement('img');
                teamAvatarImgElem.src = user.avatar;

                teamAvatarElem.append(teamAvatarImgElem);
                teamAvatarsElem.append(teamAvatarElem);
            });

            const teamPeopleElem = document.createElement('div');
            teamPeopleElem.classList.add('team__peoples');
            teamPeopleElem.innerHTML = `${Object.values(team.users).length} peoples`;

            teamElem.append(teamHeadingElem, teamAvatarsElem, teamPeopleElem);

            rootElem.append(teamElem);
        });
    }
}



