async function asyncEval<T extends unknown> (code: string): Promise<T> {
  // eslint-disable-next-line no-eval
  return eval(`(async function asyncEval () { ${code} }).call(this)`)
}

export { asyncEval }
