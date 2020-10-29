function normalizeRawCommand (rawCommand: string): string {
  const jsCode = rawCommand.replace(/^\s*eval\s*/i, '')
  return jsCode
}

export { normalizeRawCommand }
