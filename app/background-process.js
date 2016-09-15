// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron'
import log from 'loglevel'
import env from './env'

import * as beakerBrowser from './background-process/browser'
import * as plugins from './background-process/plugins'
import * as webAPIs from './background-process/web-apis'
import * as windows from './background-process/ui/windows'
import buildWindowMenu from './background-process/ui/window-menu'
import registerContextMenu from './background-process/ui/context-menu'
import * as downloads from './background-process/ui/downloads'
import * as settings from './background-process/dbs/settings'
import * as sitedata from './background-process/dbs/sitedata'
import * as bookmarks from './background-process/dbs/bookmarks'
import * as history from './background-process/dbs/history'
import * as following from './background-process/dbs/following'
import * as annotations from './background-process/drives/annotations'

import * as beakerProtocol from './background-process/protocols/beaker'
import * as beakerFaviconProtocol from './background-process/protocols/beaker-favicon'

import * as openURL from './background-process/open-url'

import * as co from 'co'

// configure logging
log.setLevel('trace')

// load the installed protocols
plugins.registerStandardSchemes()

app.on('ready', function () {
  // databases
  settings.setup()
  sitedata.setup()
  bookmarks.setup()
  history.setup()
  following.setup()
  annotations.setup()
  // open followed archives
  co(function* () {
    var follow = yield following.follows()
    if (follow.length === 0 || follow.every(f => { return f.own === 0 })) {
      yield following.initOwn()
      follow = yield following.follows()
    }

    yield follow.map(k => { return annotations.open(k.key) })
  })

  // base
  beakerBrowser.setup()

  // ui
  Menu.setApplicationMenu(Menu.buildFromTemplate(buildWindowMenu(env)))
  registerContextMenu()
  windows.setup()
  downloads.setup()

  // protocols
  beakerProtocol.setup()
  beakerFaviconProtocol.setup()
  plugins.setupProtocolHandlers()

  // web APIs
  webAPIs.setup()
  plugins.setupWebAPIs()

  // listen OSX open-url event
  openURL.setup()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('open-url', function (e, url) {
  openURL.open(url)
})

