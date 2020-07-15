#!/usr/bin/env ts-node

import {
  test,
}          from 'tstest'

import {
  Message,
  createFixture,
}                   from 'wechaty'
import {
  mock,
}                   from 'wechaty-puppet-mock'
import {
  WechatyVorpal,
}                   from 'wechaty-vorpal'

import { Ddr } from './ddr'

test('ddr', async t => {
  for await (const fixture of createFixture()) {
    /**
     * Install Vorpal & Match Master Command
     */
    const WechatyVorpalPlugin = WechatyVorpal({
      room : true,
      silent: true,
      use  : Ddr(),
    })

    fixture.wechaty.use(WechatyVorpalPlugin)

    const botList = fixture.mocker.createContacts(3)
    const room = fixture.mocker.createRoom({
      memberIdList: [
        fixture.bot.id,
        fixture.player.id,
        ...botList.map(b => b.id),
      ],
    })

    /**
     * Message Processing Logic
     */
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      if (message.text() !== 'ding')            { return }
      botList.map(bot => bot.say('dong').to(room))
    }
    room.on('message', onMessage)

    const summaryFuture = expectSummary(room)
    const summaryAllFuture = expectSummaryAll(room)

    fixture.player.say('ddr').to(room)

    const summary = await summaryFuture
    const summaryAll = await summaryAllFuture

    t.true(summary, 'should get summary')
    t.true(summaryAll, 'should get summaryAll')

    await new Promise(setImmediate)
  }
})

function expectSummary (room: mock.RoomMock) {
  return  new Promise<string>(resolve => {
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      const text = message.text() || ''
      if (!/Record/i.test(text))                { return }

      resolve(text)
      room.off('message', onMessage)
    }
    room.on('message', onMessage)
  })
}

function expectSummaryAll (room: mock.RoomMock) {
  return  new Promise<string>(resolve => {
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      const text = message.text() || ''

      if (!/History Summary/i.test(text)) { return }
      resolve(text)
      room.off('message', onMessage)
    }
    room.on('message', onMessage)
  })
}
