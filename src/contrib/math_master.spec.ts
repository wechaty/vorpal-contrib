#!/usr/bin/env ts-node

import {
  test,
}          from 'tstest'

import {
  Wechaty,
  Message,
}                     from 'wechaty'
import {
  Mocker,
  PuppetMock,
}                       from 'wechaty-puppet-mock'
import { MockMessage }  from 'wechaty-puppet-mock/dist/src/mocker/user/mock-message'

import {
  WechatyVorpal,
}                   from 'wechaty-vorpal'

import { MathMaster } from './math_master'

test('math_master', async t => {

  const mocker = new Mocker()
  const puppet = new PuppetMock({ mocker })
  const wechaty = new Wechaty({ puppet })

  const WechatyVorpalPlugin = WechatyVorpal({
    contact : true,
    use     : MathMaster(),
  })

  wechaty.use(WechatyVorpalPlugin)

  await wechaty.start()

  const [bot, player] = mocker.createContacts(2)
  mocker.login(bot)

  const onMessage = (message: MockMessage) => {
    const type = message.type()
    switch (type) {
      case Message.Type.Text:
        console.info('text message:', message.text())
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

  await new Promise(resolve => setTimeout(resolve, 3000))

  t.ok('test')
  await wechaty.stop()
})
