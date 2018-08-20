const fs = require('fs');
const util = require('util');
const rename = util.promisify(fs.rename)
const stream = require('stream');
const crypto = require('crypto');
const path = require('path');

class File {
  constructor({ name, size, chunkSize, onUploaded, onUpdateStatus }) {
    this.name = name
    this.onUploaded = onUploaded
    this.onUpdateStatus = onUpdateStatus
    this.size = size
    this.chunksNumber = size % chunkSize === 0 ? size / chunkSize : ~~(size / chunkSize) + 1
    this.status = 0
    this.chunkSize = chunkSize
    this.currentChunksNumber = 0
    this.writebleStream = fs.createWriteStream('./files/' + this.name)
    this.hashsum = crypto.createHash('md5')
  }

  finish() {
    this.onUploaded({ file : this.name, hash : this.hashsum.digest('hex') })
  }

  write(chunk, currentHash) {
    const hash = crypto.createHash('md5')
    if (hash.update(chunk).digest('hex') !== currentHash) throw 'CHUNK IS CORRUPTED.';
    if (this.status === 100) throw 'FILE ALREADY UPLOADED.'

    this.currentChunksNumber += 1;
    this.status = (100 / this.chunksNumber) * this.currentChunksNumber;

    this.onUpdateStatus({
      file : this.name,
      status : this.status
    });

    this.writebleStream.write(chunk);
    this.hashsum.update(chunk);

    if (this.chunksNumber === this.currentChunksNumber) {
     this.finish()
    }
    return this.status;
  }
}

module.exports = File
