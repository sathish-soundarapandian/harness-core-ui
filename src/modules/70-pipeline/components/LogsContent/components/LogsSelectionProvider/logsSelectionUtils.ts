import { ansiToJson } from 'anser'

export function getSelectedLogs(data: string[], fromIdx: number, toIdx: number): string[] {
  return [...data].splice(fromIdx, toIdx - fromIdx + 1)
}

export function formatLogsForClipboard(data: string[]): string {
  return data
    .map(row => {
      return ansiToJson(row)
        .map(part => part.content)
        .join('')
    })
    .join('\n')
}
