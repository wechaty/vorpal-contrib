import moment from 'moment'
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
  takeLast,
  tap,
}               from 'rxjs/operators'

import {
  Message,
  log,
}                 from 'wechaty'
import {
  EventMessagePayload,
}                       from 'wechaty-puppet'

import { Reporter } from './reporter'
import {
  toMessage$,
  sameRoom,
  isText,
}                     from './utils'
import {
  nextState,
  initialState,
  State,
}                   from './reducer'
import {
  DdrOptions,
}                   from './ddr'

interface MonitorStore {
  [id: string]: {
    timer?    : NodeJS.Timer,
    interval? : string,
  }
}

class Monitor {

  static store: MonitorStore  = {}

  constructor (
    protected options: DdrOptions,
    protected message: Message,
  ) {
  }

  id () {
    return `${this.message.talker().id}#${this.message.room()?.id}`
  }

  busy (): boolean | string {
    const item = Monitor.store[this.id()]

    if (!item) {
      return false
    }
    if (item.interval) {
      return item.interval
    }
    return true
  }

  ddr$ (): Promise<State> {
    const wechatyMessage$ = fromEvent<EventMessagePayload>(
      this.message.wechaty.puppet,
      'message',
    )

    const messageDingDong$ = wechatyMessage$.pipe(
      mergeMap(toMessage$(this.message.wechaty)),
      filter(sameRoom(this.message)),
      filter(isText([
        this.options.ding,
        this.options.dong,
      ])),
    )

    const ding = async (v: undefined | Message) => {
      if (typeof v === 'undefined') {
        await this.message.say(this.options.ding)
      }
    }
    const timer$ = timer(this.options.timeout * 1000)
    const state$ = messageDingDong$.pipe(
      startWith(undefined),
      tap(ding),
      scan(nextState, Promise.resolve(initialState)),
      mergeMap(v => from(v)), // resolve the Promise
      takeUntil(timer$),
      takeLast(1),
    )

    return state$.toPromise()
  }

  async ddr (): Promise<void> {
    const reporter = new Reporter(this.options, this.message, this)

    const state = await this.ddr$()

    reporter.record(state)

    await this.message.say(reporter.summary(state))
    await this.message.wechaty.sleep(1000)

    const missing = reporter.summaryMissing(state)
    if (missing) {
      await this.message.say(missing)
    }

    await this.message.wechaty.sleep(1000)
    await this.message.say(reporter.summaryAll())
  }

  /**
   * Huan(202007): This method has limitations when the bot is running on a slow network/machine
   *
   *  When we got a `ding` message, there might not be enough time to start another listener to get the `dong` messages,
   *  so there will have a very high probability that we will miss the `dong` message counting.
   */
  passiveState$ () {
    const wechatyMessage$ = fromEvent<EventMessagePayload>(
      this.message.wechaty.puppet,
      'message',
    )

    const message$ = wechatyMessage$.pipe(
      mergeMap(toMessage$(this.message.wechaty)),
      filter(sameRoom(this.message)),
    )
    const messageDing$ = message$.pipe(
      filter(isText(this.options.ding)),
    )
    const messageDong$ = message$.pipe(
      filter(isText(this.options.dong)),
    )

    const state$ = messageDing$.pipe(
      mergeMap(messageDing => {
        const timeout$ = timer(this.options.timeout * 1000)
        return messageDong$.pipe(
          startWith(messageDing),
          startWith(undefined),
          scan(nextState, Promise.resolve(initialState)),
          mergeMap(v => from(v)), // resolve the Promise
          takeUntil(timeout$),
          takeLast(1),
        )
      })
    )

    return state$
  }

  start (interval: true | number | string): boolean {
    log.verbose('Monitor', 'start(%s)', interval || '')

    if (this.busy()) {
      return false
    }

    Monitor.store[this.id()] = {}
    const storeItem = Monitor.store[this.id()]

    /**
     *
     * Setup schedule testing interval numbers
     *
     */
    if (typeof interval !== 'boolean') {

      let intervalSeconds = 60 * 60  // default 1 hour1

      if (typeof interval === 'number') {
        storeItem.interval = interval + 's'

        if (interval > 10) {
          intervalSeconds = interval
        }
      } else if (typeof interval === 'string') {
        storeItem.interval = interval

        const match = interval.match(/^(\d+)(\w*)$/)

        if (match) {
          if (match[2]) {           // '60s'
            intervalSeconds = moment.duration(
              parseInt(match[1], 10),
              match[2] as any,
            ).asSeconds()
          } else {                  // '60'
            intervalSeconds = parseInt(match[1], 10)
          }
        }
      }

      log.verbose('Monitor', 'start() interval "%s" resolved to %s seconds', interval, intervalSeconds)

      storeItem.timer = setInterval(
        async () => { await this.ddr() },
        intervalSeconds * 1000,
      )

    }
    return true
  }

  stop (): boolean {
    if (!this.busy()) {
      return false
    }

    const storeItem = Monitor.store[this.id()]
    if (storeItem) {
      if (storeItem.timer) {
        clearInterval(storeItem.timer)
        storeItem.timer = undefined
      }
      delete Monitor.store[this.id()]
    }
    return true
  }

}

export {
  Monitor,
}
