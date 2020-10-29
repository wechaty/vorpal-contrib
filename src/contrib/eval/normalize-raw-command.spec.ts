#!/usr/bin/env ts-node

import test  from 'tstest'

import { normalizeRawCommand } from './normalize-raw-command'

test('normalizeRawCommand', async t => {
  const CMD = `
    eval
    const topic=/Home 6$/i;
    return topic.test('Home 6');
  `
  const EXPECTED = `const topic=/Home 6$/i;
    return topic.test('Home 6');
  `

  const jsCode = normalizeRawCommand(CMD)
  t.equal(jsCode, EXPECTED, 'should normalize js code')
})
