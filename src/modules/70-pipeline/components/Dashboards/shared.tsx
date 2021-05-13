import React from 'react'

export function roundNumber(value?: number, precision = 2) {
  if (typeof value !== 'number') {
    return value
  }
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function formatDuration(value?: number | string) {
  if (typeof value === 'string') {
    value = Number.parseInt(value)
  }
  if (typeof value !== 'number') {
    return
  }
  let signPrefix = undefined
  let h = 0
  let m = 0
  let s = 0
  if (value < 0) {
    signPrefix = '-'
    value = Math.abs(value)
  }
  if (value >= 3600) {
    h = Math.floor(value / 3600)
    value = value % 3600
  }
  if (value >= 60) {
    m = Math.floor(value / 60)
    value = value % 60
  }
  s = value
  const labelStyle = {
    fontSize: '0.7em',
    marginRight: '0.2em'
  }
  return (
    <>
      {signPrefix}
      {h > 0 && (
        <>
          {h}
          <span style={labelStyle}>h</span>
        </>
      )}
      {m > 0 && (
        <>
          {m}
          <span style={labelStyle}>m</span>
        </>
      )}
      <>
        {s}
        <span style={labelStyle}>s</span>
      </>
    </>
  )
}
