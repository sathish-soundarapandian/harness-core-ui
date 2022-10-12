/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, FormInput, Layout } from '@wings-software/uicore'

import type { GitConfigDTO, Scope } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { List } from '@common/components/List/List'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { shouldDisplayRepositoryName } from '../K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import type { ECSRunTaskStepInitialValues } from './ECSRunTaskStep'
import css from './ECSRunTaskStepInputSet.module.scss'

export interface ECSRunTaskStepInputSetProps {
  initialValues: ECSRunTaskStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSRunTaskStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<ECSRunTaskStepInitialValues>
}

interface TaskDefinitionFieldsProps extends ECSRunTaskStepInputSetProps {
  prefixPath: string
}
const TaskDefinitionFields = (props: TaskDefinitionFieldsProps) => {
  const { initialValues, formik, inputSetData, allowableTypes, prefixPath } = props
  const { template, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [showRepoName, setShowRepoName] = useState(true)

  return (
    <>
      {getMultiTypeFromValue(template?.spec?.taskDefinition?.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={readonly}
            name={`${prefixPath}.connectorRef`}
            selected={get(initialValues, `spec.taskDefinition.spec.connectorRef`, '')}
            label={getString('connector')}
            placeholder={''}
            setRefValue
            multiTypeProps={{
              allowableTypes,
              expressions
            }}
            width={391}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={ManifestToConnectorMap[defaultTo(template?.spec?.taskDefinition?.type, '')]}
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
              if (multiType === MultiTypeInputType.FIXED) {
                if (shouldDisplayRepositoryName(item)) {
                  setShowRepoName(false)
                } else {
                  setShowRepoName(true)
                }
              }
            }}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.taskDefinition?.spec.repoName) === MultiTypeInputType.RUNTIME &&
        showRepoName && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${prefixPath}.repoName`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('common.repositoryName')}
            />
          </div>
        )}

      {getMultiTypeFromValue(template?.spec?.taskDefinition?.spec.branch) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <TextFieldInputSetView
            disabled={readonly}
            name={`${prefixPath}.branch`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            fieldPath={`spec.taskDefinition.spec.branch`}
            template={template}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.taskDefinition?.spec.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${prefixPath}.commitId`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.commitIdValue')}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.taskDefinition?.spec.paths) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <List
            formik={formik}
            labelClassName={css.listLabel}
            label={getString('fileFolderPathText')}
            name={`${prefixPath}.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            allowOnlyOne
          />
        </div>
      )}
    </>
  )
}

const ECSRunTaskStepInputSetModeFormikForm = (props: ECSRunTaskStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      <TaskDefinitionFields {...props} prefixPath={`${prefix}spec.taskDefinition.spec`} />

      <TaskDefinitionFields {...props} prefixPath={`${prefix}spec.runTaskRequestDefinition.spec`} />
    </Layout.Vertical>
  )
}

export const ECSRunTaskStepInputSetMode = connect(ECSRunTaskStepInputSetModeFormikForm)
