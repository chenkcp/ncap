// COM 接口通信封装

const dataCallbacks = []

export const sendToCom = async (port, data) => {
  if (window.electronAPI?.sendToCom) {
    return await window.electronAPI.sendToCom(port, data)
  }
  console.warn('COM API not available')
  return false
}

export const sendJsonToCom = async (port, data) => {
  const jsonStr = JSON.stringify(data)
  return sendToCom(port, jsonStr)
}

export const onComData = (callback) => {
  dataCallbacks.push(callback)
  
  if (dataCallbacks.length === 1 && window.electronAPI?.onComData) {
    window.electronAPI.onComData((data) => {
      dataCallbacks.forEach(cb => cb(data))
    })
  }
}

export const offComData = (callback) => {
  const index = dataCallbacks.indexOf(callback)
  if (index > -1) {
    dataCallbacks.splice(index, 1)
  }
  
  if (dataCallbacks.length === 0 && window.electronAPI?.removeComListener) {
    window.electronAPI.removeComListener()
  }
}

export const offAllComData = () => {
  dataCallbacks.length = 0
  if (window.electronAPI?.removeComListener) {
    window.electronAPI.removeComListener()
  }
}

export class ComService {
  constructor(port) {
    this.port = port
    this.callbacks = []
  }

  async send(data) {
    return sendToCom(this.port, data)
  }

  async sendJson(data) {
    return sendJsonToCom(this.port, data)
  }

  onData(callback) {
    this.callbacks.push(callback)
    onComData(callback)
  }

  offData(callback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
    offComData(callback)
  }

  destroy() {
    this.callbacks.forEach(cb => offComData(cb))
    this.callbacks = []
  }
}

export default {
  sendToCom,
  sendJsonToCom,
  onComData,
  offComData,
  offAllComData,
  ComService,
}
