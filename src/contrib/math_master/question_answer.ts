import type { types } from 'wechaty-plugin-contrib'

import type { State } from './reducer.js'

const generateQuestionAnswer = (score: number) => {
  const randomNumber = () => {
    const difficulty = Math.floor(score / 3) + 1
    return Math.floor(Math.random() * Math.pow(10, difficulty))
  }

  const x = randomNumber()
  const y = randomNumber()

  return {
    answer: x + y,
    question: `${x} + ${y}`,
  }
}

const isCorrectAnswer = ({ answer }: State) => (msg: types.SayableMessage) => {
  if (typeof msg === 'string') {
    return parseInt(msg.trim(), 10) === answer
  }
  return false
}

export {
  generateQuestionAnswer,
  isCorrectAnswer,
}
