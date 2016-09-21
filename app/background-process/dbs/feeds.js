import { app } from 'electron'
import path from 'path'
import manifest from '../api-manifests/feeds'
import rpc from 'pauls-electron-rpc'
import sqlite3 from 'sqlite3'
import { cbPromise } from '../../lib/functions'
import { setupDatabase2 } from '../../lib/bg/sqlite-tools'
import * as normalize from 'normalize-url'

// globasl
// =
var db
var migrations
var setupPromise

export function setup () {
  var dbPath = path.join(app.getPath('userData'), 'Feeds')
  db = new sqlite3.Database(dbPath)
  setupPromise = setupDatabase2(db, migrations, '[Feeds]')

  // wire up RPC
  rpc.exportAPI('beakerFeeds', manifest, {add, remove, update, all, fetchAll, fetch})
}

export function add (rssURL) {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('INSERT INTO feeds (url) VALUES (?)', [normalize(rssURL)], cb)
  }))
}

export function update (rssURL, visits) {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('UPDATE feeds SET visit = ? WHERE url = ?', [visits, normalize(rssURL)], cb)
  }))
}

export function remove (rssURL) {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('DELETE feeds WHERE url = ?', [normalize(rssURL)], cb)
  }))
}

export function all () {
  return setupPromise.then(v => cbPromise(cb => {
    db.run('SELECT * FROM feeds', cb)
  }))
}

export function fetchAll () {
  // TODO fetch all rss url
}

export function fetch (rssURL) {
  // TODO fetch and parse specified rss feeds
}

export function search (keyword) {
  // TODO search with sqlite fts
}

migrations = [
  function (cb) {
    db.exec(`
      CREATE TABLE feeds(
        url NOT NULL,
        visit DEFAULT 0,
        last_fetched_at DateTime
      );
      CREATE INDEX feeds_url ON feeds (url);
      CREATE TABLE articles(
        rss_url NOT NULL,
        url NOT NULL,
        title NOT NULL,
        description NOT NULL,
      );
      CREATE INDEX articles_url ON articles (url);
      CREATE VIRTUAL TABLE article_fts USING fts4(
        url,
        title,
        description
      );
      PRAGMA user_version = 1;
    `, cb)
  }
]
