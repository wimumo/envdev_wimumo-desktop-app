// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

 // Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
                'get-iplocal', 'toggle-reruteo', 'ping-ip', 
                'Add-RerouteAddress', 'Remove-RerouteAddress', 
                'save-config', 'save-options', //Estas ultimas dos guardan los datos en disco
                'startStopWimumoSimulator'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                'osc','iplocal', 
                'ping-result', 'savedRedirectConfig', 'savedOptions' //Estas ultimas dos recuperan la informacion de disco
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);
