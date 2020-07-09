// Credit: https://stackoverflow.com/a/42591325/1123955
function regexFromString (str: string): RegExp {
  const match = /^\/(.*)\/([a-z]*)$/.exec(str)
  if (match) {
    return new RegExp(match[1], match[2])
  } else {
    return new RegExp(str)
  }
}

export { regexFromString }
