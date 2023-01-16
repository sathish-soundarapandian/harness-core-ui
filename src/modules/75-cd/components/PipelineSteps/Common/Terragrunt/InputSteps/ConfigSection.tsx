/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Label } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import { getPath } from '../../ConfigFileStore/ConfigFileStoreHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { inputSetData, readonly, initialValues, path, allowableTypes, isBackendConfig, stepViewType } = props

  const configPath = getPath(false, false, isBackendConfig)
  const configSpec = get(inputSetData?.template, configPath)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <>
      {configSpec?.store?.spec && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {isBackendConfig ? getString('pipelineSteps.backendConfig') : getString('cd.configurationFile')}
        </Label>
      )}

      {isValueRuntimeInput(configSpec?.store?.spec?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            width={388}
            type={[Connectors.GIT, Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET]}
            name={`${path}.${configPath}.store.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {isValueRuntimeInput(configSpec?.store?.spec?.branch) && (
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
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.branch`}
        />
      )}

      {isValueRuntimeInput(configSpec?.store?.spec?.commitId) && (
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
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.commitId`}
        />
      )}

      {isValueRuntimeInput(configSpec?.store?.spec?.folderPath) && (
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
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.folderPath`}
        />
      )}
    </>
  )
}

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection
