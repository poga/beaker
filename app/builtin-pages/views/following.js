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
    yo`<div class="pane" id="el-content">
      <div class="settings">
        <div class="ll-heading">Following</div>
        <div class="s-section">${renderFollowingList()}</div>
      </div>
    </div>`)
}

function renderFollowingList () {
  return yo`<div>
      ${keys.map(k => { return yo`<div>${k.key}</div>` })}
    </div>`
}
