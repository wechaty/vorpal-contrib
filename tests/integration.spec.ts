#!/usr/bin/env ts-node

import {
  test,
}             from 'tstest'

test.skip('integration testing', async t => {
  await t.skip('tbw')
})
