/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { isEmpty, noop } from 'lodash-es'
import { Button, Formik } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { EntityConfig, FreezeObj, ResourcesInterface, ValidationErrorType } from '@freeze-windows/types'
import {
  FieldVisibility,
  getEmptyEntityConfig,
  getInitialValuesForConfigSection,
  getValidationSchema
} from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { ConfigRenderer } from './ConfigRenderer'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface ConfigsSectionProps {
  entityConfigs: EntityConfig[]
  getString: UseStringsReturn['getString']
  updateFreeze: (freeze: any) => void
  resources: ResourcesInterface
  fieldsVisibility: FieldVisibility
  isReadOnly: boolean
  validationErrors: ValidationErrorType
}
const ConfigsSection = (
  {
    entityConfigs,
    getString,
    updateFreeze,
    resources,
    fieldsVisibility,
    isReadOnly,
    validationErrors
  }: ConfigsSectionProps,
  _formikRef: unknown
) => {
  const formikRef = React.useRef()
  const [editViews, setEditViews] = React.useState<boolean[]>(
    Array(/* istanbul ignore next */ entityConfigs?.length).fill(false)
  )
  const [initialValues, setInitialValues] = React.useState(
    getInitialValuesForConfigSection(entityConfigs, getString, resources)
  )
  React.useEffect(() => {
    setInitialValues(getInitialValuesForConfigSection(entityConfigs, getString, resources))
  }, [
    resources.orgs.length,
    resources.projects.length,
    resources.services.length,
    Object.keys(resources.projectsByOrgId).length
  ])

  React.useEffect(() => {
    // When we change tab, we should open the invalid rules
    if (validationErrors?.entity) {
      const errors = validationErrors.entity || []
      setEditViews(_editViews => {
        const newEditViews = [..._editViews]
        errors.forEach((val, index) => {
          newEditViews[index] = isEmpty(val) ? newEditViews[index] : true
        })
        return newEditViews
      })
    }
  }, [validationErrors])

  React.useEffect(() => {
    if (editViews.length === 0 && entityConfigs.length > 0) {
      setEditViews(Array(/* istanbul ignore next */ entityConfigs?.length).fill(false))
    }
  }, [entityConfigs.length])

  const onDeleteRule = React.useCallback(index => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const currentValues = formikRef.current?.values
    const updatedValues = [...(currentValues?.entity || [])]
    updatedValues.splice(index, 1)
    setInitialValues({ entity: updatedValues })
    setEditViews(_editViews => {
      const newEditViews = [..._editViews]
      newEditViews.splice(index, 1)
      return newEditViews
    })
  }, [])

  const onAddRule = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const currentValues = /* istanbul ignore next */ formikRef.current?.values
    const addedConfig = getEmptyEntityConfig(fieldsVisibility)
    /* istanbul ignore next */
    const updatedEntityConfigs = [...(entityConfigs || []), addedConfig]
    const initValuesForAddedConfig = getInitialValuesForConfigSection([addedConfig], getString, resources)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const updatedValues = [...(currentValues?.entity || []), ...(initValuesForAddedConfig?.entity || [])]
    setInitialValues({ entity: updatedValues })
    updateFreeze({ entityConfigs: updatedEntityConfigs })
    setEditViews(_editViews => [..._editViews, true])
  }

  const setEditView = (index: number, isEdit: boolean) => {
    setEditViews(_editViews => {
      const newEditViews = [..._editViews]
      newEditViews[index] = isEdit
      return newEditViews
    })
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={noop}
        formName="freezeWindowStudioConfigForm"
        validationSchema={Yup.object().shape({
          entity: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required('Name is required'),
              ...getValidationSchema(fieldsVisibility.freezeWindowLevel)
            })
          )
        })}
      >
        {formikProps => {
          formikRef.current = formikProps as any
          ;(_formikRef as React.MutableRefObject<FormikProps<FreezeObj>>).current = formikProps as any

          return entityConfigs.map((config: EntityConfig, index: number) => (
            <ConfigRenderer
              key={index}
              config={config}
              isEdit={editViews[index]}
              setEditView={setEditView}
              getString={getString}
              index={index}
              updateFreeze={updateFreeze}
              formikProps={formikProps}
              entityConfigs={entityConfigs}
              resources={resources}
              fieldsVisibility={fieldsVisibility}
              onDeleteRule={onDeleteRule}
              isReadOnly={isReadOnly}
            />
          ))
        }}
      </Formik>
      <Button
        minimal
        withoutBoxShadow
        intent="primary"
        text="Add rule"
        icon="plus"
        onClick={onAddRule}
        disabled={isReadOnly}
        className={css.addNewRuleButton}
      />
    </>
  )
}

export const ConfigsSectionWithRef = React.forwardRef(ConfigsSection)
