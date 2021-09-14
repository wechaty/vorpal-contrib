import moment from 'moment'

import {
  State,
  Record,
  initialState,
}                   from './reducer.js'
import type { Monitor } from './monitor.js'
import type { Message } from 'wechaty'

import type { DdrOptions } from './ddr.js'
import { Store }      from './store.js'

class Reporter {

  protected get stateList () {
    const store = new Store(this.message)
    const ddrStore = store.get()

    return ddrStore.stateList
  }

  constructor (
    protected options: DdrOptions,
    protected message: Message,
    protected monitor?: Monitor,
  ) {
  }

  record (state: State): void {
    // console.info('record state', state)
    this.stateList.push(state)
  }

  protected describe (state: State): string {
    let n = 0

    const sortRecord = (a: Record, b: Record) => a.time - b.time

    const board = Object.values(state.payload)
      .sort(sortRecord)
      .map(({ name, time }) => `#${++n} ${(time / 1000).toFixed(3)}s: ${name}`)
      .join('\n')

    return board
  }

  protected describeDdr (state: State): string {
    const ddrRate = this.ddrRateDict()

    const sortRecord = (a: Record, b: Record) => ddrRate[b.id]! - ddrRate[a.id]!
    let rank = 0

    const board = Object.values(state.payload)
      .sort(sortRecord)
      .map(({ name, id }) => `#${++rank} ${ddrRate[id]}%: ${name}`)
      .join('\n')

    return board
  }

  protected recordList () {
    return this.stateList.reduce((list, state) => [
      ...list,
      ...Object.values(state.payload),
    ], [] as Record[])
  }

  protected idList () {
    const list = this.stateList.reduce((list, state) => [
      ...list,
      ...Object.keys(state.payload),
    ], [] as string[])

    return [...new Set(list)]
  }

  protected idCounterDict () {
    return this.stateList.reduce((dict, state) => {
      Object.keys(state.payload).forEach(id => {
        if (typeof id !== 'string') { return }
        dict[id] = id in dict
          ? dict[id]! + 1
          : 1
      })
      return dict
    }, {} as { [id: string]: number})
  }

  protected sum (): State {
    return this.recordList().reduce((state, record) => {
      if (typeof record.id !== 'string') { return state }

      const newState = {
        meta: { ...state.meta },
        payload: {
          ...state.payload,
          [record.id]: {
            ...record,
            time: record.id in state.payload
              ? record.time + state.payload[record.id]!.time
              : record.time,
          },
        },
      }
      return newState
    }, initialState)
  }

  protected average (): State {
    const sumState     = this.sum()

    // To prevent mutate the initialState
    const averageState = {
      meta    : { ...initialState.meta },
      payload : { ...initialState.payload },
    }

    const count = (id: string) => this.stateList.filter(state => id in state.payload).length

    for (const [id, record] of Object.entries(sumState.payload)) {
      const counter = count(id)
      if (counter <= 0) { continue }

      averageState.payload[id] = {
        id,
        name: record.name,
        time: record.time / counter,
      }
    }

    return averageState
  }

  reset (): void {
    this.stateList.length = 0
  }

  ddrRateSigma (): number {
    const botNum = this.idList().length
    if (botNum < 3) {
      return this.ddrRateAll()
    }

    /**
     * 68–95–99.7 rule
     *  https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule
     *
     *  Only keep one Sigma in the middle of the performance ranking list
     *    to get a sample out
     */
    const removeNum = Math.ceil((1 - 0.6827) * botNum  / 2)
    // console.info('botNum', botNum)
    // console.info('removeNum', removeNum)

    let idCounterList = Object.entries(this.idCounterDict()).sort(
      (a: any, b: any) => a[1] - b[1]
    )

    idCounterList = idCounterList.slice(removeNum, 0 - removeNum)

    const totalDingNum = Math.max(0, ...idCounterList.map(ic => ic[1]))
    // console.info('totalDingNum', totalDingNum)
    // console.info('botNum', botNum)

    const expectedDongNum = (botNum - 2 * removeNum) * totalDingNum

    const actualDongNum = idCounterList.map(ic => ic[1])
      .reduce((acc, cur) => acc + (cur ?? 0), 0)
    // console.info('expectedDongNum', expectedDongNum)

    if (expectedDongNum <= 0) {
      return 0
    }

    const ddr = actualDongNum / expectedDongNum
    return Math.floor(100 * ddr)
  }

  ddrRateAll (): number {
    const totalDingNum = Math.max(0, ...Object.values(this.idCounterDict()))
    const botNum = this.idList().length
    // console.info('totalDingNum', totalDingNum)
    // console.info('botNum', botNum)

    const expectedDongNum = botNum * totalDingNum
    const actualDongNum = Object.values(this.idCounterDict()).reduce((acc, cur) => acc + (cur ?? 0), 0)
    // console.info('expectedDongNum', expectedDongNum)

    if (expectedDongNum <= 0) {
      return 0
    }

    const ddr = actualDongNum / expectedDongNum
    return Math.floor(100 * ddr)
  }

  ddrRateDict () {
    const totalDingNum = Math.max(...Object.values(this.idCounterDict()))
    return Object.entries(this.idCounterDict())
      .reduce((dict, [id, num]) => {
        dict[id] = Math.floor(100 * num / totalDingNum)
        return dict
      }, {} as {[id: string]: number})
  }

  summary (state: State): string {
    const description = this.describe(state)

    return [
      `Record: (${moment().format('lll')})`,
      `Timeout: ${this.options.timeout}`,
      '',
      description,
      '',
      `Total ${Object.keys(state.payload).length} bots.`,
    ].join('\n')
  }

  summaryMissing (state: State): undefined | string {
    const curBotIdSet = new Set(Object.keys(state.payload))

    let n = 0

    const lostBotNames = Object.keys(this.idCounterDict())
      .filter(id => !curBotIdSet.has(id))
      .map(id => this.message.wechaty.Contact.load(id).name())
      .map(text => `#${--n} ${text}`)

    return lostBotNames.length
      ? ['Lost:', ...lostBotNames].join('\n')
      : undefined
  }

  summaryAll (): string {
    const avgState = this.average()
    const avgDescription = this.describeDdr(avgState)

    const busy = this.monitor?.busy() ?? 'OFF'
    const monitorStatus = typeof busy === 'string'
      ? busy
      : busy
        ? 'ON'
        : 'OFF'

    return [
      `History Summary (Monitor:${monitorStatus})`,
      '',
      avgDescription,
      '',
      `Total ${Object.keys(avgState.payload).length} bots with ${this.stateList.length} DDR tests.`,
      `Average DDR: ${this.ddrRateAll()}%`,
      `σ DDR: ${this.ddrRateSigma()}%`,
    ].join('\n')
  }

}

export {
  Reporter,
}
