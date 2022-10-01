const express = require('express')
const app = express()
const http = require('http');
const fs = require('fs');
const path = require('path');

function makeServer() {
  const server = http.createServer(app);

  server.listen("9000", ()=> {
    console.log('Server is started')
  })
  
  
  app.get('/', (req, res) => {
    let text_data = fs.readFileSync(path.resolve(__dirname, 'testText.txt'));
    res.end(text_data);
  })
  return server;
}

module.exports = {
  makeServer
};