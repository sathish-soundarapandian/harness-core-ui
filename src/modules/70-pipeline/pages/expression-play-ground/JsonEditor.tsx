import { JSONEditor } from 'vanilla-jsoneditor'
import React, { useEffect, useRef } from 'react'

export default function SvelteJSONEditor(props) {
  const refContainer = useRef(null)
  const refEditor = useRef(null)

  useEffect(() => {
    // create editor
    console.log('create editor', refContainer.current)
    refEditor.current = new JSONEditor({
      target: refContainer.current,
      props: { mainMenuBar: false, expand: true }
    })

    return () => {
      // destroy editor
      if (refEditor.current) {
        console.log('destroy editor')
        refEditor.current.destroy()
        refEditor.current = null
      }
    }
  }, [])

  // update props
  useEffect(() => {
    if (refEditor.current) {
      console.log('update props', props)
      refEditor.current.updateProps(props)
    }
  }, [props])

  return <div style={{ display: 'flex', flex: 1 }} ref={refContainer}></div>
}
