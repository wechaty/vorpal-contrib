#!/usr/bin/env ts-node

import test  from 'tstest'

import { createFixture } from 'wechaty'

import { Reporter } from './reporter'
import { DEFAULT_OPTIONS } from './ddr'
import { Store } from './store'

class ReporterTest extends Reporter {

  public get stateList () { return super.stateList }

  sum () { return super.sum() }
  average () { return super.average() }
  idCounterDict () { return super.idCounterDict() }

}

test('Reporter sum()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    const EXPECTED_SUM_STATE = {
      meta: { time: 0 },
      payload: {
        a: { id: 'a', name: 'aaa', time: 10 },
        b: { id: 'b', name: 'bbb', time: 50 },
        c: { id: 'c', name: 'ccc', time: 40 },
      },
    }

    const sumState = reporter.sum()
    t.deepEqual(sumState, EXPECTED_SUM_STATE, 'should sum all state as expected')
  }
})

test('Reporter average()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    const EXPECTED_AVG_STATE = {
      meta: { time: 0 },
      payload: {
        a: { id: 'a', name: 'aaa', time: 10 },
        b: { id: 'b', name: 'bbb', time: 25 },
        c: { id: 'c', name: 'ccc', time: 40 },
      },
    }
    const avgState = reporter.average()
    t.deepEqual(avgState, EXPECTED_AVG_STATE, 'should average all state as expected')
  }
})

test('Reporter idCounterDict()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    const EXPECTED_COUNTER_DICT = { a: 1, b: 2, c: 1 }
    const dict = reporter.idCounterDict()
    t.deepEqual(dict, EXPECTED_COUNTER_DICT, 'should get the counter dict as expected')
  }
})

test('Reporter ddrRateDict()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    const EXPECTED_DDR_RATE = { a: 50, b: 100, c: 50 }
    const ddrRate = reporter.ddrRateDict()
    t.deepEqual(ddrRate, EXPECTED_DDR_RATE, 'should calc the expected ddr rate dict')
  }
})

test('Reporter ddrRateAll()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    // console.info('stateList', ReporterTest.stateList)

    let ddrRate = reporter.ddrRateAll()
    t.equal(ddrRate, 0, 'should get ddr rate 0 if no data')

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    const EXPECTED_DDR_RATE = 66
    ddrRate = reporter.ddrRateAll()
    t.deepEqual(ddrRate, EXPECTED_DDR_RATE, 'should calc the expected ddr rate')
  }
})

test('Reporter ddrRateSigma()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    // console.info('stateList', ReporterTest.stateList)

    let ddrRateSigma = reporter.ddrRateSigma()
    // let ddrRateAll = reporter.ddrRateAll()

    t.equal(ddrRateSigma, 0, 'should get ddr rate sigma 0 if no data')

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
          c: { id: 'c', name: 'ccc', time: 20 },
          d: { id: 'd', name: 'ddd', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 30 },
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 30 },
          b: { id: 'b', name: 'bbb', time: 30 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 30 },
        },
      },
    ])

    const EXPECTED_DDR_RATE = 83
    ddrRateSigma = reporter.ddrRateSigma()
    t.deepEqual(ddrRateSigma, EXPECTED_DDR_RATE, 'should calc the expected ddr rate sigma')
  }
})

test('Reporter reset()', async t => {
  for await (const fixture of createFixture()) {
    const store = new Store(fixture.message)
    const ddrStore = store.get()

    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ddrStore.stateList.push(...[
      {
        meta: { time: 0 },
        payload: {
          a: { id: 'a', name: 'aaa', time: 10 },
          b: { id: 'b', name: 'bbb', time: 20 },
        },
      },
      {
        meta: { time: 0 },
        payload: {
          b: { id: 'b', name: 'bbb', time: 30 },
          c: { id: 'c', name: 'ccc', time: 40 },
        },
      },
    ])

    reporter.reset()

    const summary = reporter.summaryAll()
    t.match(summary, /Total 0 bots with 0 DDR tests/i, 'should clean summary after reset()')
  }
})
