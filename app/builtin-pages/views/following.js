import * as yo from 'yo-yo'
import co from 'co'
import emitStream from 'emit-stream'

var keys = []

export function setup () {

}

export function show () {
  document.title = 'Following'
  co(function* () {
    keys = yield beakerFollowing.keys()
    console.log(keys)

    render()
  })
}

export function hide () {

}

function render () {
  yo.update(document.querySelector('#el-content'),
    yo`<div><h1>Following</h1>${JSON.stringify(keys)}</div>`)
}
