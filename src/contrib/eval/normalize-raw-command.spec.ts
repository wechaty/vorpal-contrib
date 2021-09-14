#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { test } from 'tstest'

import { normalizeRawCommand } from './normalize-raw-command.js'

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
