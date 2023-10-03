import initSketch from './sketch.js';
const mediaSourceOptions = ['local', 'thp', 'unsplash', 'pexels'];
let mediaSource = mediaSourceOptions[0];

init();

function init() {
  let mediaOptionContainer = document.getElementById('options--image');

  // Create select input
  let mediaSelector = document.createElement("select");
  mediaSelector.setAttribute("name", "mediaSelector");
  mediaSelector.setAttribute("id", "media_selector");
  mediaSelector.addEventListener("change", handleMediaChoice);
  for (let j = 0; j < mediaSourceOptions.length; j++) {
     let option = document.createElement("option");
     option.setAttribute("value", mediaSourceOptions[j]);
     option.innerHTML = mediaSourceOptions[j]
     mediaSelector.appendChild(option);
  }
  mediaOptionContainer.appendChild(mediaSelector);

  // Display local images
  

  // Replace button
  let btn = document.querySelector('#button--action button');
  btn.innerHTML = "Get image";
  btn.addEventListener("click", fetchMedia);
}

function handleMediaChoice(event) {
  mediaSource = event.target.value;
}

function fetchMedia() {
  let url = 'http://localhost:3000/media';

  fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({mediaSource})
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      initSketch(data.media);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

}
