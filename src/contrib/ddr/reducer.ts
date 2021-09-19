import type { Message } from 'wechaty'
import type {
  DeepReadonly,
}                 from 'utility-types'

interface Record {
  id: string,
  name: string,
  time: number,
}

const initialState: DeepReadonly<{
  meta: {
    time: number
  },
  payload: {
    [id: string]: Record
  }
}> = {
  meta: {
    time: 0,
  },
  payload: {},
}

// https://stackoverflow.com/a/43001581/1123955
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> }

type State = DeepWriteable<typeof initialState>

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

  const newState = {
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
  return newState
}

export type {
  State,
  Record,
}
export {
  nextState,
  initialState,
}
