import React, { useRef, useState } from 'react'

export default function CorsTestPage(): JSX.Element {
  const ref = useRef(null)
  const bodyRef = useRef(null)
  const [method, setMethod] = useState('GET')
  const handleSubmit = (ev): void => {
    ev.preventDefault()
    ev.stopPropagation()

    fetch(ref.current?.value, {
      method,
      body: method === 'POST' ? JSON.stringify(bodyRef.current.value) : void 0
    })
      .then(res => res.text())
      .then(res => {
        console.log(res)
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <select
          value={method}
          onChange={ev => {
            setMethod(ev.target.value)
          }}
        >
          <option>GET</option>
          <option>POST</option>
        </select>
        <input
          type="text"
          name="url"
          style={{ width: '500px' }}
          placeholder="https://pr.harness.io/<namespace>/api/<endpoint>"
          ref={ref}
        />
      </div>
      <div>{method === 'POST' ? <textarea name="body" ref={bodyRef} placeholder={'{}'} /> : null}</div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
