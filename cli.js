#! /usr/bin/env node
var async = require('async')
var validateConfig = require('./lib/validateConfig')
var should = require('should')
var inspect = require('eyespect').inspector()
var assert = require('assert')
var fs = require('fs')
var optimist = require('optimist')
var nconf = require('nconf')
var argv = optimist.demand(['config', 'docsDir']).argv
var configFilePath = argv.config
var docsDir = argv.docsDir
assert.ok(fs.existsSync(configFilePath), 'config file not found at path: ' + configFilePath)
assert.ok(fs.existsSync(docsDir), 'docsDir direcotry not found at path: ' + docsDir)
var config = nconf.argv().env().file({file: configFilePath})
var update = require('./update')
var path = require('path')
var cradleNconf = require('cradle-nconf')
function sync(callback) {
  var couch = config.get('couch')
  if (!couch) {
    return callback({
      error: 'a "couch" section must be specified in your config file json'
    })
  }
  validateConfig(couch, function (err, reply) {
    if (err) { return callback(err) }
    var db = cradleNconf(config)
    getDocs(docsDir, function (err, files) {
      async.forEach(
        files,
        function(file, cb) {

          var filePath = file.filePath
          inspect(filePath, 'updating document at path')
          var docPath = '_design/' + file.fileName.replace(/\.js/,'')
          var doc = require(filePath)
          inspect(docPath, 'docPath')
          console.log(doc, 'Into update')
          update(db, docPath, doc, cb)
        },
        callback
      )
    })
  })
}
sync(function (err) {
  should.not.exist(err, 'error updating document: ' + JSON.stringify(err, null, ' '))
  inspect('done syncing design docs')
})


function getDocs(docsDir, cb) {
  docsDir = path.resolve(docsDir)
  fs.readdir(docsDir, function (err, fileNames) {
    if (err) {
      inspect(err, 'error reading document files at path: ' + docsDir)
      return cb(err)
    }
    var files = fileNames.map(function (fileName) {
      var filepath = path.join(docsDir, fileName)
      var output = {
        fileName: fileName,
        filePath: filepath
      }
      return output
    })
    if (files.length === 0) {
      inspect(docsDir, 'warning, no files where found in the docsDir you specified')
    }
    inspect(files,'files')
    return cb(null, files)
  })
}
