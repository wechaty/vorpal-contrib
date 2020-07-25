import {
  from,
}                   from 'rxjs'
import {
  mapTo,
}                   from 'rxjs/operators'
import {
  Message,
  Wechaty,
}                   from 'wechaty'
import {
  EventMessagePayload,
}                   from 'wechaty-puppet'
import moment from 'moment'

const toMessage$ = (wechaty: Wechaty) => (payload: EventMessagePayload) => {
  const message = wechaty.Message.load(payload.messageId)
  return from(
    message.ready()
  ).pipe(
    mapTo(message),
  )
}

const sameRoom = (roomMessage: Message) => (message: Message): boolean => !!(roomMessage.room() && roomMessage.room() === message.room())
const isNotSelf = (message: Message) => !message.self()
const isText = (textList: string | string[]) => (message: Message) => {
  if (!Array.isArray(textList)) {
    textList = [textList]
  }

  return textList.some(text => message.type() === Message.Type.Text
    ? message.text() === text
    : false
  )
}

const toSeconds = (text: number | string): number => {
  let seconds = -1
  if (typeof text === 'string') {
    const match = text.match(/^(\d+)(\w*)$/)
    if (match) {
      if (match[2]) {           // '60s'
        seconds = moment.duration(
          parseInt(match[1], 10),
          match[2] as any,
        ).asSeconds()
      } else {                  // '60'
        seconds = parseInt(match[1], 10)
      }
    }
  } else {
    seconds = text
  }
  return seconds
}

export {
  toMessage$,
  sameRoom,
  isText,
  isNotSelf,
  toSeconds,
}
