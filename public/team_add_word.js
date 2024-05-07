const btnSaveElem = document.getElementById('btn-save');
const wordElem = document.querySelector('[name="word"]');
const teamId = document.getElementById('team-id').value;

const userInfo = getCookie('userInfo');

const curUser = JSON.parse(userInfo);


socket.emit('getTeam', teamId);
socket.on(`removeUserTeam${teamId}${curUser.id}`, () => {
    location.replace('/teams');
});

const handleInputs = () => {
    if (!wordElem.value) {
        btnSaveElem.disabled = true;
    }

    if (wordElem.value) {
        btnSaveElem.disabled = false;
    }
}

wordElem.addEventListener('input', handleInputs);

btnSaveElem.addEventListener('click', () => {
    btnSaveElem.disabled = true;

    const teamId = btnSaveElem.dataset.teamId;

    const url = `/team/${teamId}/add_word`;
    const data = {
        word: wordElem.value,
        id: teamId
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

            console.log(data)
            if (data.status === 'success') {
                location.reload();
            } else {
                //To handle errors
                location.replace('/teams');
            }

            btnSaveElem.disabled = true;

        })
        .catch(error => {
            console.error('Error:', error);
        });
});