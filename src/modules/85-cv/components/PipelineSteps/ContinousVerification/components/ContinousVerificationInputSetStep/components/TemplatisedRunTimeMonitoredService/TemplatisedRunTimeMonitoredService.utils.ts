import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

export function getRunTimeInputsFromHealthSource(spec: any, path: string): { name: string; path: string }[] {
  return Object.entries(spec)
    .filter(item => item[1] === RUNTIME_INPUT_VALUE)
    .map(item => {
      return { name: item[0], path: `${path}.${item[0]}` }
    })
}
