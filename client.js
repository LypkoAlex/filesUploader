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

const Multiprogress = require('multi-progress');
const multi = new Multiprogress(process.stderr);

const bar = multi.newBar(` Uploading ${file} [:bar] :percent`, {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total:  100
});

let status = 0;

const statusHandler = (fileStatus) => {
    fileStatus = parseInt(fileStatus);
    if (status < fileStatus) {
        bar.tick(fileStatus - status);
        status = fileStatus;
    }
};

const FileUploader = require('./lib/FileUploader.js');

async function main() {
    const uploader = new FileUploader({
        url : `http://${host}:${port}/file/${session}`,
        filePath : file,
        statusHandler : (s) => statusHandler(s)
    });

    await uploader.upload();
}

main().catch(console.log);
