const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messaageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template',
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    userName: message.userName,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    userName: message.userName,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messaageFormInput.value = '';
    $messaageFormInput.focus();

    // Acknowledgement
    if (error) {
      return console.log(error);
    }
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Location not supported');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  let location = {};

  navigator.geolocation.getCurrentPosition((position) => {
    location.longitude = position.coords.longitude;
    location.latitude = position.coords.latitude;

    // Acknowledgement
    socket.emit('sendLocation', location, () => {
      $sendLocationButton.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { userName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
