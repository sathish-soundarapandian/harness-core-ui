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
import { Text, Color, Container, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import {
  ConnectorLabelMap,
  ConnectorTypes,
  ConnectorMap
} from '../../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/StartupScriptInterface.types'
import type { AzureArmProps } from '../AzureArm.types'
import css from './FileInputStep.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const FileInputStep = (props: AzureArmProps & { formik?: FormikContextType<any> }): JSX.Element => {
  const { inputSetData, readonly, path, allowableTypes, isParam = false, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isAccount, setIsAccount] = useState<boolean>(false)
  const type = isParam ? 'parameters' : 'template'
  const connectorType = get(inputSetData, `template.spec.configuration.${type}.store.type`)
  const newConnectorLabel = `${
    !!connectorType && getString(ConnectorLabelMap[connectorType as ConnectorTypes])
  } ${getString('connector')}`
  const inputSet = get(inputSetData, `template.spec.configuration.${type}`)
  return (
    <>
      <Container flex width={200} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>
          {getString(isParam ? 'cd.azureArm.paramFile' : 'cd.cloudFormation.templateFile')}
        </Text>
      </Container>
      {isValueRuntimeInput(inputSet?.store?.spec?.connectorRef as string) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeConnectorField
            label={<Text color={Color.GREY_900}>{newConnectorLabel}</Text>}
            type={ConnectorMap[connectorType as string]}
            name={`${path}.spec.configuration.${type}.store.spec.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            style={{ marginBottom: 10 }}
            multiTypeProps={{ expressions, allowableTypes }}
            disabled={readonly}
            setRefValue
            onChange={(value: any, _unused, _notUsed) => {
              /* istanbul ignore next */
              setIsAccount(value?.record?.spec?.type === 'Account')
            }}
          />
        </div>
      )}
      {(isAccount || isValueRuntimeInput(inputSet?.store?.spec?.repoName as string)) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.${type}.store.spec.repoName`}
            label={getString('pipelineSteps.repoName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.configuration.${type}.store.spec.repoName`}
            template={undefined}
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.store?.spec?.branch as string) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.${type}.store.spec.branch`}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.configuration.${type}.store.spec.branch`}
            template={undefined}
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.store?.spec?.commitId as string) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.${type}.store.spec.commitId`}
            label={getString('pipeline.manifestType.commitId')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.configuration.${type}.store.spec.commitId`}
            template={undefined}
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.store?.spec?.paths as string) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TextFieldInputSetView
            name={`${path}.spec.configuration.${type}.store.spec.paths[0]`}
            label={getString('common.git.filePath')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.configuration.${type}.store.spec.paths[0]`}
            template={undefined}
          />
        </div>
      )}
      {inputSet?.store?.type === 'Harness' && isValueRuntimeInput(inputSet?.store?.spec?.files as string) && (
        <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
          <FileStoreList
            name={`${path}.spec.configuration.${type}.store.spec.files`}
            type={FILE_TYPE_VALUES.FILE_STORE}
            allowOnlyOne={true}
            formik={formik}
            expressions={expressions}
          />
        </Layout.Vertical>
      )}
      {inputSet?.store?.type === 'Harness' && isValueRuntimeInput(inputSet?.store?.spec?.secretFiles as string) && (
        <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
          <FileStoreList
            name={`${path}.spec.configuration.${type}.store.spec.secretFiles`}
            type={FILE_TYPE_VALUES.ENCRYPTED}
            allowOnlyOne={true}
            formik={formik}
            expressions={expressions}
          />
        </Layout.Vertical>
      )}
    </>
  )
}
