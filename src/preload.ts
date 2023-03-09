// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, dialog, ipcRenderer } from "electron";



contextBridge.exposeInMainWorld('electronAPI', {
  selectDir: () => ipcRenderer.invoke('selectDir'),
  renameFiles: (options: RenameFilesArg) => ipcRenderer.invoke('renameFiles', options)
})