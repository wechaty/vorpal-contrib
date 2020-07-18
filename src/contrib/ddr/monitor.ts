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

import { Message } from 'wechaty'
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

interface SubStore {
  [id: string]: Subscription
}

class Monitor {

  static subStore: SubStore  = {}

  constructor (
    protected options: DdrOptions,
    protected message: Message,
  ) {

  }

  id () {
    return `${this.message.talker().id}#${this.message.room()?.id}`
  }

  busy () {
    return this.id() in Monitor.subStore
  }

  start (): boolean {
    if (this.busy()) {
      return false
    }

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
    Monitor.subStore[this.id()] = monitor$.subscribe(
      state => reporter.record(state)
    )

    return true
  }

  stop (): boolean {
    if (!this.busy()) {
      return false
    }
    Monitor.subStore[this.id()].unsubscribe()
    delete Monitor.subStore[this.id()]
    return true
  }

}

export {
  Monitor,
}
