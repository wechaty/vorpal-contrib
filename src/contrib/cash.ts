import type {
  Vorpal,
}                     from 'wechaty-vorpal'
import { log } from 'wechaty'

/**
 * Cash v0.8 (Jun 24, 2020)
 */
const CASH_COMMANDS = [
  'alias',
  'cat',
  'cd',
  'clear',
  'cp',
  'echo',
  'head',
  'export',
  'false',
  'kill',
  'ls',
  'mkdir',
  'mv',
  'pwd',
  'sort',
  'source',
  'tail',
  'touch',
  'true',
  'less',
  'grep',
  'rm',
  'unalias',

  // Huan(202006): which only exist in the master branch
  // 'which',
] as const

// https://stackoverflow.com/a/51399781/1123955
type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

type CashCommand = ArrayElement<typeof CASH_COMMANDS>

export type CashConfig = Readonly<CashCommand[]>

function Cash (commands: CashConfig = CASH_COMMANDS) {
  log.verbose('WechatyVorpalContrib', 'Cash(%s)',
    commands
      ? commands.join(',')
      : '',
  )

  return function CashExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'CashExtension(vorpal)')

    if (!commands) { return }

    // Cash workaround
    if (!('api' in vorpal)) {
      (vorpal as any).api = {}
    }

    for (const command of commands) {
      log.verbose('WechatyVorpalContrib', 'CashExtension() adding command: %s', command)

      /**
       * Load Cash Commands
       */
      import('cash/dist/commands/' + command + '.js')
        .then(mod => {
          // console.info('mod:', mod.toString())
          return vorpal.use(mod)
        })
        .catch(console.error)
    }

  }
}

export { Cash }
