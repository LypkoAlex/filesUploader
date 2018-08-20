const uuid = require('uuid/v4');
const File = require('./File.js');

class UploadSession {
  constructor() {
    this.id = uuid();
    this.files = new Map();
    this.watchers = [];
  }

  uploadFile({ fileName, chunk, size, chunkSize, currentHash }) {
    if (!this.files.has(fileName)) {
      this.files.set(fileName, new File({
        name : fileName,
        size,
        chunkSize,
        onUploaded     : (data) => { this.watchers.forEach(watcher => watcher({ type : 'FINISH', data })); this.files.delete(fileName); },
        onUpdateStatus : (data) => { this.watchers.forEach(watcher => watcher({ type : 'STATUS', data })) }
      }))
    }

    const file = this.files.get(fileName);
    return file.write(chunk, currentHash);
  }

  addWatcher(cb) {
    this.watchers.push(cb)
  }
}

module.exports = UploadSession

