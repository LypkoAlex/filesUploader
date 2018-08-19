const express       = require('express')
const util          = require('util')
const fs            = require('fs');
const append        = util.promisify(fs.appendFile)
const bodyParser    = require('body-parser')
const uuidv4        = require('uuid/v4')
const UploadSession = require('./UploadSession.js')

const clients = {}

var app = express()
const expressWs = require('express-ws')(app);

app.use(bodyParser.raw({inflate: true}));
app.post('/file/:sessionId/:fileName', async function ({ query, params, body }, res, next) {
  const { chunkNumber, fileSize, chankHash, chunkSize } = query
  const { sessionId, fileName } = params
  if (!clients[sessionId]) {
    return res.send(400, 'session doesnt exist');
  }
  clients[sessionId].uploadFile({ fileName, chunk : body, size : fileSize, chunkSize})

  res.send(200)
})

app.ws('/', function(ws, req) {
    const session = new UploadSession();
    session.addWatcher((data) => {
      ws.send(data)
    })
    clients[session.id] = session;
    ws.send(JSON.stringify({ session : session.id}))
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
})
