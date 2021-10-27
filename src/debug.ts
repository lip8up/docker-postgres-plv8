import debugLib, { Debugger } from 'debug'
import util from 'util'
import path from 'path'
import log4js from 'log4js'
import chalk, { Chalk } from 'chalk'
// import configure from './dateFileEx'

const { getLogger } = log4js

const runtime = path.join(process.cwd(), 'runtime')

const configureLog = (name: string) => {
  log4js.configure({
    appenders: {
      [name]: {
        type: 'dateFile',
        layout: {
          type: 'pattern',
          pattern: '[%d{hh:mm:ss.SSS}] [%p] %m'
        },
        alwaysIncludePattern: true,
        keepFileExt: true,
        filename: path.join(runtime, `${name}.log`),
        // subDirPattern: 'yyymm',
        // pattern: 'yyyymmdd',
      }
    },
    categories: {
      default: {
        appenders: [ name ],
        level: 'info'
      }
    }
  })
}

export type DebugExts = Debugger & {
  /**
   * 记录 trace 日志，返回格式化后的字符串消息。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  trace(message: any, ...args: any[]): string

  /**
   * 记录 info 日志，返回格式化后的字符串消息。
   * 通常不直接调用该方法，使用 debug 输出的信息，就是 info 日志。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  info(message: any, ...args: any[]): string

  /**
   * 记录 warn 日志，返回格式化后的字符串消息。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  warn(message: any, ...args: any[]): string

  /**
   * 记录 error 日志，返回格式化后的字符串消息。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  error(message: any, ...args: any[]): string

  /**
   * 记录 fatal 日志，返回格式化后的字符串消息。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  fatal(message: any, ...args: any[]): string

  /**
   * 记录 mark 日志，返回格式化后的字符串消息。
   *
   * @param message 日志消息
   * @param args 其他消息
   */
  mark(message: any, ...args: any[]): string

  /**
   * 格式化错误或异常。
   *
   * @param ex 错误或异常
   */
  formatError(ex: any): string

  /**
   * 记录函数调用日志。
   *
   * @param name 函数名
   * @param args 函数参数
   */
  beginCall(name: string, ...args: any[]): DebugExts

  /**
   * 结束函数调用。
   *
   * @param args 可选的额外数据
   */
  endCall(...args: any[]): DebugExts

  /**
   * 扩展 debug，代理 extend，只不过添加了本模块扩展的方法。
   *
   * @param namespace 命名空间
   * @param delimiter 间隔符
   */
  append(namespace: string, delimiter?: string): DebugExts
}

const format = (...args: any[]) =>
  util.formatWithOptions({ breakLength: 666 }, ...args).replace(/\s*\r?\n\s*/g, ' ')

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
const useColors = (debugLib as any).useColors()

const logName = process.env.LOG_NAME || 'speed'
configureLog(logName)
const logger = getLogger(logName)

const colorMap: { [name: string]: Chalk } = {
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.bgRed,
  mark: chalk.bgGreen,
}

const extDebug = (debug: Debugger) => {
  const debugEx =  debug as DebugExts

  // 将 logger 的方法，代理到 debug 上
  ;['trace', 'info', 'warn', 'error', 'fatal', 'mark'].forEach(name => {
    ;(debugEx as any)[name] = (message: any, ...args: any[]) => {
      if (useColors) {
        const color = colorMap[name] || (text => text)
        debugEx(color(`[${name}]`.toUpperCase()), message, ...args)
      } else {
        const all = format(...[ message, ...args ])
        ; (logger as any)[name](debugEx.namespace, all)
        return all
      }
    }
  })

  debugEx.formatError = (ex: any) => {
    const message = ex?.message as string || String(ex)
    return message
  }

  debugEx.beginCall = (name: string, ...args: any[]) => {
    const list = args.map(arg => format(arg))
    const log = extDebug(debugEx.extend(name))
    log.mark(`~~~~~> start`, ...list)
    return log
  }

  debugEx.endCall = (...args: any[]) => {
    const list = args.map(arg => format(arg))
    debugEx.mark(`~~~~~> end`, ...list)
    return debugEx
  }

  debugEx.append = function(namespace: string, delimiter?: string) {
    const log = debugEx.extend(namespace, delimiter)
    return extDebug(log)
  }

  return debugEx
}

const debug = extDebug(debugLib('mall'))

// HACK debugLib log & formatArgs
if (!useColors) {
  debugLib.log = function(...args: any[]) {
    const message = format(...args)
    logger.info(message)
  }
  debugLib.formatArgs = function(args) {
    const name = this.namespace
    args[0] = `${name} ${args[0]}`
  }
}

export default debug

/**
 * 返回 Error 对象，扩展其构造器，可以传入任何对象。
 *
 * @param args 任何对象
 */
export function error(...args: any[]) {
  const all = format(...args)
  return new Error(all)
}
