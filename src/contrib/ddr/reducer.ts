import { Message } from 'wechaty'

const TIMER_ID = Symbol('timerId')

const initialState: {
  [TIMER_ID]?: Record,
  [id: string]: Record
} = {}

/**
 * Async reducer: https://stackoverflow.com/a/41243567/1123955
 */
const nextState = async (stateFuture: Promise<State>, message?: Message): Promise<State> => {
  const state = await stateFuture
  if (!message) {
    state[TIMER_ID] = {
      name: 'start timestamp',
      time: Date.now() / 1000,
    }
    return state
  }

  const startTimestamp = state[TIMER_ID]?.time ?? 0

  const talker = message.talker()
  const room = message.room()

  let name: string
  if (room) {
    name = await room.alias(talker) || talker.name()
  } else {
    name = talker.name()
  }

  return {
    ...state,
    [talker.id]: {
      name,
      time: Date.now() / 1000 - startTimestamp,
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
