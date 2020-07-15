import moment from 'moment'

import {
  State,
  Record,
}           from './reducer'

const stateList: State[] = []

const sortRecord = (a: Record, b: Record) => a.time - b.time

function record (state: State): void {
  stateList.push(state)
}

function describe (state: State): string {
  let n = 0
  const board = Object.values(state)
    .sort(sortRecord)
    .map(({ name, time }) => `#${++n} ${time}: ${name}`)
    .join('\n')

  return board
}

function average (): State {
  const counter: {
    [id: string]: number
  } = {}

  const reducer = (acc: State, cur: State) => {
    Object.keys(cur)
      .forEach(id => {
        acc[id].time += cur[id].time
        counter[id] = 1 + (counter[id] ?? 0)
      })
    return cur
  }

  const averageState = stateList.reduce(reducer, {})
  Object.keys(averageState).forEach(id => {
    if (counter[id] > 0) {
      averageState[id].time = Math.floor(averageState[id].time / counter[id])
    }
  })

  return averageState
}

function reset (): void {
  stateList.length = 0
}

function summary (state: State): string {
  const description = describe(state)
  return [
    `Record: (${moment()})`,
    '',
    description,
    '',
    `Total ${Object.keys(state).length} bots.`,
  ].join('\n')
}

function summaryAll (): string {
  const avgState = average()
  const avgDescription = describe(avgState)
  return [
    'History Summary',
    '',
    avgDescription,
    '',
    `Total ${Object.keys(avgState).length} bots.`,
  ].join('\n')
}

export {
  record,
  reset,
  summary,
  summaryAll,
}
