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
    // console.info(`${talker.payload.name}: ${text}`)

    const MATH_RE = /(\d+) \+ (\d+) = \?/
    const match = text?.match(MATH_RE)
    if (match) {
      const result = parseInt(match[1], 10) + parseInt(match[2], 10)

      // const timeout = match[1].length * 1000
      // console.info('timeout:', timeout)
      // setTimeout(() => {
      //   player.say(String(result)).to(talker)
      // }, timeout)

      setImmediate(() => player.say(String(result)).to(talker))
    }

  }
  const onMessage = (message: mock.MessageMock) => {
    const type = message.type()
    switch (type) {
      case Message.Type.Text:
        onMessageText(message)
        break

      case Message.Type.Image:
        // console.info('image message')
        break

      default:
        // console.info('other message, type: %s[%s]', Message.Type[type], type)
        break
    }
  }
  player.on('message', onMessage)

  // const messageFuture = new Promise<Message>(resolve => wechaty.once('message', resolve))
  player.say('math_master').to(bot)

  const scoreFuture = expectGameScore(player)
  const boardFuture = expectGameBoard(player, bot)

  const score = await scoreFuture
  t.true(score >= 1, 'should play game and get a score')

  // console.info('before expectGameBoard')
  await boardFuture
  // console.info('after expectGameBoard')

  await new Promise(setImmediate)
  await new Promise(resolve => setTimeout(resolve, 100))
  await wechaty.stop()
  // console.info('after wechaty.stop()')
})

function expectGameScore (player: mock.ContactMock) {
  return  new Promise<number>(resolve => {
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      const text = message.text() || ''
      if (!/Game Over/i.test(text))             { return }

      const match = text.match(/score is: (\d+)!/i)
      if (match) {
        const n = parseInt(match[1], 10)
        resolve(n)
      } else {
        resolve(0)
      }
      player.off('message', onMessage)
    }
    player.on('message', onMessage)
  })
}

function expectGameBoard (player: mock.ContactMock, bot: mock.ContactMock) {
  return  new Promise<number>(resolve => {
    const onMessage = (message: mock.MessageMock) => {
      if (message.type() !== Message.Type.Text) { return }
      const text = message.text() || ''

      if (/ say /i.test(text)) {
        // console.info('say ...')
        player.say('my comment to leader board').to(bot)
        resolve()
        player.off('message', onMessage)
      }
    }
    player.on('message', onMessage)
  })
}
