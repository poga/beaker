/* globals beakerInteractive */
require('codemirror/mode/javascript/javascript')

const CodeMirror = require('codemirror')

var sid
beakerInteractive.init().then(id => { sid = id })
function run () {
  var code = document.querySelector('#editor').value
  beakerInteractive.run(sid, code).then(console.log)
}

document.querySelector('a').addEventListener('click', run)

console.log('load')
var cm = CodeMirror.fromTextArea(
  document.querySelector('textarea'),
  {
    lineNumbers: true,
    mode: "javascript"
  })

