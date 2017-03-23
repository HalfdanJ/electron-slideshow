const {ipcRenderer} = require('electron')
const remote = require('electron').remote;

const readChunk = require('read-chunk');
const fileType = require('file-type');
const $ = require('jquery');

const Config = require('electron-config');
const config = new Config();

let index = 0;

$(document).ready(() => {
  let messageElm = $("#message");
  let messageSpanElm = $("#message-span");
  messageElm.val(config.get('message'))
  messageSpanElm.html(config.get('message') || '  ')
  
  messageElm.on('input',(val)=>{
    config.set('message', messageElm.val())    
    messageSpanElm.html(config.get('message') || '  ')
  })
})

function updateSlideshow(){
    ipcRenderer.once('list_files_reply', (event,arg)=>{
        index = (index + 1) % arg.length;
        showAsset(arg[index], () => this.updateSlideshow())

        // setTimeout(() => this.updateSlideshow(), duration);
    });

    ipcRenderer.send('list_files')
}

function getFileType(file){
    const buffer = readChunk.sync(file, 0, 262);
    return fileType(buffer);
}

function isImage(file){
    try {
        return getFileType(file).mime.match(/^image\//)
    } catch(e){
        return false
    }
}


function isVideo(file){
    try {
        return getFileType(file).mime.match(/^video\//)
    } catch(e){
        return false
    }
}

function showAsset(file, cb){
    const dom = $("#content");

    let windowAspect = window.outerWidth / window.outerHeight;

    dom.html("")
    if(isImage(file)){
        console.log("Image", file);

        let elm = $("<img>")
        // elm.addClass("fill-image")
        elm.attr("src",file);

        dom.append(elm)

        setTimeout(cb, 15000)
    }



    else if(isVideo(file)){
        console.log("video", file);

        let elm = $("<video>")
        elm.attr('autoplay', true)
        elm.attr('src', file)
        dom.append(elm)

        elm[0].onerror = cb
        elm[0].addEventListener('loadedmetadata', function() {
            console.log("duration",elm[0].duration);
        });

        elm[0].addEventListener('ended', function() {
            cb();
        }, false);


    }


    else {
        console.log(file, getFileType(file));
        cb()
    }
}


updateSlideshow()
