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
        <div class="s-section links-list">${renderFollowingList()}</div>
      </div>
    </div>`)
}

function renderFollowingList () {
  return yo`<div>
      ${keys.map(k => {
        return yo`<div class="ll-row">
          <div class="ll-link">${k.key}</div>
          <div class="ll-actions">${k.own === 1 ? yo`<b>own</b>` : yo`<span class="icon icon-cancel-squared" onclick=${onClickDelete(k.key)}></span>`}</div>
        </div>`
      })}
    </div>`
}

function onClickDelete (key) {
  return () => {
    co(function * () {
      yield beakerFollowing.remove(key)

      keys = yield beakerFollowing.follows()
      render()
    })
  }
}
