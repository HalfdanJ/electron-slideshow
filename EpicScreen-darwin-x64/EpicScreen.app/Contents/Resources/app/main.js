const electron = require('electron')
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron
const Config = require('electron-config');
const config = new Config();

const directoryScanner = require('./directoryScanner.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 1200, height: 600})

    win.setFullScreen(true);

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
    //win.webContents.openDevTools()

    const ret = electron.globalShortcut.register('Escape', function(){
        console.log('Escape is pressed');
        minimizeWindow();
    })

    console.log('config.path: '+config.get("path"));

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    app.on('will-quit', function(){

        electron.globalShortcut.unregister('Escape');

        electron.globalShortcut.unregisterAll();
    });

}

function minimizeWindow(){

    win.setFullScreen(false);
    console.log(win);

}

function createMenu(){

    let template = [{
        label: "Epic Screen",
        submenu: [
            {
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    }, {
        label: "File",
        submenu: [
            {
                label:"Select folder",
                click (item, focusedWindow) {
                    selectFolder()
                }
            },
            {
                label:"Toggle debug",
                click (item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            }
        ]
    } ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function selectFolder(){
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (files) {
        if(files){
            config.set("path", files[0])
            app.emit("folder_selected")
        }
    })
}

ipcMain.on('list_files', (event,arg)=> {
    event.sender.send('list_files_reply', directoryScanner.files)
})

app.on('folder_selected', ()=>{
    directoryScanner.path = config.get("path");
    directoryScanner.scan();

    if(!win){
        createWindow()
        directoryScanner.startScanning()
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=> {
    createMenu();

    if(!config.get("path")){
        selectFolder();
    } else {
        createWindow();
        directoryScanner.path = config.get("path");
        directoryScanner.scan();
        directoryScanner.startScanning()
    }
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})
