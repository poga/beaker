import { app } from 'electron'
import path from 'path'
import manifest from '../api-manifests/following'
import rpc from 'pauls-electron-rpc'
import sqlite3 from 'sqlite3'
import { cbPromise } from '../../lib/functions'
import { setupDatabase2 } from '../../lib/bg/sqlite-tools'
import log from '../../log'
import * as annotations from '../drives/annotations'

// globals
// =
var db
var migrations
var setupPromise

export function setup () {
  var dbPath = path.join(app.getPath('userData'), 'Following')
  db = new sqlite3.Database(dbPath)
  setupPromise = setupDatabase2(db, migrations, '[FOLLOWING]')

  // wire up RPC
  rpc.exportAPI('beakerFollowing', manifest, { add, remove, follows, initOwn })
}

export function initOwn () {
  return setupPromise.then(v => cbPromise(cb => {
    annotations.open().then(key => {
      db.run('INSERT INTO following (key, own) VALUES (?, ?)', [key, true], cb)
    })
  }))
}

export function add (key) {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('INSERT INTO following (key) VALUES (?)', [key], cb)
  }))
}

export function remove (key) {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('DELETE FROM following WHERE key = ?', [key], cb)
  }))
}

export function follows () {
  return setupPromise.then(v => cbPromise(cb => {
    db.all('SELECT * FROM following', cb)
  }))
}

migrations = [
  function (cb) {
    db.exec(`
      CREATE TABLE following(
        key NOT NULL,
        own DEFAULT 0,
        name
      );
      CREATE INDEX following_key ON following (key);
      PRAGMA user_version = 1;
    `, cb)
  }
]
