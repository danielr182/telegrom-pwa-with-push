let swReg;

if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      swReg = reg;
      swReg.pushManager.getSubscription().then(verifySubscription);
    });
  });
}

const notyf = new Notyf({
  duration: 2000,
  ripple: false,
  position: {
    x: 'center',
    y: 'bottom',
  },
  types: [
    {
      type: 'general',
      background: 'black',
      dismissible: true,
    },
    {
      type: 'online',
      background: 'black',
      icon: {
        className: 'far fa-smile',
        tagName: 'i',
        color: 'white',
      },
    },
    {
      type: 'offline',
      background: 'black',
      duration: 0,
      dismissible: true,
      icon: {
        className: 'far fa-angry',
        tagName: 'i',
        color: 'white',
      },
    },
  ],
});

const googleMapKey = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';

// Google Maps llaves alternativas - desarrollo
// AIzaSyDyJPPlnIMOLp20Ef1LlTong8rYdTnaTXM
// AIzaSyDzbQ_553v-n8QNs2aafN9QaZbByTyM7gQ
// AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8
// AIzaSyCroCERuudf2z02rCrVa6DTkeeneQuq8TA
// AIzaSyBkDYSVRVtQ6P2mf2Xrq0VBjps8GEcWsLU
// AIzaSyAu2rb0mobiznVJnJd6bVb5Bn2WsuXP2QI
// AIzaSyAZ7zantyAHnuNFtheMlJY1VvkRBEjvw9Y
// AIzaSyDSPDpkFznGgzzBSsYvTq_sj0T0QCHRgwM
// AIzaSyD4YFaT5DvwhhhqMpDP2pBInoG8BTzA9JY
// AIzaSyAbPC1F9pWeD70Ny8PHcjguPffSLhT-YF8

// Jquery references

const title = $('#title');
const newBtn = $('#new-btn');
const exitBtn = $('#exit-btn');
const cancelBtn = $('#cancel-btn');
const postBtn = $('#post-btn');
const avatarSel = $('#selection');
const timeline = $('#timeline');

const modal = $('#modal');
const modalAvatar = $('#modal-avatar');
const avatarBtns = $('.selection-avatar');
const txtMessage = $('#txtMessage');

const btnActivated = $('.btn-noti-activated');
const btnDisabled = $('.btn-noti-disabled');

const btnLocation = $('#location-btn');
const modalMap = $('.modal-map');
const btnTakePhoto = $('#take-photo-btn');
const btnPhoto = $('#photo-btn');
const cameraContainer = $('.camera-container');

let lat = null;
let lng = null;
let photo = null;

// The user, contains the selected hero ID
let user;

// Init camera
const camera = new Camera(document.getElementById('player'));

function createMessageHTML(message, character, lat, lng, photo) {
  let content = `
  <li class="animated fadeIn fast"
      data-user="${character}"
      data-message="${message}"
      data-type="message">

      <div class="avatar">
          <img src="img/avatars/${character}.jpg">
      </div>
      <div class="bubble-container">
          <div class="bubble">
              <h3>@${character}</h3>
              <br/>
              ${message}
              `;

  if (photo) {
    content += `
              <br>
              <img class="photo-message" src="${photo}">
      `;
  }

  content += `</div>        
              <div class="arrow"></div>
          </div>
      </li>
  `;

  // If the latitude and length exist,
  // We call the function to create the map
  if (lat) {
    createMessageMap(lat, lng, character);
  }

  // We delete latitude and length in case you used them
  lat = null;
  lng = null;

  $('.modal-map').remove();

  timeline.prepend(content);
  cancelBtn.click();
}

function createMessageMap(lat, lng, character) {
  const content = `
  <li class="animated fadeIn fast"
      data-type="map"
      data-user="${character}"
      data-lat="${lat}"
      data-lng="${lng}">
              <div class="avatar">
                  <img src="img/avatars/${character}.jpg">
              </div>
              <div class="bubble-container">
                  <div class="bubble">
                      <iframe
                          width="100%"
                          height="250"
                          frameborder="0" style="border:0"
                          src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                          </iframe>
                  </div>
                  
                  <div class="arrow"></div>
              </div>
          </li> 
  `;

  timeline.prepend(content);
}

// Globals
function logIn(ingreso) {
  if (ingreso) {
    newBtn.removeClass('hidden');
    exitBtn.removeClass('hidden');
    timeline.removeClass('hidden');
    avatarSel.addClass('hidden');
    modalAvatar.attr('src', 'img/avatars/' + user + '.jpg');
  } else {
    newBtn.addClass('hidden');
    exitBtn.addClass('hidden');
    timeline.addClass('hidden');
    avatarSel.removeClass('hidden');

    title.text('Select character');
  }
}

// Character selection
avatarBtns.on('click', function () {
  user = $(this).data('user');

  title.text('@' + user);

  logIn(true);
});

// Exit button
exitBtn.on('click', function () {
  logIn(false);
});

// New message button
newBtn.on('click', function () {
  modal.removeClass('hidden');
  modal.animate(
    {
      marginTop: '-=1000px',
      opacity: 1,
    },
    200
  );
});

// Cancel Message button
cancelBtn.on('click', function () {
  if (!modal.hasClass('hidden')) {
    modal.animate(
      {
        marginTop: '+=1000px',
        opacity: 0,
      },
      200,
      function () {
        modal.addClass('hidden');
        txtMessage.val('');
      }
    );
  }
});

// Send message button
postBtn.on('click', function () {
  const message = txtMessage.val();
  if (message.length === 0) {
    cancelBtn.click();
    return;
  }

  fetch('api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      user,
      lat,
      lng,
      photo,
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.log('Error postBtn: ', err));

  createMessageHTML(message, user, lat, lng, photo);
  photo = null;
});

function getMessages() {
  fetch('api')
    .then((res) => res.json())
    .then((posts) => {
      posts.forEach((post) => createMessageHTML(post.message, post.user, post.lat, post.lng, post.photo));
    });
}

getMessages();

function isOnline() {
  notyf.dismissAll();
  if (navigator.onLine) {
    notyf.open({ type: 'online', message: 'Online' });
  } else {
    notyf.open({ type: 'offline', message: 'Offline' });
  }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

// Notifications
function verifySubscription(activated) {
  if (activated) {
    btnActivated.removeClass('hidden');
    btnDisabled.addClass('hidden');
  } else {
    btnDisabled.removeClass('hidden');
    btnActivated.addClass('hidden');
  }
}

function cancelSubscription() {
  swReg.pushManager.getSubscription().then((subs) => {
    subs.unsubscribe().then(() => verifySubscription(false));
  });
}

function sendNotification() {
  const notificationConfig = { body: 'Notification Body', icon: 'img/icons/icon-72x72.png' };
  const notification = new Notification('Title', notificationConfig);
}

function notifyWe() {
  if (!window.Notification) {
    console.log('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('Hey there! - Granted');
  } else if (Notification.permission !== 'denied' || Notification.permission === 'default') {
    Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        new Notification('Hey there! - Granted');
        return;
      }
      console.log(permission);
    });
  }
}

// notifyWe();

// Get Key
function getPublicKey() {
  return fetch('api/key')
    .then((res) => res.arrayBuffer())
    .then((key) => new Uint8Array(key));
}

btnDisabled.on('click', () => {
  if (!swReg) return console.log('There is no SW register');

  getPublicKey().then((key) => {
    swReg.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: key })
      .then((res) => res.toJSON())
      .then((subscripton) => {
        fetch('api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscripton),
        })
          .then(verifySubscription(subscripton))
          .catch(cancelSubscription);
      });
  });
});

btnActivated.on('click', () => {
  if (!swReg) return console.log('There is no SW register');

  cancelSubscription();
});

// Create map in the modal
function showModalMap(lat, lng) {
  $('.modal-map').remove();

  const content = `
          <div class="modal-map">
              <iframe
                  width="100%"
                  height="250"
                  frameborder="0"
                  src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                  </iframe>
          </div>
  `;

  modal.append(content);
}

// Obtain geolocation
btnLocation.on('click', () => {
  if (navigator.geolocation) {
    notyf.success({ message: 'Loading map', type: 'general' });
    navigator.geolocation.getCurrentPosition((pos) => {
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      showModalMap(lat, lng);
    });
  }
});

// Camera button
btnPhoto.on('click', () => {
  cameraContainer.removeClass('hidden');
  camera.turnOn();
});

// Photo button
btnTakePhoto.on('click', () => {
  photo = camera.takePhoto();
  camera.turnOff();
});

// Share API
if (navigator.share) {
  timeline.on('click', 'li', (e) => {
    const dataset = e.currentTarget.dataset;
    let lat = dataset.lat;
    let lng = dataset.lng;
    let message = dataset.message;
    let type = dataset.type;
    let user = dataset.user;

    const shareConfig = {
      title: user,
      text: message,
    };

    if (type === 'map') {
      (shareConfig.text = 'Map'), (shareConfig.url = `https://www.google.com/maps/@${lat},${lng},15z`);
    }

    navigator
      .share(shareConfig)
      .then(() => console.log('Successful share'))
      .catch((err) => console.log('Error sharing', err));
  });
}
