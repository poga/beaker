import * as yo from 'yo-yo'
import co from 'co'
import emitStream from 'emit-stream'

var keys

export function setup () {
}

export function show () {
  document.title = 'Following'
  co(function* () {
    keys = yield beakerFollowing.follows()
    console.log(keys)

    render()
  })
}

export function hide () {

}

function render () {
  if (!keys)
    return

  yo.update(document.querySelector('#el-content'),
    yo`<div class="pane" id="el-content"><h1>Following</h1>${JSON.stringify(keys)}</div>`)
}
