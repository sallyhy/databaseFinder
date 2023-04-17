import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { fetchData, fetchTotalConns, showDatabases, showTables, executeSql, executeParams, addConn, updateConn, deleteConn, createConnection } from './Database'
import {getTabs, setTabs, increatCounter, getCounter} from './Constant'
import {getKey, setKey} from './StorageService'
// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
console.log(process.contextIsolated)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('database', {
      fetchData, fetchTotalConns, showDatabases, showTables, executeSql, executeParams, addConn, updateConn, deleteConn, createConnection
    })
    contextBridge.exposeInMainWorld('constant', {
      getTabs, setTabs, increatCounter, getCounter
    })
    contextBridge.exposeInMainWorld('storage', {
      getKey, setKey
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}