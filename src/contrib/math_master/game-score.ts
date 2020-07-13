import { Message }  from 'wechaty'
import { mock }     from 'wechaty-puppet-mock'

const gameScore = (player: mock.ContactMock) => new Promise<number>(resolve => {
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

export { gameScore }
