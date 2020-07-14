#!/usr/bin/env ts-node

import {
  test,
}          from 'tstest'

import { leaderBoard }  from './leader_board'
import { CommandInstance } from 'wechaty-vorpal'
import { Contact } from 'wechaty'

test('leaderBoard', async t => {
  const ID_LIST      = ['id1', 'id2', 'id3']
  const NAME_LIST    = ['name1', 'name2', 'name3']
  const COMMENT_LIST = ['hello', 'damn', undefined]
  const SCORE_LIST   = [3, 1, 2]

  const resultList = []

  for (let i = 0; i < ID_LIST.length; i++) {
    const player = {
      id: ID_LIST[i],
      name: () => NAME_LIST[i],
    } as any as Contact

    const context = {
      ask: () => COMMENT_LIST[i],
    } as any as CommandInstance

    const result = await leaderBoard(
      context,
      player,
      SCORE_LIST[i]
    )

    resultList[i] = result
  }

  t.equal(resultList[0], '#1 - name1(3) hello', 'should get result 0')
  t.equal(resultList[1], '#1 - name1(3) hello\n#2 - name2(1) damn', 'should get result 1')
  t.equal(resultList[2], '#1 - name1(3) hello\n#2 - name3(2) \n#3 - name2(1) damn', 'should get result 2')
  console.info(resultList[2])
})
