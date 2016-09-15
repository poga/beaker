import { app } from 'electron'
import path from 'path'
import manifest from '../api-manifests/following'
import rpc from 'pauls-electron-rpc'
import sqlite3 from 'sqlite3'
import { cbPromise } from '../../lib/functions'
import { setupDatabase2 } from '../../lib/bg/sqlite-tools'
import log from '../../log'

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
  rpc.exportAPI('beakerFollowing', manifest, { add, remove, follows })
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
    console.log('SELECT key FROM following')
    db.all('SELECT key FROM following', cb)
  }))
}

migrations = [
  function (cb) {
    db.exec(`
      CREATE TABLE following(
        key NOT NULL
      );
      CREATE INDEX following_key ON following (key);
      PRAGMA user_version = 1;
    `)
  }
]
