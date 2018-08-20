const uuid = require('uuid/v4');
const File = require('./File.js');

class UploadSession {
    constructor() {
        this.id = uuid();
        this.files = new Map();
        this.watchers = new Map();
    }

    uploadFile({ fileName, chunk, size, chunkSize, currentHash }) {
        if (!this.files.has(fileName)) {
            this.files.set(fileName, new File({
                name : fileName,
                size,
                chunkSize,
                onUploaded     : (data) => {
                    this.watchers.forEach(watcher => watcher({ type : 'FINISH', data })); this.files.delete(fileName);
                },
                onUpdateStatus : (data) => {
                    this.watchers.forEach(watcher => watcher({ type : 'STATUS', data }));
                }
            }));
        }

        const file = this.files.get(fileName);
        return file.write(chunk, currentHash);
    }

    addWatcher(id, cb) {
        this.watchers.set(id, cb);
        console.log(this.watchers);
    }

    deleteWatcher(id) {
        this.watchers.delete(id);
    }
}

module.exports = UploadSession;

