import type { ObsIo } from 'wechaty-vorpal'
import type { types } from 'wechaty-plugin-contrib'

import {
  generateQuestionAnswer,
  isCorrectAnswer,
}                           from './question_answer.js'
import {
  TIMER_MAX,
  SCORE_MAX,
}               from './config.js'

const initialGameState = {
  ...generateQuestionAnswer(0),
  score    : 0,
  timer    : TIMER_MAX,
}

type State = typeof initialGameState

const nextState = (stdout: ObsIo['stdout']) => (
  state: State,
  value: types.TalkerMessage,
): State => {
  if (typeof value !== 'string') {
    return state
  }

  let newScore = state.score
  let newTimer = state.timer

  const correct = isCorrectAnswer(state)(value)
  if (correct) {
    newScore++
    stdout.next(`Answer Correct! ${state.question} = ${state.answer}`)
  } else {
    newTimer = -1 // Game Over
    stdout.next(`Wrong! The correct answer is: ${state.answer}, your answer is ${value}. Try harder next time!`)
  }

  if (state.score > SCORE_MAX) {
    stdout.next('OOPS! You are not human!')
    newTimer = -1
  }

  return {
    ...state,
    ...generateQuestionAnswer(newScore),
    score: newScore,
    timer: newTimer,
  }
}

export type {
  State,
}
export {
  initialGameState,
  nextState,
}
