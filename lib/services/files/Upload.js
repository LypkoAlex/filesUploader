const Base = require('../Base');
const clients = require('../clients.js');
const X = require('../../Exception.js');

module.exports =  class List extends Base {
    validate(params) {
        const rules = {
            fileSize    : ['required'],
            chunkSize   : ['required'],
            currentHash : ['required'],
            sessionId   : ['required'],
            fileName    : ['required'],
            chunk       : ['required']
        };

        return this.validator.validate(params, rules);
    }

    async execute({ fileSize, chunkSize, currentHash, sessionId, fileName, chunk }) {
        if (!clients.has(sessionId)) {
            throw new X({
                message : 'SESSION DOES NOT EXIST'
            });
        }

        const result = clients.get(sessionId).uploadFile({
            fileName,
            chunk,
            size : fileSize,
            chunkSize,
            currentHash
        });

        return { result };
    }
};
