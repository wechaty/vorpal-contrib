import {
  Args,
  CommandInstance,
  Vorpal,
}                     from 'wechaty-vorpal'
import safeStringify  from 'json-stringify-safe'
import { log } from 'wechaty'

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
  this : CommandInstance,
  args : Args,
): Promise<void> {
  log.verbose('WechatyVorpalContrib', 'Eval("%s")', JSON.stringify(args))

  try {
    const jsCode = (args.code as string[]).join(' ')
    log.verbose('WechatyVorpalContrib', 'Eval() jsCode: "%s"', jsCode)

    // eslint-disable-next-line no-eval
    let result = eval(jsCode)
    if (isObject(result) && !Array.isArray(result)) {
      try {
        result = safeStringify(result, null, 2)
      } catch (e) {
        this.log(e.stack)
      }
    }
    this.log(result)
  } catch (e) {
    this.log(e)
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
