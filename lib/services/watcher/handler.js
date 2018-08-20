const uuidv4 = require('uuid/v4');

const { storagePath } = require('../../../etc/config.json');
const clients         = require('../clients.js');
const UploadSession   = require('../../UploadSession.js');

module.exports = function(ws) {
    ws.id = uuidv4();
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'INIT') {
            if (data.session) {
                if (!clients.has(data.session)) {
                    ws.send(JSON.stringify({
                        type : 'INFO',
                        data : {
                            msg : `SESSION ${data.session} DOES NOT EXIST`
                        }
                    }));
                    return ws.close();
                }
                clients.get(data.session).addWatcher((msg) => {
                    ws.send(JSON.stringify(msg));
                });

            } else {
                const session = new UploadSession({
                    storagePath
                });
                session.addWatcher(ws.id, (msg) => {
                    ws.send(JSON.stringify(msg));
                });
                clients.set(session.id, session);
                ws.send(JSON.stringify({ type : 'INIT', data : { session : session.id } }));
            }
        }
    });
    ws.on('close', () => {
        clients.forEach(client => {
            if (client.watchers.has(ws.id)) client.watchers.delete(ws.id);
        });
    });
};

