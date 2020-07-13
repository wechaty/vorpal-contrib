#!/usr/bin/env ts-node

import {
  test,
}          from 'tstest'

import {
  Wechaty,
  Message,
}                   from 'wechaty'
import {
  mock,
  PuppetMock,
}                   from 'wechaty-puppet-mock'
import {
  WechatyVorpal,
}                   from 'wechaty-vorpal'

import { MathMaster } from './math_master'
import { gameScore }  from './game-score'
import { SCORE_MAX}   from './config'

test('math_master', async t => {
  /**
   * Setup Wechaty Mock System
   */
  const mocker = new mock.Mocker()
  const puppet = new PuppetMock({ mocker })
  const wechaty = new Wechaty({ puppet })

  /**
   * Install Vorpal & Match Master Command
   */
  const WechatyVorpalPlugin = WechatyVorpal({
    contact : true,
    use     : MathMaster(),
  })

  wechaty.use(WechatyVorpalPlugin)

  /**
   * Start Wechaty Environment
   */
  await wechaty.start()

  const [bot, player] = mocker.createContacts(2)
  mocker.login(bot)

  /**
   * Message Processing Logic
   */
  const onMessageText = (message: mock.MessageMock) => {
    const text = message.text()
    if (typeof text !== 'string')   { return }

    const talker = message.talker()
    console.info(`${talker.payload.name}: ${text}`)

    const MATH_RE = /(\d+) \+ (\d+) = \?/
    const match = text?.match(MATH_RE)
    if (match) {
      const result = parseInt(match[1], 10) + parseInt(match[2], 10)
      const timeout = match[1].length * 1000

      console.info('timeout:', timeout)
      setTimeout(() => {
        player.say(String(result)).to(talker)
      }, timeout)
    }

  }
  const onMessage = (message: mock.MessageMock) => {
    const type = message.type()
    switch (type) {
      case Message.Type.Text:
        onMessageText(message)
        break

      case Message.Type.Image:
        console.info('image message')
        break

      default:
        console.info('other message, type: %s[%s]', Message.Type[type], type)
        break
    }
  }
  player.on('message', onMessage)

  // const messageFuture = new Promise<Message>(resolve => wechaty.once('message', resolve))
  player.say('math_master').to(bot)

  const score = await gameScore(player)
  t.true(score >= SCORE_MAX, 'should play game and get a robot max score')

  await new Promise(setImmediate)
  await wechaty.stop()
})
