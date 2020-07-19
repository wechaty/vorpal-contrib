import moment from 'moment'
import {
  timer,
  fromEvent,
  from,
  Subscription,
}               from 'rxjs'
import {
  scan,
  mergeMap,
  takeUntil,
  startWith,
  filter,
  takeLast,
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
  inRoom,
  isText,
  isNotSelf,
}                     from './utils'
import {
  nextState,
  initialState,
}                   from './reducer'
import {
  DdrOptions,
}                   from './ddr'

interface MonitorStore {
  [id: string]: {
    sub?      : Subscription
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

  start (interval: true | number | string): boolean {
    log.verbose('Monitor', 'start(%s)', interval || '')

    if (this.busy()) {
      return false
    }

    Monitor.store[this.id()] = {}
    const storeItem = Monitor.store[this.id()]

    const wechatyMessage$ = fromEvent<EventMessagePayload>(this.message.wechaty.puppet, 'message')

    const message$ = wechatyMessage$.pipe(
      mergeMap(toMessage$(this.message.wechaty)),
      filter(inRoom(this.message.room())),
    )
    const messageDing$ = message$.pipe(
      filter(isText(this.options.ding)),
    )
    const messageDong$ = message$.pipe(
      filter(isText(this.options.dong)),
    )

    const monitor$ = messageDing$.pipe(
      mergeMap(_ => {
        const timeout$ = timer(this.options.timeout * 1000)
        return messageDong$.pipe(
          filter(isNotSelf),
          startWith(undefined),
          scan(nextState, Promise.resolve(initialState)),
          mergeMap(v => from(v)),
          takeUntil(timeout$),
          takeLast(1),
        )
      })
    )

    const reporter = new Reporter(this.options, this.message)

    storeItem.sub = monitor$.subscribe(
      state => reporter.record(state)
    )

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
        () => this.message.say(this.options.ding),
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
      if (storeItem.sub) {
        storeItem.sub.unsubscribe()
        storeItem.sub = undefined
      }
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
