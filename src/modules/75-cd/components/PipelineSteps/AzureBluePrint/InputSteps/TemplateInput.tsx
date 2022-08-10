/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import cx from 'classnames'
import type { FormikContextType } from 'formik'
import { FormInput, Text, Color, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  AzureBlueprintProps,
  isRuntime,
  ConnectorLabelMap,
  ConnectorTypes,
  ConnectorMap
} from '../AzureBluePrintTypes.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const TemplateInputStep = (props: AzureBlueprintProps & { formik?: FormikContextType<any> }): JSX.Element => {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isAccount, setIsAccount] = useState<boolean>(false)
  /* istanbul ignore next */
  const connectorType = get(inputSetData, `template.spec.configuration.template.store.type`)
  /* istanbul ignore next */
  const newConnectorLabel = `${
    !!connectorType && getString(ConnectorLabelMap[connectorType as ConnectorTypes])
  } ${getString('connector')}`

  const inputSet = get(inputSetData, 'template.spec.configuration.template')
  return (
    <>
      <Container flex width={120} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('cd.cloudFormation.templateFile')}</Text>
      </Container>
      {
        /* istanbul ignore next */
        isRuntime(inputSet?.store?.spec?.connectorRef as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeConnectorField
              label={<Text color={Color.GREY_900}>{newConnectorLabel}</Text>}
              type={ConnectorMap[connectorType as string]}
              name={`${path}.spec.configuration.template.store.spec.connectorRef`}
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              style={{ marginBottom: 10 }}
              multiTypeProps={{ expressions, allowableTypes }}
              disabled={readonly}
              onChange={(value: any, _unused, _notUsed) => {
                /* istanbul ignore next */
                const scope = value?.scope
                let newConnectorRef: string
                /* istanbul ignore next */
                if (scope === 'account') {
                  setIsAccount(true)
                }
                /* istanbul ignore next */
                if (scope === 'org' || scope === 'account') {
                  newConnectorRef = `${scope}.${value?.record?.identifier}`
                } else {
                  newConnectorRef = value?.record?.identifier
                }
                /* istanbul ignore next */
                formik?.setFieldValue(`${path}.spec.configuration.template.store.spec.connectorRef`, newConnectorRef)
              }}
              setRefValue
            />
          </div>
        )
      }
      {/*
        *
        If a connector type of account is chosen
        we need to get the repo name to access the files
        *
        */}
      {
        /* istanbul ignore next */
        (isAccount || isRuntime(inputSet?.store?.spec?.repoName as string)) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.template.store.spec.repoName`}
              label={getString('pipelineSteps.repoName')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSet?.store?.spec?.branch as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.template.store.spec.branch`}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSet?.store?.spec?.commitId as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.template.store.spec.commitId`}
              label={getString('pipeline.manifestType.commitId')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSet?.store?.spec?.paths as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.template.store.spec.paths[0]`}
              label={getString('common.git.filePath')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )
      }
    </>
  )
}
