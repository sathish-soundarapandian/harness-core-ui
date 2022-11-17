/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import classnames from 'classnames'
import { Container } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { EntityConfig, ResourcesInterface } from '@freeze-windows/types'
import { convertValuesToYamlObj, FieldVisibility } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { ConfigEditModeRenderer } from './ConfigEditModeRenderer'
import { ConfigViewModeRenderer } from './ConfigViewModeRenderer'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface ConfigRendererProps {
  config: EntityConfig
  isEdit: boolean
  setEditView: (index: number, isEdit: boolean) => void
  getString: UseStringsReturn['getString']
  index: number
  updateFreeze: (freeze: any) => void
  formikProps: any
  entityConfigs: EntityConfig[]
  resources: ResourcesInterface
  fieldsVisibility: FieldVisibility
  onDeleteRule: (index: number) => void
  isReadOnly: boolean
}

export const ConfigRenderer = ({
  config,
  isEdit,
  setEditView,
  getString,
  index,
  updateFreeze,
  formikProps,
  entityConfigs,
  resources,
  fieldsVisibility,
  onDeleteRule,
  isReadOnly
}: ConfigRendererProps) => {
  const saveEntity = async () => {
    const formErrors = await formikProps.validateForm()
    if (!isEmpty(formErrors?.entity?.[index])) {
      formikProps.setErrors(formErrors)
      const errorKeys = Object.keys(formErrors.entity[index])
      const newTouchedObj: { [key: string]: boolean } = {}
      errorKeys.forEach(k => (newTouchedObj[`entity[${index}].${k}`] = true))
      formikProps.setTouched({ ...formikProps.touched, ...newTouchedObj }) // required to display
      return
    }
    const values = formikProps.values.entity

    const updatedEntityConfigs = [...entityConfigs]
    updatedEntityConfigs[index] = convertValuesToYamlObj(updatedEntityConfigs[index], values[index], fieldsVisibility)

    updateFreeze({ entityConfigs: updatedEntityConfigs })
    setEditView(index, false)
  }

  const setVisualViewMode = React.useCallback(() => {
    setEditView(index, false)
  }, [])
  const setEditViewMode = React.useCallback(() => {
    setEditView(index, true)
  }, [])

  const deleteConfig = () => {
    const updatedEntityConfigs = entityConfigs.filter((_, i) => index !== i)
    updateFreeze({ entityConfigs: updatedEntityConfigs })
    onDeleteRule(index)
  }

  return (
    <Container
      padding="large"
      className={classnames(css.configFormContainer, { [css.isEditView]: isEdit })}
      margin={{ top: 'xlarge' }}
    >
      {isEdit ? (
        <ConfigEditModeRenderer
          index={index}
          getString={getString}
          formikProps={formikProps}
          resources={resources}
          saveEntity={saveEntity}
          setVisualView={setVisualViewMode}
          fieldsVisibility={fieldsVisibility}
        />
      ) : (
        <ConfigViewModeRenderer
          index={index}
          config={config}
          getString={getString}
          setEditView={setEditViewMode}
          deleteConfig={deleteConfig}
          fieldsVisibility={fieldsVisibility}
          resources={resources}
          isReadOnly={isReadOnly}
        />
      )}
    </Container>
  )
}
