/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { v4 as uuid } from 'uuid'
import { Container } from '@harness/uicore'
import { Formik } from 'formik'
import { debounce, defaultTo, get, noop, set } from 'lodash-es'
import produce from 'immer'
import DeploymentInfraSpecifications from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraSpecifications/DeploymentInfraSpecifications'
import { useStrings } from 'framework/strings'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { DeploymentInfra } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import { getValidationSchema } from './DeploymentInfraUtils'
import css from '../DeploymentConfigForm.module.scss'

export const DeploymentInfraWrapper = ({ children }: React.PropsWithChildren<unknown>, formikRef: any): JSX.Element => {
  const ref = React.useRef<any | null>()
  const { getString } = useStrings()

  const { updateDeploymentConfig, deploymentConfig } = useDeploymentContext()

  const getDeploymentInfraValues = React.useCallback((): DeploymentInfra => {
    const instanceAttributes = get(
      deploymentConfig,
      'infrastructure.instanceAttributes'
    ) as DeploymentInfra['instanceAttributes']
    const infraVars = get(deploymentConfig, 'infrastructure.variables')
    return {
      ...(deploymentConfig?.infrastructure as DeploymentInfra),
      variables: Array.isArray(infraVars) ? infraVars : [],
      instanceAttributes: instanceAttributes?.map(variable => ({
        ...variable,
        id: uuid()
      }))
    }
  }, [deploymentConfig])

  /* istanbul ignore next */ React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return ref?.current?.resetForm()
    },
    submitForm() {
      return ref?.current?.submitForm()
    },
    getErrors() {
      return defaultTo(ref?.current.errors, {})
    }
  }))
  /* istanbul ignore next */
  const updateConfigValue = (infraValues: DeploymentInfra): void => {
    const updatedInfraValues = produce(infraValues, draft => {
      if (draft) {
        set(
          draft,
          'instanceAttributes',
          draft?.instanceAttributes?.map(({ id, ...variable }) => variable)
        )
      }
    })

    const updatedConfig = produce(deploymentConfig, draft => {
      if (draft) {
        set(draft, 'infrastructure', updatedInfraValues)
      }
    })
    updateDeploymentConfig(updatedConfig)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateTemplate = React.useCallback(
    debounce((infraValues: DeploymentInfra) => {
      updateConfigValue(infraValues)
    }, 300),
    [updateDeploymentConfig]
  )

  return (
    <Container className={css.infraWidgetWrapper}>
      <Formik
        formName="DeploymentConfigInfraForm"
        onSubmit={noop}
        initialValues={getDeploymentInfraValues()}
        validationSchema={getValidationSchema(getString)}
        validate={debounceUpdateTemplate}
      >
        {formik => {
          ref.current = formik
          return <DeploymentInfraSpecifications formik={formik} />
        }}
      </Formik>
      {children}
    </Container>
  )
}

export const DeploymentInfraWrapperWithRef = React.forwardRef<JSX.Element, React.PropsWithChildren<unknown>>(
  DeploymentInfraWrapper
)
