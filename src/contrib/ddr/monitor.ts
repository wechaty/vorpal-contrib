import {
  timer,
  fromEvent,
  from,
  lastValueFrom,
}                 from 'rxjs'
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
  isNotSelf,
  toSeconds,
}                     from './utils'
import {
  nextState,
  initialState,
  State,
}                   from './reducer'
import {
  DdrOptions,
}                   from './ddr'
import { Store }    from './store'

class Monitor {

  protected store () {
    const store = new Store(this.message)
    const ddrStore = store.get()
    return ddrStore.monitor
  }

  constructor (
    protected options: DdrOptions,
    protected message: Message,
  ) {
  }

  busy (): boolean | string {
    const store = this.store()

    if (!store.timer) {
      return false
    }
    if (store.interval) {
      return store.interval
    }
    return true
  }

  ddr$ (): Promise<State> {
    const wechatyMessage$ = fromEvent<EventMessagePayload>(
      // FIXME(huan): https://github.com/andywer/typed-emitter/issues/9
      this.message.wechaty.puppet as any,
      'message',
    )

    const messageDong$ = wechatyMessage$.pipe(
      mergeMap(toMessage$(this.message.wechaty)),
      filter(sameRoom(this.message)),
      filter(isNotSelf),
      filter(isText(this.options.dong)),
    )

    const ding = async (v: undefined | Message) => {
      if (typeof v === 'undefined') {
        await this.message.say(this.options.ding)
      }
    }

    const timeout = typeof this.options.timeout === 'string'
      ? toSeconds(this.options.timeout)
      : this.options.timeout

    const timer$ = timer(timeout * 1000)
    const state$ = messageDong$.pipe(
      startWith(undefined),
      tap(ding),
      scan(nextState, Promise.resolve(initialState)),
      mergeMap(v => from(v)), // resolve the Promise
      takeUntil(timer$),
      takeLast(1),
    )

    return lastValueFrom(state$)
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
      // FIXME(huan): https://github.com/andywer/typed-emitter/issues/9
      this.message.wechaty.puppet as any,
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

    const timeout = typeof this.options.timeout === 'string'
      ? toSeconds(this.options.timeout)
      : this.options.timeout

    const state$ = messageDing$.pipe(
      mergeMap(messageDing => {
        const timeout$ = timer(timeout * 1000)
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

    const store = this.store()
    /**
     *
     * Setup schedule testing interval numbers
     *
     */
    if (typeof interval !== 'boolean') {

      let intervalSeconds = 60 * 60  // default 1 hour1

      if (typeof interval === 'number') {
        store.interval = interval + 's'

        if (interval > 10) {
          intervalSeconds = interval
        }
      } else if (typeof interval === 'string') {
        store.interval = interval
        intervalSeconds = toSeconds(interval)
      }

      log.verbose('Monitor', 'start() interval "%s" resolved to %s seconds', interval, intervalSeconds)

      store.timer = setInterval(
        async () => { await this.ddr() },
        intervalSeconds * 1000,
      )

      store.timeout = this.options.timeout
    }
    return true
  }

  stop (): boolean {
    if (!this.busy()) {
      return false
    }

    const store = this.store()

    if (store.timer) {
      clearInterval(store.timer)
      delete store.timer
    }
    if (store.interval) {
      delete store.interval
    }
    if (store.timeout) {
      delete store.timeout
    }

    return true
  }

}

export {
  Monitor,
}
