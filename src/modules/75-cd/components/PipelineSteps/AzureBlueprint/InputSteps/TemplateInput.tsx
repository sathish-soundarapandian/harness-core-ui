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
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { AzureBlueprintProps } from '../AzureBlueprintTypes.types'
import {
  ConnectorLabelMap,
  ConnectorTypes,
  ConnectorMap
} from '../../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/StartupScriptInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './Template.module.scss'

export const TemplateInputStep = (props: AzureBlueprintProps & { formik?: FormikContextType<any> }): JSX.Element => {
  const { inputSetData, readonly, path, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  /* istanbul ignore next */
  const connectorType = get(inputSetData, `template.spec.configuration.template.store.type`)
  /* istanbul ignore next */
  const newConnectorLabel = `${
    !!connectorType && getString(ConnectorLabelMap[connectorType as ConnectorTypes])
  } ${getString('connector')}`
  const [isAccount, setIsAccount] = useState<boolean>(false)
  const inputSet = get(inputSetData, 'template.spec.configuration.template')
  return (
    <>
      <Container flex width={120} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('cd.cloudFormation.templateFile')}</Text>
      </Container>
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSet?.store?.spec?.connectorRef as string) && (
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
              setRefValue
              onChange={(value: any, _unused, _notUsed) => {
                /* istanbul ignore next */
                setIsAccount(value?.record?.spec?.type === 'Account')
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        (isAccount || isValueRuntimeInput(inputSet?.store?.spec?.repoName as string)) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <TextFieldInputSetView
              name={`${path}.spec.configuration.template.store.spec.repoName`}
              label={getString('pipelineSteps.repoName')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={'spec.configuration.template.store.spec.repoName'}
              template={inputSetData?.template}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSet?.store?.spec?.branch as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <TextFieldInputSetView
              name={`${path}.spec.configuration.template.store.spec.branch`}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={'spec.configuration.template.store.spec.branch'}
              template={inputSetData?.template}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSet?.store?.spec?.commitId as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <TextFieldInputSetView
              name={`${path}.spec.configuration.template.store.spec.commitId`}
              label={getString('pipeline.manifestType.commitId')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={'spec.configuration.template.store.spec.commitId'}
              template={inputSetData?.template}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSet?.store?.spec?.folderPath as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <TextFieldInputSetView
              name={`${path}.spec.configuration.template.store.spec.folderPath`}
              label={getString('cd.azureBlueprint.templateFolderPath')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              fieldPath={'spec.configuration.template.store.spec.folderPath'}
              template={inputSetData?.template}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        inputSet?.store?.type === 'Harness' && isValueRuntimeInput(inputSet?.store?.spec?.files as string) && (
          <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
            <FileStoreList
              name={`${path}.spec.configuration.template.store.spec.files`}
              type={'fileStore'}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )
      }
      {
        /* istanbul ignore next */
        inputSet?.store?.type === 'Harness' && isValueRuntimeInput(inputSet?.store?.spec?.secretFiles as string) && (
          <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
            <FileStoreList
              name={`${path}.spec.configuration.template.store.spec.secretFiles`}
              type={'encrypted'}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )
      }
    </>
  )
}
