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

export {
  toMessage$,
  sameRoom,
  isText,
  isNotSelf,
}
