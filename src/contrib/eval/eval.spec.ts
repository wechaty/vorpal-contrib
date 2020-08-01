#!/usr/bin/env ts-node

import test  from 'tstest'

import { asyncEval } from './async-eval'

test('asyncEval resolve for `this`', async function (t) {
  const THIS = {} as any
  const that = await asyncEval.call(THIS, 'return await Promise.resolve(this)')
  t.equal(that, THIS, 'should resolve to the THIS')
})

test('asyncEval resolve for `number`', async function (t) {
  const NUM = 42
  const num = await asyncEval(`return await Promise.resolve(${NUM})`)
  t.equal(num, NUM, `should resolve the asyncEval to ${NUM}`)
})
