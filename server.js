const express         = require('express');
const util            = require('util');
const fs              = require('fs');
const append          = util.promisify(fs.appendFile);
const bodyParser      = require('body-parser')
const uuidv4          = require('uuid/v4');

const UploadSession   = require('./lib/UploadSession.js');
const asyncMiddleware = require('./utils/asyncMiddleware');

const app       = express();
const expressWs = require('express-ws')(app);

const clients = {};

app.use(bodyParser.raw({inflate: true}));

app.post('/file/:sessionId/:fileName', async function ({ query, params, body }, res) {
  const { fileSize, chunkSize, currentHash } = query;
  const { sessionId, fileName } = params;
  if (!clients[sessionId]) {
    return res.send(400, 'SESSION DOES NOT EXIST');
  }

  const result = clients[sessionId].uploadFile({
    fileName,
    chunk : body,
    size : fileSize,
    chunkSize,
    currentHash 
  })

  res.send(200, result)
})

app.ws('/', function(ws, req) {
    ws.on('message', message => {
      const data = JSON.parse(message)
      if (data.type === 'INIT') {
        if (data.session) {
          if (!clients[data.session]) {
            ws.send(JSON.stringify({
              type : 'INFO',
              data : {
                msg : `SESSION ${data.session} DOES NOT EXIST` 
              }
            }))
            return ws.close()
          } else {
            clients[data.session].addWatcher((data) => {
              ws.send(JSON.stringify(data))
            })
          }
        } else {
          const session = new UploadSession();
          session.addWatcher((data) => {
            ws.send(JSON.stringify(data))
          });
          clients[session.id] = session;
          ws.send(JSON.stringify({ type : 'INIT', data : { session : session.id } }))
        }
      }
    })
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
})
