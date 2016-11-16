// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, protocol } from 'electron'
import log from 'loglevel'

import * as beakerBrowser from './background-process/browser'
import * as plugins from './background-process/plugins'
import * as webAPIs from './background-process/web-apis'

import * as windows from './background-process/ui/windows'
import buildWindowMenu from './background-process/ui/window-menu'
import registerContextMenu from './background-process/ui/context-menu'
import * as downloads from './background-process/ui/downloads'
import * as permissions from './background-process/ui/permissions'

import * as archives from './background-process/dbs/archives'
import * as settings from './background-process/dbs/settings'
import * as sitedata from './background-process/dbs/sitedata'
import * as bookmarks from './background-process/dbs/bookmarks'
import * as history from './background-process/dbs/history'
import * as interactive from './background-process/dbs/interactive.js'

import * as beakerProtocol from './background-process/protocols/beaker'
import * as beakerFaviconProtocol from './background-process/protocols/beaker-favicon'
import * as datProtocol from './background-process/protocols/dat'

import * as openURL from './background-process/open-url'

// read config from env vars
log.setLevel(process.env.beaker_log_level || 'info')
if (process.env.beaker_user_data_path) {
  console.log('User data path set by environment variables')
  console.log('userData:', process.env.beaker_user_data_path)
  app.setPath('userData', process.env.beaker_user_data_path)
}

// load the installed protocols
plugins.registerStandardSchemes()
protocol.registerStandardSchemes(['dat'])
protocol.registerSecureSchemes(['dat'])

app.on('ready', function () {
  // databases
  archives.setup()
  settings.setup()
  sitedata.setup()
  bookmarks.setup()
  history.setup()
  interactive.setup()

  // base
  beakerBrowser.setup()

  // ui
  Menu.setApplicationMenu(Menu.buildFromTemplate(buildWindowMenu()))
  registerContextMenu()
  windows.setup()
  downloads.setup()
  permissions.setup()

  // protocols
  beakerProtocol.setup()
  beakerFaviconProtocol.setup()
  datProtocol.setup()
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

