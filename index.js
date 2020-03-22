const express = require('express');
const path = require('path');

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const staticUrl = path.join(__dirname, 'public');
server.use(express.static(staticUrl));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
