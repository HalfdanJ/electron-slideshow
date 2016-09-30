const fs = require('fs')
const path = require('path');

class DirectoryScanner {
    constructor(){
        this.path = ''
        this.files = []
    }

    startScanning(){
        this._interval = setInterval(() => this.scan(), 2000 );
    }

    scan(){
        fs.readdir(this.path, (err, files) => {
            files = files.map((f) => path.join(this.path, f));
            this.files = files;
        })
    }
}

module.exports = new DirectoryScanner()
