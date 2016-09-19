import path from 'path'
import { app } from 'electron'
import rpc from 'pauls-electron-rpc'
import manifest from '../api-manifests/annotations'
import * as crypto from 'crypto'
import * as hyperdrive from 'hyperdrive'
import * as level from 'level'
import * as swarm from 'hyperdrive-archive-swarm'
import * as stringToStream from 'string-to-stream'
import * as streamToString from 'stream-to-string'
import zerr from 'zerr'

const ArchiveNotOpened = zerr('ArchiveNotOpened', 'Archive % must be opened before use')

// globals
// =
var db
var drive
var archives = {} // a list of archive which are being swarmed

export function setup () {
  var dbPath = path.join(app.getPath('userData'), 'Annotations')
  db = level(dbPath)
  drive = hyperdrive(db)

  rpc.exportAPI('beakerAnnotations', manifest, { add, find, open, close })
}

export function open (archiveKey) {
  return new Promise((resolve, reject) => {
    var archive
    var key = archiveKey
    if (key && archives[key]) return resolve(key)

    if (archiveKey) {
      archive = drive.createArchive(archiveKey)
      archives[key] = archive
      swarm(archive)
      resolve(key)
    } else {
      archive = drive.createArchive()
      key = archive.key.toString('hex')
      archives[key] = archive
      archive.finalize(() => {
        resolve(key)
      })
      swarm(archive)
    }
  })
}

export function close (archiveKey) {
  return new Promise((resolve, reject) => {
    open(archiveKey).then(key => {
      var archive = archives[key]

      if (!archive) return reject(new ArchiveNotOpened(archiveKey))

      archive.close(resolve)
      delete archives[archiveKey]
    })
  })
}

export function add (archiveKey, url, data) {
  return new Promise((resolve, reject) => {
    open(archiveKey).then(key => {
      var archive = archives[key]
      if (!archive) return reject(new ArchiveNotOpened(archiveKey))

      var ws = archive.createFileWriteStream(urlKey(url))
      ws.on('finish', resolve)
      ws.on('error', reject)
      stringToStream(data).pipe(ws)
    })
  })
}

export function find (archiveKey, url) {
  return new Promise((resolve, reject) => {
    open(archiveKey).then(key => {
      var archive = archives[key]
      if (!archive) return reject(new ArchiveNotOpened(archiveKey))

      var rs = archive.createFileReadStream(urlKey(url))
      streamToString(rs, (err, str) => {
        if (err && err.message !== 'Could not find entry') return reject(err)

        resolve({key: archiveKey, body: str})
      })
    })
  })
}

function urlKey (url) {
  return crypto.createHash('sha256').update(url).digest('base64')
}

