/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Label } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { GitConfigDTO, Scope } from 'services/cd-ng'
import { shouldDisplayRepositoryName } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isMultiTypeFixed, isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import { getPath } from '../../ConfigFileStore/ConfigFileStoreHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { inputSetData, readonly, initialValues, path, allowableTypes, isBackendConfig, stepViewType, formik } = props
  const template = inputSetData?.template
  const configPath = getPath(false, false, isBackendConfig)
  const configSpec = get(template, configPath)
  const store = configSpec?.store
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [showRepoName, setShowRepoName] = useState(true)
  const isRepoRuntime =
    (isValueRuntimeInput(store?.spec?.connectorRef) || isValueRuntimeInput(store?.spec?.repoName)) && showRepoName

  return (
    <>
      {store?.spec && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {isBackendConfig ? getString('pipelineSteps.backendConfig') : getString('cd.configurationFile')}
        </Label>
      )}

      {isValueRuntimeInput(store?.spec?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            width={388}
            type={store?.type}
            name={`${path}.${configPath}.store.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
              if (isMultiTypeFixed(multiType)) {
                if (shouldDisplayRepositoryName(item)) {
                  setShowRepoName(true)
                } else {
                  setShowRepoName(false)
                  formik?.setFieldValue(`${path}.${configPath}.store.spec.repoName`, '')
                }
              }
            }}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {isRepoRuntime && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.repoName')}
          name={`${path}.${configPath}.store.spec.repoName`}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.repoName`}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {isValueRuntimeInput(store?.spec?.branch) && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          name={`${path}.${configPath}.store.spec.branch`}
          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
          disabled={readonly}
          className={cx(stepCss.formGroup, stepCss.md)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.branch`}
        />
      )}

      {isValueRuntimeInput(store?.spec?.commitId) && (
        <TextFieldInputSetView
          label={getString('pipeline.manifestType.commitId')}
          name={`${path}.${configPath}.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
          className={cx(stepCss.formGroup, stepCss.md)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.commitId`}
        />
      )}

      {isValueRuntimeInput(store?.spec?.folderPath) && (
        <TextFieldInputSetView
          label={getString('common.git.folderPath')}
          name={`${path}.${configPath}.store.spec.folderPath`}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`${configPath}.store.spec.folderPath`}
        />
      )}
    </>
  )
}

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection
