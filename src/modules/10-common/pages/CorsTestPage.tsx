import { Container } from '@harness/uicore'
import React, { useRef } from 'react'

export default function CorsTestPage() {
  const ref = useRef(null)
  const methodRef = useRef(null)
  const handleSubmit = ev => {
    ev.preventDefault()
    ev.stopPropagation()
    console.log(methodRef.current?.value)
    fetch(ref.current.value, {
      method: methodRef.current.value,
      body: JSON.stringify({})
    })
      .then(res => res.text())
      .then(res => {
        console.log(res)
      })
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <select ref={methodRef}>
          <option>GET</option>
          <option>POST</option>
        </select>
        <input type="text" name="url" placeholder="https://pr.harness.io/<namespace>/api/<endpoint>" ref={ref} />
        <button type="submit">Submit</button>
      </form>
    </Container>
  )
}
