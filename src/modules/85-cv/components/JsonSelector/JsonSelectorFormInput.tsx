/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { get, isEmpty } from 'lodash-es'
import { FormGroup, Dialog, Icon, Spinner } from '@blueprintjs/core'
import { Container, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import classnames from 'classnames'
import JsonSelector from './JsonSelector'
import css from './JsonSelectorFormInput.module.scss'

interface JsonSelectorFormInputProps {
  name: string
  label: string
  json?: Record<string, any>
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}

function getPlaceholderAndTextColor(
  loading?: boolean,
  json?: Record<string, any>,
  placeholder?: string,
  selectedJsonVal?: string
): { value?: string; valueColor: Color } {
  if (loading) {
    return { value: '', valueColor: Color.BLACK }
  } else if (!selectedJsonVal || !Object.keys(selectedJsonVal)?.length) {
    return { value: !json || !Object.keys(json)?.length ? 'No data' : placeholder, valueColor: Color.GREY_400 }
  }
  return { value: selectedJsonVal, valueColor: Color.BLACK }
}

const JsonSelectorFormInput = (props: JsonSelectorFormInputProps & { formik?: any }): JSX.Element => {
  const { name, label, json, formik, loading, placeholder, disabled = false } = props
  const { value, valueColor } = getPlaceholderAndTextColor(loading, json, placeholder, get(formik.values, name))
  const validationError = get(formik.touched, name) ? get(formik.errors, name) : undefined

  const onPathSelect = (path: string): void => {
    hideModal()
    formik.setFieldValue(name, path)
    formik.setFieldTouched(name, true)
  }

  const onOpenModal = (): void => {
    if (!isEmpty(json)) openModal()
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        usePortal
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideModal}
        style={{ width: 1200, height: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}
      >
        <div className={css.dialogContent}>
          <div className={css.leftColumn}>
            Select service <br /> instance field name
          </div>
          <JsonSelector className={css.rightColumn} json={json || {}} onPathSelect={onPathSelect} />
        </div>
      </Dialog>
    ),
    [json]
  )

  return (
    <FormGroup
      labelFor={name}
      label={label}
      disabled={disabled}
      helperText={validationError}
      intent={validationError?.length ? 'danger' : undefined}
    >
      <Container className={classnames('bp3-input-group', css.inputGroup, disabled ? 'bp3-disabled' : undefined)}>
        <Container
          className={classnames('bp3-input', css.input, disabled ? css.disabledLook : undefined)}
          onClick={onOpenModal}
        >
          <Text color={valueColor}>{value}</Text>
        </Container>
        {loading ? (
          <Spinner size={8} className={css.loadingJsonIcon} />
        ) : (
          <Icon className={css.inputIcon} icon="plus" iconSize={12} />
        )}
      </Container>
    </FormGroup>
  )
}

export default connect(JsonSelectorFormInput)
