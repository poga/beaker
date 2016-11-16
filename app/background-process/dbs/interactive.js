import nel from 'nel'
import uuid from 'uuid'
import manifest from '../api-manifests/internal/interactive'
import { internalOnly } from '../../lib/bg/rpc'
import rpc from 'pauls-electron-rpc'

// globals
// =
var sessions = {}

// exported methods
// =

export function setup () {
  rpc.exportAPI('beakerInteractive', manifest, { init, run }, internalOnly)
}

export function init () {
  return new Promise(resolve => {
    var id = uuid.v4()
    sessions[id] = new nel.Session()
    resolve(id)
  })
}

export function run (id, code) {
  return new Promise((resolve, reject) => {
    sessions[id].execute(code, {onSuccess: resolve, onError: reject})
  })
}
