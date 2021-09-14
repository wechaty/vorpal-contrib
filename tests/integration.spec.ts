#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import {
  test,
}             from 'tstest'

test.skip('integration testing', async t => {
  await t.skip('tbw')
})
