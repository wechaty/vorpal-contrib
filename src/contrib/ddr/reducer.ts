import { Message } from 'wechaty'

const initialState: {
  meta: {
    time: number
  },
  payload: {
    [id: string]: Record
  }
} = {
  meta: {
    time: 0,
  },
  payload: {},
}

/**
 * Async reducer: https://stackoverflow.com/a/41243567/1123955
 */
const nextState = async (stateFuture: Promise<State>, message?: Message): Promise<State> => {
  // Resolve the promised returned from the previous reducer
  const state = await stateFuture

  // Init the state for the first time (received a `undefined` value)
  if (!message) {
    return {
      meta: {
        time: Date.now(),
      },
      payload: {},
    }
  }

  const talker = message.talker()
  const room   = message.room()

  let name = talker.name()
  if (room) {
    const alias = await room.alias(talker)
    if (alias) {
      name = alias
    }
  }

  return {
    ...state,
    payload: {
      ...state.payload,
      [talker.id]: {
        id: talker.id,
        name,
        time: Date.now()  - state.meta.time,
      },
    },
  }
}

export type State = typeof initialState
export interface Record {
  id: string,
  name: string,
  time: number,
}
export {
  nextState,
  initialState,
}
