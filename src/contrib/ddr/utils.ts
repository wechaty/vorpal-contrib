import {
  from,
}                   from 'rxjs'
import {
  mapTo,
}                   from 'rxjs/operators'
import {
  Message,
  Wechaty,
  Room,
}                   from 'wechaty'
import {
  MessagePayload,
}                   from 'wechaty-puppet'

const toMessage$ = (wechaty: Wechaty) => (payload: MessagePayload) => {
  const message = wechaty.Message.load(payload.id)
  return from(
    message.ready()
  ).pipe(
    mapTo(message),
  )
}
const inRoom = (room: null | Room) => (message: Message): boolean => !!(room && room === message.room())
const isDong = (dong: string) => (message: Message) => {
  if (message.type() === Message.Type.Text) {
    return message.text() === dong
  }
  return false
}

export {
  toMessage$,
  inRoom,
  isDong,
}
