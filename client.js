#!/usr/bin/env node
const { file, port, host, session } = require('optimist')
    .usage('Client for file upload.')
    .demand(['f', 's', 'h', 'p'])
    .alias('f', 'file')
    .alias('p', 'port')
    .alias('h', 'host')
    .alias('s', 'session')
    .argv
;
const fs = require('fs');
const request = require('request');
const qs = require('querystring');
const util = require('util');
const stat = util.promisify(fs.stat);

let data = '';
const chunkSize = 8

//let readStream = fs.createReadStream('file.txt', { highWaterMark : chunkSize });

//readStream.on('data', function(chunk) {
      //data += chunk;
      //readStream.pause()
      //request({
        //headers: {
          //'Content-Type': 'application/octet-stream'
        //},
        //url : 'http://localhost:3000/file',
        //method : 'POST',
        //body : chunk,
        //encoding: null
      //}, () => {
      //readStream.resume()
      //})
//}).on('end', function() {
//})

async function main() {
  const { size } = await stat(file);
  console.log(size)
  let readStream = fs.createReadStream(file, { highWaterMark : chunkSize });

  readStream.on('data', function(chunk) {
      console.log('lol')
      data += chunk;
      readStream.pause()
      const query = {
        fileSize : size,
        chunkSize
      }
      request({
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        url : `http://${host}:${port}/file/${session}/${file}` +'?' + qs.stringify(query),
        method : 'POST',
        body : chunk,
        encoding: null
      }, () => {
      readStream.resume()
      })
}).on('end', function() {
})
}

main()
