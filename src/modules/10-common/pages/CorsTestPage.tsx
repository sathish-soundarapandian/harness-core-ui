import React, { useRef, useState } from 'react'
import SessionToken from 'framework/utils/SessionToken'

export default function CorsTestPage(): JSX.Element {
  const ref = useRef(null)
  const bodyRef = useRef(null)
  const tokenRef = useRef(null)
  const [method, setMethod] = useState('GET')
  const handleSubmit = (ev): void => {
    ev.preventDefault()
    ev.stopPropagation()
    const sendToken = tokenRef?.current?.checked

    const headers = {}
    if (sendToken) {
      headers['Authorization'] = `Bearer ${SessionToken.getToken()}`
    }

    fetch(ref.current?.value, {
      method,
      headers,
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
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          type="text"
          name="url"
          style={{ width: '500px' }}
          defaultValue={'https://app.harness.io/gateway/pipeline/api/pipelines/list'}
          ref={ref}
        />
      </div>
      <div>
        <input type="checkbox" ref={tokenRef} defaultChecked={true} id="sendToken" />
        <label htmlFor="sendToken">Send Token</label>
      </div>
      <div>
        {method === 'POST' || method === 'PUT' ? <textarea name="body" ref={bodyRef} defaultValue={'{}'} /> : null}
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
