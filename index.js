const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

const staticUrl = path.join(__dirname, 'public');
server.use(express.static(staticUrl));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
})

server.get('/dither', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/dither.html'));
})

server.post('/media', async (req, res) => {
  try {
    let src = req.body.mediaSource;
    let media;

    switch (src) {
      case 'local':
        res.json({ status: 'success', media: 'img/rosa.jpg'});
        break;
      case 'thp':
        res.json({ status: 'success', media: 'thp'});
        break;
      case 'unsplash':
        getUnsplashMedia(res);
        break;
      case 'pexels':
        res.json({ status: 'success', media: 'pexels'});
        break;
      default:
        res.json({ status: 'fail', message: 'Could not find any media at this source'});
    }
  } catch (e) {
    console.log(e.message);
  }
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

async function getUnsplashMedia(response) {
  fetch('https://api.unsplash.com/photos/random', {
    method: 'GET',
    headers: {
      'Accept-Version': 'v1',
      'Authorization': 'Client-ID 7f_eSTG8ot-QZxbfzfwFjA92bt9cc6HQN1KmILAGSFQ'
    },
  })
  .then(res => res.json())
  .then(json => {
    response.status(200).json({ status: 'success', media: json.urls.raw });
  })
  .catch(err => {
    console.log(err.message);
  });
}
