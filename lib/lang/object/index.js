/* jshint laxcomma: true, smarttabs: true, node: true, esnext: true*/
'use strict'

/**
 * Object helpers
 * @author Eric Satterwhite
 * @since 7.0.0
 * @module seeli/lib/lang/object
 * @requires seeli/lib/lang/object/set
 * @requires seeli/lib/lang/object/merge
 **/

module.exports = {
  /**
   * @property set {Function} sets a deep property on an object
   * @type Function
   * @memberof module:seeli/lib/lang/object
   * @see module:seeli/lib/lang/object/set
   **/
  set: require('./set')
, merge: require('./merge')
}
