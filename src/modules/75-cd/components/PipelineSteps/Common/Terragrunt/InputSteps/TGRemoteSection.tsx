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
import { connect, FormikContextType } from 'formik'
import { Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { isMultiTypeFixed, isValueRuntimeInput } from '@common/utils/utils'
import type { GitConfigDTO, Scope } from 'services/cd-ng'
import { shouldDisplayRepositoryName } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function TgRemoteSectionRef<T extends TerragruntData>(
  props: TerragruntProps<T> & {
    remoteVar: any
    index: number
    formik?: FormikContextType<any>
  }
): React.ReactElement {
  const { remoteVar, index, allowableTypes, readonly, initialValues, path, inputSetData, stepViewType, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const template = inputSetData?.template
  const [showRepoName, setShowRepoName] = useState(true)
  const isRepoRuntime =
    (isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.connectorRef')) ||
      isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.repoName'))) &&
    showRepoName

  return (
    <>
      <Container flex width={150}>
        <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
        {remoteVar.varFile?.identifier}
      </Container>

      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.connectorRef')) && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(
            initialValues,
            `${path}.configuration?.spec?.varFiles[${index}].varFile.spec.store.spec.connectorRef`,
            ''
          )}
          multiTypeProps={{ allowableTypes, expressions }}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={388}
          type={[remoteVar.varFile?.spec?.store?.type]}
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.connectorRef`}
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
                formik?.setFieldValue(
                  `${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.repoName`,
                  ''
                )
              }
            }
          }}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      )}

      {isRepoRuntime && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.repoName')}
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.repoName`}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.repoName`}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.branch')) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.branch`}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
          template={template}
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.branch`}
        />
      )}
      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.commitId')) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.commitId`}
          label={getString('pipeline.manifestType.commitId')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
          template={template}
          fieldPath={`spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.commitId`}
        />
      )}
      {isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.paths')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            label={getString('filePaths')}
            name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.store.spec.paths`}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            isNameOfArrayType
          />
        </div>
      )}
    </>
  )
}

const TgRemoteSection = connect(TgRemoteSectionRef)
export default TgRemoteSection
