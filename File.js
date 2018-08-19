const fs = require('fs');
const util = require('util');
const rename = util.promisify(fs.rename)
const stream = require('stream');
const crypto = require('crypto');

class File {
  constructor({ name, size, chunkSize, onUploaded, onUpdateStatus }) {
    this.name = name
    this.onUploaded = onUploaded
    this.onUpdateStatus = onUpdateStatus
    this.size = size
    this.chunksNumber = size % chunkSize === 0 ? size / chunkSize : ~~(size / chunkSize) + 1
    this.status = 0
    this.chunkSize = chunkSize
    this.chunks = []
    this.writebleStream = fs.createWriteStream('/tmp/'+this.name)
    console.log(this)
  }

  finish() {
    this.onUploaded()
  }

  write(chunk) {
    if (this.status === 100) throw 'File uploaded.'
    const hash = crypto.createHash('md5').update(chunk).digest('hex')
    if(this.chunks.includes(hash)) throw 'chunkExist'
    this.chunks.push(chunk)
    this.status = (100 / this.chunksNumber) * this.chunks.length
    this.onUpdateStatus(JSON.stringify({ file : this.name, status : this.status}))
    this.writebleStream.write(chunk)
    if (this.chunksNumber === this.chunks.length) {
     this.finish() 
    }
  }
}

module.exports = File
