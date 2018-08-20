const fs      = require('fs');
const path    = require('path');
const request = require('request');
const qs      = require('querystring');
const util    = require('util');
const crypto  = require('crypto');
const stat    = util.promisify(fs.stat);

class FileUploader {
    constructor({ url, filePath, chunkSize, statusHandler }) {
        this.url       = url;
        this.path      = filePath;
        this.fileName  = path.parse(filePath).base;
        this.chunkSize = chunkSize || 128;
        this.headers   = {
            'Content-Type' : 'application/octet-stream'
        };
        this.statusHandler = statusHandler;
    }

    uploadChunk(chunk, { url, query }, cb) {
        return request({
            url : `${url}/${this.fileName}?${qs.stringify(query)}`,
            method : 'POST',
            body : chunk,
            encoding : null,
            headers : this.headers
        }, (err, res, data) => {
            if (err || res.statusCode !== 200) {
                throw  data.toString();
            }
            this.statusHandler(JSON.parse(data).result);
            cb();
        });
    }

    upload() {
        return new Promise(async (res) => {
            const { size } = await stat(this.path);
            this.size = size;
            this.readStream = fs.createReadStream(this.path, { highWaterMark : this.chunkSize });
            this.readStream.on('data', chunk => {
                const hash = crypto.createHash('md5');
                hash.update(chunk);

                const query = {
                    chunkSize   : this.chunkSize,
                    fileSize    : size,
                    currentHash : hash.digest('hex')
                };
                this.readStream.pause();
                this.uploadChunk(chunk, { url : this.url, query }, () => this.readStream.resume());
            });

            this.readStream.on('end', () => res());
        });
    }
}

module.exports = FileUploader;

