const socket = io();

const formAddWord =  document.getElementById('form-add-word');
const formWord =  document.getElementById('form-word');
const usersElem = document.getElementById('users');
const btnAddWordElem = document.getElementById('btn-add-word');
const inputAddWordElem = document.getElementById('input-add-word');

socket.on('hello', () => {
    console.log('hello');
});

socket.emit('connection');


const roomId = btnAddWordElem.dataset.roomId;
socket.on(`roomUpdate${roomId}`, (data) => {

    const {room, user} = data;

    console.log('rooms update', room);
   // usersElem.innerHTML = `<div class="admin"><span></span><span>${admin.name}</span></div>`;
    usersElem.innerHTML = '';

    Object.values(room.users).forEach((user) => {
        usersElem.innerHTML += `
         <div class="user"><span></span><span>${user.name}</span><span>${user.word ? 'готов!' : ''}</span></div>
      `;
    });
});

btnAddWordElem.addEventListener('click', () => {
    const word  = inputAddWordElem.value;

    if (word) {
        formAddWord.style.display = 'none';
        formWord.style.display = 'block';
        formWord.querySelector('#your-word').innerHTML = word;

        const userId = btnAddWordElem.dataset.userId;
        const roomId = btnAddWordElem.dataset.roomId;

        if (userId && roomId) {
           socket.emit('addWord', {word, userId, roomId});
        }
    }
})
