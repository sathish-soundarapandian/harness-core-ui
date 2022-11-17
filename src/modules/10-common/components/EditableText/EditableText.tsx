/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import ContentEditable from 'react-contenteditable'
import { Icon } from '@harness/uicore'

import css from './EditableText.module.scss'

interface EditableTextProps {
  value?: string
  editable?: boolean
  onChange?: (value: string) => void
}

const EditableText: React.FC<EditableTextProps> = props => {
  const { value, onChange, editable = true } = props
  const [val, setVal] = useState(value || '')
  const [editing, setEditing] = useState(false)

  return (
    <>
      <ContentEditable
        html={val}
        disabled={!editable || !editing}
        className={cx(css.editableText, { [css.editing]: editing })}
        tagName="span"
        onChange={ev => {
          setVal(ev.target.value)
          onChange?.(ev.target.value)
        }}
        onBlur={_ => {
          setEditing(false)
        }}
      />
      {editable && !editing ? (
        <Icon
          name="edit"
          style={{ paddingBottom: '4px' }}
          size={8}
          onClick={() => {
            setEditing(true)
          }}
        />
      ) : null}
    </>
  )
}

export default EditableText
