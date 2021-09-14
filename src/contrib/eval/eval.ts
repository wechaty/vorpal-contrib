import { log } from 'wechaty'
import type {
  Args,
  CommandContext,
  Vorpal,
}                     from 'wechaty-vorpal'
import safeStringify  from 'json-stringify-safe'

import { asyncEval }            from './async-eval.js'
import { normalizeRawCommand }  from './normalize-raw-command.js'

function Eval () {
  log.verbose('WechatyVorpalContrib', 'Eval()')

  return function EvalExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'EvalExtension(vorpal)')

    vorpal
      .command('eval <code...>', 'Eval JavaScript Code')
      .action(evalAction)

  }
}

async function evalAction (
  this : CommandContext,
  args : Args,
): Promise<void> {
  log.verbose('WechatyVorpalContrib', 'Eval("%s")', JSON.stringify(args))

  try {
    // const jsCode = (args.code as string[]).join(' ')
    // https://github.com/wechaty/wechaty-vorpal-contrib/issues/21
    const jsCode = normalizeRawCommand(args.rawCommand)

    log.verbose('WechatyVorpalContrib', 'Eval() jsCode: "%s"', jsCode)

    let result: any = await asyncEval.call(this, jsCode)

    if (isObject(result) && !Array.isArray(result)) {
      try {
        result = safeStringify(result, null, 2)
      } catch (e) {
        log.error('WechatyVorpalContrib', 'Eval() safeStringify() rejection %s', e)

        const name = (e as Error).name
        const message = (e as Error).message
        const stack = (e as Error).stack
        this.log([
          name,
          message,
          stack,
        ].join('\n'))
      }
    }
    this.log(result)
  } catch (e) {
    this.log(e as any)
  }
}

/**
 * https://stackoverflow.com/a/16608074/1123955
 */
function isObject (obj: any): obj is Object {
  const type = typeof obj
  if (!obj) { return false }
  return type === 'function' || type === 'object'
}

export { Eval }
