#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import {
  test,
}          from 'tstest'

import {
  Message,
}                   from 'wechaty'
import {
  createFixture,
}                   from 'wechaty-mocker'
import type {
  mock,
}                   from 'wechaty-puppet-mock'
import {
  WechatyVorpal,
}                   from 'wechaty-vorpal'

import { Ddr }      from './ddr.js'
import { Store }    from './store.js'

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

    fixture.wechaty.wechaty.use(WechatyVorpalPlugin)

    const botList = fixture.mocker.mocker.createContacts(3)
    const room = fixture.mocker.mocker.createRoom({
      memberIdList: [
        fixture.mocker.bot.id,
        fixture.mocker.player.id,
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

    const summaryFuture = expectSummaryAll(room)
    // const mocker.summaryAllFuture = expectSummaryAll(room)

    fixture.mocker.player.say('ddr').to(room)

    const summary = await summaryFuture
    // const summaryAll = await summaryAllFuture

    t.true(summary, 'should get summary')
    // t.true(summaryAll, 'should get summaryAll')

    await new Promise(setImmediate)
    await new Promise(resolve => setTimeout(resolve, 100))

    const store = new Store(fixture.wechaty.message)
    store.clear(true)
  }
})

function expectSummaryAll (room: mock.RoomMock) {
  return  new Promise<string>(resolve => {
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      const text = message.text() || ''
      if (!/History Summary/i.test(text))       { return }

      resolve(text)
      room.off('message', onMessage)
    }
    room.on('message', onMessage)
  })
}

// function expectSummaryAll (room: mock.RoomMock) {
//   return  new Promise<string>(resolve => {
//     const onMessage = (message: mock.MessageMock) => {
//       if (message.type() !== Message.Type.Text) { return }
//       const text = message.text() || ''

//       if (!/History Summary/i.test(text)) { return }
//       resolve(text)
//       room.off('message', onMessage)
//     }
//     room.on('message', onMessage)
//   })
// }
