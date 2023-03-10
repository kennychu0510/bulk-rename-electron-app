import { app, BrowserWindow, dialog, ipcMain, ipcRenderer, shell } from "electron";
import path from "path";
import fs from "fs";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1000,
    width: 1300,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.whenReady().then(() => {
  createWindow();
  let parentDir: undefined | string = undefined;
  let selectedDir: undefined | string = undefined;
  ipcMain.handle("selectDir", () => {
    const directory = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
      defaultPath: parentDir,
    });
    if (directory && directory.length > 0) {
      selectedDir = directory[0];
      parentDir = selectedDir.split(path.sep).slice(0, -1).join(path.sep);
    }
    if (selectedDir) {
      const files = fs.readdirSync(selectedDir);
      const fileSummary = new Map<string, number>()

      for (let file of files) {
        const ext = path.extname(file)
        if (ext) {
          fileSummary.set(ext,(fileSummary.get(ext) || 0) + 1)
        }
        else if (fs.lstatSync(path.join(selectedDir,file)).isDirectory()) {
          fileSummary.set('folder',(fileSummary.get('folder') || 0) + 1)
        } else {
          fileSummary.set(file,(fileSummary.get(file) || 0) + 1)
        }
      }
      return { selectedDir, files, fileSummary };
    }
  });

  ipcMain.handle("renameFiles", (event, options: RenameFilesArg) => {
    if (!selectedDir) return;
    const { filesToRename } = options;
    // fs.readdirSync(selectedDir).forEach(file => {
    //   if (ignoreList.includes(file)) {
    //     return
    //   }
    //   const oldPath = path.join(selectedDir!, file)
    //   const newPath = path.join(selectedDir!, `${prefix}${file}${suffix}`)
    //   fs.renameSync(oldPath, newPath)
    // })
    for (let file of filesToRename) {
      if (file.old === file.new) continue;
      const oldPath = path.join(selectedDir, file.old);
      const newPath = path.join(selectedDir, file.new);
      fs.renameSync(oldPath, newPath);
    }

    shell.openPath(selectedDir);
    const files = fs.readdirSync(selectedDir);
    return { files };
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
