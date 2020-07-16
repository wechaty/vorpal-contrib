/**
 * Math Master
 *  Huan <zixia@zixia.net>
 */
import {
  timer,
  fromEvent,
  from,
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
  CommandContext,
  Args,
}                   from 'wechaty-vorpal'

import {
  nextState,
  initialState,
}                     from './reducer'
import {
  toMessage$,
  inRoom,
  isText,
}                     from './utils'
import * as reporter  from './reporter'
import { Monitor }   from './monitor'

import {
  DEFAULT_OPTIONS,
  DdrOptions,
}                     from './ddr'

async function action (
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

  if (normalizedOptions.monitor) {
    const monitor = new Monitor(normalizedOptions, this.message)
    if (monitor.busy()) {
      this.stderr.next('DDR monitor has already started.')
      return 1
    }

    monitor.start()
    this.stdout.next([
      'DDR monitor started.',
      `Trigger: ${normalizedOptions.ding}`,
      `Expect: ${normalizedOptions.dong}`,
    ].join('\n'))
    return 0
  }

  if (normalizedOptions.unmonitor) {
    const monitor = new Monitor(normalizedOptions, this.message)
    if (!monitor.busy()) {
      this.stderr.next('DDR monitor is not running.')
      return 1
    }
    monitor.stop()
    this.stderr.next('DDR monitor has been stopped.')
    return 0
  }

  const message$ = fromEvent<EventMessagePayload>(this.wechaty.puppet, 'message')
  const timeout$ = timer(normalizedOptions.timeout * 1000)

  const ddr$ = message$.pipe(
    mergeMap(toMessage$(this.wechaty)),
    filter(inRoom(this.message.room())),
    filter(isText(normalizedOptions.dong)),
    startWith(undefined),
    scan(nextState, Promise.resolve(initialState)),
    mergeMap(v => from(v)), // await promise for `v`
    takeUntil(timeout$),
  )

  try {
    const future = ddr$.toPromise()
    this.stdout.next(normalizedOptions.ding)
    const state = await future

    reporter.record(state)
    this.stdout.next(reporter.summary(state))
    // this.stdout.next(reporter.summaryAll())

    return 0

  } catch (e) {
    log.error('WechatyVorpalContrib', 'Ddr() ddr$.toPromise() rejection %s', e)
    console.error(e)
    return 1
  }

}

export { action }
