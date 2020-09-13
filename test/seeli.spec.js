'use strict'
const os = require('os')
const {test} = require('tap')
const cli = require('../')

test('cli', function(t) {
  t.test('color functions', function(tt) {
    const colors = [
      'red', 'blue', 'green'
    , 'yellow', 'bold', 'grey'
    , 'dim', 'black', 'magenta'
    , 'cyan', 'redBright', 'blueBright'
    , 'greenBright', 'yellowBright', 'cyanBright'
    ]
    for (const color of colors) {
      tt.type(cli[color], Function, `${color} should be a top level function`)
    }
    tt.end()
  })

  t.test('conf', function(tt) {
    tt.test('should store default values', (ttt) => {
      ttt.ok(cli.get('name'))
      ttt.ok(cli.get('color'))
      ttt.ok(cli.get('help'))
      ttt.end()
    })

    tt.test('should allow arbitrary values', (ttt) => {
      cli.set('test', 1)
      ttt.equal(cli.get('test'), 1)
      ttt.end()
    })

    tt.test('should allow setting multiple values', (ttt) => {
      cli.set({
        a: 1
      , b: 2
      , c: 3
      })

      ttt.equal(cli.get('a'), 1, 'a===1')
      ttt.equal(cli.get('b'), 2, 'b===2')
      ttt.equal(cli.get('c'), 3, 'c===3')
      ttt.end()
    })

    tt.end()
  })

  t.test('#use', function(tt) {
    tt.on('end', () => {
      cli.reset()
    })
    const TestCommand = new cli.Command()

    tt.test('should allow commands to be registered by name', function(ttt) {
      cli.use('test', TestCommand)
      ttt.notEqual(cli.list.indexOf('test'), -1)
      ttt.end()
    })

    tt.test('#list', function(ttt) {
      ttt.test('should return an array', function(tttt) {
        tttt.ok(Array.isArray(cli.list))
        tttt.end()
      })

      ttt.test('should only list top level commands', function(tttt) {
        tttt.notEqual(cli.list.indexOf('test'), -1)
        tttt.notEqual(cli.list.indexOf('help'), -1)
        tttt.equal(cli.list.indexOf('h'), -1)
        tttt.equal(cli.list.indexOf('he'), -1)
        tttt.equal(cli.list.indexOf('hel'), -1)
        tttt.end()
      })

      ttt.end()
    })

    tt.end()
  })

  t.test('#run', function(tt) {
    const help = cli.commands.help
    help.once('content', (data) => {
      if (/usage/i.test(data)) {
        const expected = [
          'Usage:  runner <command> [options]'
        , ''
        , 'Where <command> is the name the command to execute'
        , '*  help - Displays information about available commands'
        ].join(os.EOL)
        tt.equal(data, expected)
        tt.end()
      }
    })

    help.setOptions({
      args: ['--no-color']
    })

    cli.set({
      exitOnContent: false
    , name: 'runner'
    })
    cli.run()
  })

  t.end()
})
