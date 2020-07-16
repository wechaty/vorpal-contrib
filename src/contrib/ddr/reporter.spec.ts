#!/usr/bin/env ts-node

import test  from 'tstest'

import { createFixture } from 'wechaty'

import { Reporter } from './reporter'
import { DEFAULT_OPTIONS } from './ddr'

class ReporterTest extends Reporter {

  sum () { return super.sum() }
  average () { return super.average() }
  idCounterDict () { return super.idCounterDict() }

}

test('Reporter sum()', async t => {
  for await (const fixture of createFixture()) {
    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ReporterTest.stateList = [
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
    ]

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
    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ReporterTest.stateList = [
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
    ]

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
    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ReporterTest.stateList = [
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
    ]

    const EXPECTED_COUNTER_DICT = { a: 1, b: 2, c: 1 }
    const dict = reporter.idCounterDict()
    t.deepEqual(dict, EXPECTED_COUNTER_DICT, 'should get the counter dict as expected')
  }
})

test('Reporter ddrRateDict()', async t => {
  for await (const fixture of createFixture()) {
    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    ReporterTest.stateList = [
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
    ]

    const EXPECTED_DDR_RATE = { a: 50, b: 100, c: 50 }
    const ddrRate = reporter.ddrRateDict()
    t.deepEqual(ddrRate, EXPECTED_DDR_RATE, 'should calc the expected ddr rate dict')
  }
})

test.only('Reporter ddrRate()', async t => {
  for await (const fixture of createFixture()) {
    const reporter = new ReporterTest(
      DEFAULT_OPTIONS,
      fixture.message,
    )

    let ddrRate = reporter.ddrRate()
    t.equal(ddrRate, 0, 'should get ddr rate 0 if no data')

    ReporterTest.stateList = [
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
    ]

    const EXPECTED_DDR_RATE = 66
    ddrRate = reporter.ddrRate()
    t.deepEqual(ddrRate, EXPECTED_DDR_RATE, 'should calc the expected ddr rate')
  }
})
