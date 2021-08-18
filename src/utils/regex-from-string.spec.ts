#!/usr/bin/env ts-node

import { test } from 'tstest'

import { regexFromString } from './regex-from-string'

test('regexFromString()', async t => {
  const string = '/hello\\s{0,1}[-_.]{0,1}world|ls\\b/gim'

  const regex = regexFromString(string)

  t.true(regex instanceof RegExp, 'should be a instance of RegExp')
  t.true(regex.test('hello world'), 'should match basic')
})

test('regexFromString() with flags', async t => {
  const string = '/^hello, world$/im'

  const regex = regexFromString(string)

  t.true(regex instanceof RegExp, 'should be a instance of RegExp')
  t.true(regex.test('\n\nhello, world\n\n'), 'should match multi lines')
  t.true(regex.test('Hello, World'), 'should match upper case')
})
