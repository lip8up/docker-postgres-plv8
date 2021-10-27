import util from 'util'
import moment from 'moment'

// 改善显示
util.inspect.defaultOptions.depth = 6

;(Date.prototype as any)[Symbol.for('nodejs.util.inspect.custom')] = function() {
  return moment(this).format()
}
