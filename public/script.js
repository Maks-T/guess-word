const serverUrl = window.location.href;

const socket = io();

const roomsElem = document.getElementById('rooms');

socket.on('hello', () => {
  console.log('hello');
});

socket.emit('connection');

socket.on('rooms', (rooms) => {
  console.log('rooms update');

  Object.values(rooms).forEach((room) => {
    roomsElem.innerHTML += `       
        <div class="room">
          <p>${room.name}</p>
          <a href="/room/${room.id}">войти</a>
        </div>
      `;
  });

});
