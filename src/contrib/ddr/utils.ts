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
const isText = (text: string) => (message: Message) => {
  if (message.type() === Message.Type.Text) {
    return message.text() === text
  }
  return false
}

export {
  toMessage$,
  sameRoom,
  isText,
  isNotSelf,
}
