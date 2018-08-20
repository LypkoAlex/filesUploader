const express     = require('express');
const bodyParser  = require('body-parser');

const { appPort }   = require('./etc/config.json')[process.env.ENV];
const promiseRouter = require('./lib/PromiseRouter.js');
const getRoutes     = require('./lib/routers');
const routes        = getRoutes();
const watcher       = require('./lib/services/watcher');
const router        = promiseRouter(express.Router);

const app = express();
require('express-ws')(app);

app.use(bodyParser.raw({inflate: true}));

app.use(router);

router.postAsync('/file/:sessionId/:fileName', routes.files.upload.bind(routes.files));

router.ws('/', watcher.handler);

if (process.env.ENV === 'live') {
    app.listen(appPort, function () {
        console.log(`listening on port ${appPort}`);
    });
}

module.exports = app;
