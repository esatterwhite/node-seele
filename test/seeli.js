'use strict'
const os = require('os')
const path = require('path')
const {test} = require('tap')
const cli = require('../')
const config = require('../lib/conf.js')
const Seeli = require('../lib/seeli.js')

const FIXTURE_DIR = path.join(__dirname, 'fixtures')

test('cli', async (t) => {
  t.test('config', async (t) => {
    const seeli = new Seeli()
    t.notOk(seeli.config('foobar'), 'initial value not set')
    seeli.config('foobar', 1)
    t.strictEqual(seeli.config('foobar'), 1, 'config value set')
  })

  t.test('#run', function(tt) {
    const help = cli.commands.get('help')
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

  t.test('color functions', async (t) => {
    const colors = [
      'red', 'blue', 'green'
    , 'yellow', 'bold', 'grey'
    , 'dim', 'black', 'magenta'
    , 'cyan', 'redBright', 'blueBright'
    , 'greenBright', 'yellowBright', 'cyanBright'
    ]

    for (const color of colors) {
      t.type(cli[color], Function, `${color} should be a top level function`)
    }
  })

  t.test('conf', async (t) => {
    t.test('should store default values', async (t) => {
      t.ok(cli.get('name'))
      t.ok(cli.get('color'))
      t.ok(cli.get('help'))
    })

    t.test('should allow arbitrary values', async (t) => {
      cli.set('test', 1)
      t.equal(cli.get('test'), 1)
    })

    t.test('should allow setting multiple values', async (t) => {
      cli.set({
        a: 1
      , b: 2
      , c: 3
      })

      t.equal(cli.get('a'), 1, 'a===1')
      t.equal(cli.get('b'), 2, 'b===2')
      t.equal(cli.get('c'), 3, 'c===3')
    })
  })

  t.test('#use', async (t) => {
    t.on('end', () => {
      cli.reset()
    })
    const TestCommand = new cli.Command()

    t.test('should allow commands to be registered by name', async (t) => {
      cli.use('test', TestCommand)
      t.notEqual(cli.list.indexOf('test'), -1)
    })

    t.test('#list', async (t) => {
      t.test('should return an array', async (t) => {
        t.ok(Array.isArray(cli.list))
      })

      t.test('should only list top level commands', async (t) => {
        t.notEqual(cli.list.indexOf('test'), -1)
        t.notEqual(cli.list.indexOf('help'), -1)
        t.equal(cli.list.indexOf('h'), -1)
        t.equal(cli.list.indexOf('he'), -1)
        t.equal(cli.list.indexOf('hel'), -1)
      })
    })
  })

  t.test('command errors bubble up', async (t) => {
    const runner = new cli.Seeli()
    const cmd = new cli.Command({
      name: 'foobar'
    , description: 'foobar'
    , async run() {
        const error = new Error('broke')
        error.code = 'EBROKE'
        throw error
      }
    })

    runner.use(cmd)
    runner.setOptions({
      args: ['foobar']
    })

    t.notOk(process.exitCode, 'exitCode not set')
    await runner.run()
    t.equal(process.exitCode, 1, 'exitCode set to 1')
    process.exitCode = undefined
  })

  t.test('unknown command sets exit code', async (t) => {
    const runner = new cli.Seeli()
    runner.setOptions({
      args: ['foobar']
    })

    t.notOk(process.exitCode, 'exitCode not set')
    await runner.run()
    t.equal(process.exitCode, 1, 'exitCode set to 1')
    process.exitCode = undefined
  })

  t.test('plugin loading', async (t) => {
    t.test('config loader', async (t) => {
      t.on('end', () => {
        config.set('plugins', [])
      })

      config.set('plugins', [
        path.join(FIXTURE_DIR, 'plugin-a.fixture')
      ])
      const seeli = new Seeli()
      t.strictEqual(seeli.get('plugin_a_fixture'), true, 'plugin path loaded')
    })

    t.test('require path loader', async (t) => {
      const seeli = new Seeli({
        plugins: [
          path.join(FIXTURE_DIR, 'plugin-b.fixture')
        ]
      })

      t.strictEqual(seeli.get('plugin_b_fixture'), true, 'plugin path loaded')
    })

    t.test('inline function loader', async (t) => {
      function inline(s) {
        const cmd = new Seeli({
          name: 'manual'
        })
        s.reset()
        s.set('inline_plugin', true)
        s.use(cmd)
      }

      const seeli = new Seeli({
        plugins: [inline]
      })

      t.strictEqual(seeli.get('inline_plugin'), true, 'inline plugin loaded')
      t.deepEqual(seeli.list(), ['manual'], 'registered command list')
    })

    t.test('explicit call', async (t) => {
      function outline(s) {
        const cmd = new Seeli({
          name: 'explicit'
        })
        s.reset()
        s.set('outline_plugin', true)
        s.use(cmd)
      }

      const seeli = new Seeli()
      seeli.plugin(outline)

      t.strictEqual(seeli.get('outline_plugin'), true, 'inline plugin loaded')
      t.deepEqual(seeli.list(), ['explicit'], 'registered command list')
    })

    t.test('invalid plugin type', async (t) => {
      t.throws(() => {
        return new Seeli({
          plugins: [1]
        })
      }, /invalid plugin. must be of type string or function. got number/i)
    })
  })

})
