/*jshint laxcomma:true, smarttabs: true */
/**
 * CLI harness module. Comes with free help command
 * @module seeli
 * @author Eric Satterwhite
 * @requires mout
 * @requires nopt
 * @requires domain
 * @requires os
 * @requires fs
 * @requires pathh
 * @requires abbrev
 * @requires util
 * @requires chalk
 * @requires seeli/lib/command
 * @requires seeli/lib/commands
 **/
var clidomain = require('./domain')
   , command    = require( './command' ) // this is command
   , nopt       = require('nopt')
   , util       = require('util')
   , chalk      = require('chalk')
   , commands   = require('./commands')
   , conf       = require('./conf')
   , shorthands
   , parsed
   , clidomain
   , colors
   , help;                         // The primary Class exports from the module

colors = ['red', 'blue','green', 'yellow','bold', 'grey', 'dim', 'black', 'magenta', 'cyan'];
clidomain.on('error', function(err){
  console.error( chalk.red( util.format( '%s:', err.name) ), chalk.bold( err.message ) );
  if( parsed && parsed.traceback ){
  console.error( chalk.red( err.stack ) );
  } else {
    console.error('use --traceback for full stacktrace');
  }

  return conf.get('exitOnError') ? process.exit( err.code || 1 ) : null;
});

/**
 * Registers a command by name
 * @static
 * @method module:seel#use
 * @param {String} name Registered name of the command
 * @param {module:seel/lib/command} Command the Command to execute by name
 **/
exports.use = commands.register.bind( commands );

// primary flags
opts = {
  'help':Boolean
, traceback: Boolean
};

// flag alias
shorthands = {
  'h':['--help']
};

Object.defineProperties( exports,{
  /**
   * @readonly
   * @name list
   * @memberof seeli
   * @property {Array} list returns a list of registered commands
   **/
  list:{
    get: function(){
      return Object.keys( commands );
    }
  }
});

exports.exitOnError = true;

/**
 * @readonly
 * @name Command
 * @memberof seeli
 * @property {module:seel/lib/command} Command Short cut to the primary commadn class
 **/
exports.Command = command;

exports.commands = commands;
exports.reset    = commands.reset.bind( commands );

/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
exports.get      = conf.get;

/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
exports.set      = conf.set;


/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
exports.cmd = function( key, value ){
  commands[ key ] = value;
};

colors.forEach( function( color ){
  exports[color] = chalk[color].bind( chalk );
});

/**
 * starts the command line execution process
 **/
exports.run = function( ){
  parsed = nopt( opts, shorthands );

  // pull out the first non-flag argument
  command = parsed.argv.remain.shift();
  // did the try to use the help command directly?
  help = !!parsed.help;
  if( help || command === 'help' || command == null ){
    command = ( command === 'help' || command == null ) ? parsed.argv.remain.shift() : command;
    // allow for abbreviated commands
    return clidomain.run(function(){
      commands.help.run( command );
    });
  }

  if(commands.hasOwnProperty( command ) ) {
    return clidomain.run(function(){
      commands[command].run(null);
    });
  }
  console.error('unknown command %s', command );
  console.error('know commands: %s ', Object.keys( commands ).join(', ') );
  process.exit(0);
};
