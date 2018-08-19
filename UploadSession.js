const uuid = require('uuid/v4');
const File = require('./File.js');

class UploadSession {
  constructor() {
    this.id = uuid();
    this.files = new Map();
    this.watchers = [];
  }

  uploadFile({ fileName, chunk, size, chunkSize }) {
    if (!this.files.has(fileName)) {
      this.files.set(fileName, new File({
        name : fileName,
        size,
        chunkSize,
        onUploaded : () => { console.log('Done'); this.files.delete(fileName) },
        onUpdateStatus : (data) => { this.watchers.forEach(watcher => watcher(data)) }
      }))
    }

    const file = this.files.get(fileName)
    file.write(chunk)
  }

  addWatcher(cb) {
    this.watchers.push(cb)
  }
}

module.exports = UploadSession

