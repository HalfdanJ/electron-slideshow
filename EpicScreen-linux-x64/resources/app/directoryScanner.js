const fs = require('fs')
const path = require('path');
const util = require('util');

class DirectoryScanner {
    constructor(){
        this.path = ''
        this.files = []
    }

    startScanning(){
        this._interval = setInterval(() => this.scan(), 2000 );
    }

    scan(){
        //get visible files only
        this.files = fs.readdirSync(this.path)
            .filter(file => fs.statSync(path.join(this.path, file)).isFile() 
              && !(/(^|\/)\.[^\/\.]/g).test(file) )
            .map(f => path.join(this.path, f))
    }
}

module.exports = new DirectoryScanner()
