import { Message } from 'wechaty'

const initialState: {
  [id: string]: Record
} = {}

const createTimeCounter = () => {
  const startTimestamp = Date.now()
  return () => Date.now() - startTimestamp
}

const timeCounter = createTimeCounter()

const nextState = (state: State, message?: Message): State => {
  if (!message) { return state }

  const talker = message.talker()
  return {
    ...state,
    [talker.id]: {
      name: message.talker().name(),
      time: timeCounter(),
    },
  }
}

export type State = typeof initialState
export interface Record {
  name: string,
  time: number,
}
export {
  nextState,
  initialState,
}
