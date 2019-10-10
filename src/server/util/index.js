const {
  readdirSync
} = require('fs')
const {
  join
} = require('path')

const filenameRegex = /(.+?)\.js$/

function requireDirToArray (path) {
  const content = []
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content.push(require(join(path, files[i])))
  }

  return content
}

function requireDirToObject (path) {
  const content = {}
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(join(path, files[i]))
  }

  return content
}

module.exports = {
  requireDirToArray,
  requireDirToObject
}
