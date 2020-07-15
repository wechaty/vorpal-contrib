import moment from 'moment'

import {
  State,
  Record,
}           from './reducer'

const stateList: State[] = []

const sortRecord = (a: Record, b: Record) => a.time - b.time

function record (state: State): void {
  // console.info('record state', state)
  stateList.push(state)
}

function describe (state: State): string {
  let n = 0
  const board = Object.values(state)
    .sort(sortRecord)
    .map(({ name, time }) => `#${++n} ${time.toFixed(3)}s: ${name}`)
    .join('\n')

  return board
}

function sum (): State {
  const sumState = {} as State
  for (const state of stateList) {
    for (const [id, record] of Object.entries(state)) {
      if (id in sumState) {
        sumState[id] = {
          name: record.name,
          time: sumState[id].time + record.time,
        }
      } else {
        sumState[id] = record
      }
    }
  }
  return sumState
}

function average (): State {
  const sumState     = sum()
  const averageState = {} as State

  const count = (id: string) => stateList.filter(state => id in state).length
  for (const [id, record] of Object.entries(sumState)) {
    const counter = count(id)
    if (counter <= 0) { continue }

    averageState[id] = {
      name: record.name,
      time: record.time / counter,
    }
  }

  // console.info('sumState', sumState)
  // console.info('averageState', averageState)

  return averageState
}

function reset (): void {
  stateList.length = 0
}

function summary (state: State): string {
  const description = describe(state)
  return [
    `Record: (${moment().format('lll')})`,
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
    `Total ${Object.keys(avgState).length} bots with ${stateList.length} DDR tests.`,
  ].join('\n')
}

export {
  record,
  reset,
  summary,
  summaryAll,
}
