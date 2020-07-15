/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  timer,
  fromEvent,
}               from 'rxjs'
import {
  scan,
  mergeMap,
  takeUntil,
  startWith,
  filter,
}               from 'rxjs/operators'

import {
  log,
}                       from 'wechaty'
import {
  EventMessagePayload,
}                       from 'wechaty-puppet'
import {
  Vorpal,
  CommandContext,
  Args,
}                   from 'wechaty-vorpal'

import {
  WechatyVorpalConfig,
}                       from '../../config'

import {
  nextState,
  initialState,
}                     from './reducer'
import {
  toMessage$,
  inRoom,
  isDong,
}                     from './utils'
import * as reporter  from './reporter'

export interface DdrConfig extends WechatyVorpalConfig {}

const COMMAND_NAME = 'ddr'

function Ddr (config: DdrConfig = {}) {
  log.verbose('WechatyVorpalContrib', 'Ddr(%s)', JSON.stringify(config))

  const commandName = config.command ?? COMMAND_NAME

  return function DdrExtension (vorpal: Vorpal) {
    log.verbose('WechatyVorpalContrib', 'DdrExtension(vorpal)')

    vorpal
      .command(`${commandName}`, 'Calculate the Ding Dong Rate (DDR)')
      .option('-d --ding <ding>', 'Define the message for sending. (default `ding`)')
      .option('-D --dong <dong>', 'Define the expected message for receiving. (default `dong`)')
      .option('-t --timeout <timeout>', 'Define the maximum seconds for waiting a dong after ding. (default 10s)')
      .option('-s --summary', 'Summary the DDR status')
      .option('-r --reset', 'Reset')
      .action(ddrAction as any)
  }
}

interface DdrOptions {
  ding     : string,
  dong     : string,
  timeout  : number,
  summary? : boolean,
  reset?   : boolean,
}

const DEFAULT_OPTIONS: DdrOptions = {
  ding: 'ding',
  dong: 'dong',
  timeout: 1,
}

async function ddrAction (
  this: CommandContext,
  args: Args
): Promise<number> {
  log.verbose('WechatyVorpalContrib', 'ddrAction("%s")', JSON.stringify(args))

  const normalizedOptions: DdrOptions = {
    ...DEFAULT_OPTIONS,
    ...args.options,
  }

  if (normalizedOptions.summary) {
    this.stdout.next(reporter.summaryAll())
    return 0
  }

  if (normalizedOptions.reset) {
    reporter.reset()
    this.stdout.next('Reset done.')
    return 0
  }

  const message$ = fromEvent<EventMessagePayload>(this.wechaty.puppet, 'message')
  const timeout$ = timer(normalizedOptions.timeout * 1000)

  const ddr$ = message$.pipe(
    mergeMap(toMessage$(this.wechaty)),
    filter(inRoom(this.message.room())),
    filter(isDong(normalizedOptions.dong)),
    startWith(undefined),
    scan(nextState, initialState),
    takeUntil(timeout$),
  )

  try {
    const future = ddr$.toPromise()
    this.stdout.next(normalizedOptions.ding)
    const state = await future

    reporter.record(state)
    this.stdout.next(reporter.summary(state))
    this.stdout.next(reporter.summaryAll())

    return 0

  } catch (e) {
    log.error('WechatyVorpalContrib', 'Ddr() ddr$.toPromise() rejection %s', e)
    console.error(e)
    return 1
  }

}

export { Ddr }
