const services = require('../services');

module.exports = class Base {
    async run(actionName, { params }) {
        const [actionGroup, actionClass] = actionName.split('/');
        const result = await new services[actionGroup][actionClass]().run(params);

        return result;
    }
};
