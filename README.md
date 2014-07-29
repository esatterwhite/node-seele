node-seeli ( C-L-I )
======================

Object orientated, event driven CLI module


```js
var cli = require("seeli")
 var Test = new cli.Command({
	description:"diaplays a simple hello world command"
	,usage:[
		"Usage: cli hello --interactive",
		"Usage: cli hello --name=john",
		"Usage: cli hello --name=john --name=marry --name=paul -v screaming"
	]
	,flags:{
		name:{
			type:[ String, Array ]
			,shorthand:'n'
			,description:"The name of the person to say hello to"
		}
		,excited: {
			type:Boolean
			,shorthand: 'e'
			,description:"Say hello in a very excited manner"
			,default:false
		}
		,volume:{
			type:String
			,choices:['normal', 'screaming']
			,default:'normal'
			,shorthand:'v'
		}
	}
	,run: function( cmd, data, cb ){
		var out = [];

		for( var x =0; x< data.name.length; x++ ){
			var value = "Hello, " + data.name[x]
			if( data.excited ){
				value += '!'
			}
			out.push( value );

		}
		out = out.join('\n');

		out = data.value == 'screaming' ? out.toUpperCase() : out;
		cb( null, out );
	}
});
cli.use('test', Test)
cli.run();
```

now you will have a fully functional test command with help and an interactive walk through

```
node cli.js help test 
node cli.js test --help
node cli.js test --interactive
node cli.js test --name=mark --name=sally --no-excited
```

## Options

name | type | default | description
-----|:-----:|--------|-------------
**description** | `String` |  `""`
**args** | `Array` | `null`
**interactive** | `Boolean` | `true`
**usage** | `String` / `Array` | `""`
**flags** | `Object` | `{}`
**run** | `Function` | `no-op`

### Flag Options

* **type** ( required ): The type of input that is expected. Boolean types to not expect input. The present of the flag implies `true`. Additionally, boolean flags allow for `--no-<flag>` to enforce `false`. If you want to accept muliple values, you specify type as an array with the first value being the type you which to accept. For example `[String, Array ]` means you will accept multiple string values.
* **descrption**: a description of the flag in question. 
* **shorthand**: An options short hand flag that will be expanded out to the long hand flag.
* **default**: A value to return if the flag is omitted.
* **choices**: Used only during an interactive command. Restricts the users options only to the options specified
* **skip**: if set to `true` this flag will be omitted from the interactive command prompts
* **event**: if set to `true` the command will emit an event withe the same name as the flag with the value that was captured for that flag


## Auto Help

Seeli will generate help from the usage string and flags 

## Asyncronous

Your defined `run` function will be passed a `done` function to be called when your command has finished. This allows you to do complex async operations ond I/O. The `done` callback accepts an error, if their is one, and the final output to be displayed for your command.

## Events

Instances of the seeli Command or Commands the inherit from it as also instances of the `EventEmitter` class. By default any flag that has its `event` option set to `true` will emit an event with the value of of the flag before the run function is executed.

```js
var EventCommand = new cli.Command({
	args:[ '--one', '--no-two']
  , flags:{
		one:{
			type:Boolean
			,event:true
		}
		,two:{
			type:Boolean
			,event:true
		}
	}
  , run: function( cmd, data, done ){
  	done( null, data.one && data.two )
  }
});

EventCommand.on('one', function( value ){
	assert.equal( true, value );
});

EventCommand.on('two', function( value ){
	assert.equal( false, value )
});

EventCommand.on('content', function( value ){
	assert.equal( false, value );
});

EventCommand.run( null );
```

## Errors

Errors are handled by Node's error domains. Each command will run inside of its own domain and will emit an error event if and error is passed to the `done` callback from the `run` method.
