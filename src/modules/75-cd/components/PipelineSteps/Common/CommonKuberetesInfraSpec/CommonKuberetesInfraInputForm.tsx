/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Menu } from '@blueprintjs/core'
import { Text, Layout, getMultiTypeFromValue, MultiTypeInputType, SelectOption, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { memoize, defaultTo, isEmpty } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { K8sGcpInfrastructure, Failure } from 'services/cd-ng'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'

import { Scope } from '@common/interfaces/SecretsInterface'

import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './CommonKuberetesInfraSpecEditable.module.scss'

export type K8sGcpInfrastructureTemplate = { [key in keyof K8sGcpInfrastructure]: string }

interface CommonKuberetesInfraInputFormProps {
  template?: K8sGcpInfrastructureTemplate
  allowableTypes: AllowedTypes
  clusterError: GetDataError<Failure | Error> | null
  clusterLoading: boolean
  fetchClusters: (connectorRef: string) => void
  path: string
  readonly: boolean
  stepViewType?: StepViewType
  clusterOptions: SelectOption[]
  setClusterOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  connectorType: 'Aws' | 'Gcp'
  connectorRef?: string
}
export function CommonKuberetesInfraInputForm({
  template,
  readonly = false,
  path,
  allowableTypes,
  stepViewType,
  clusterLoading,
  clusterError,
  clusterOptions,
  setClusterOptions,
  fetchClusters,
  connectorType,
  connectorRef
}: CommonKuberetesInfraInputFormProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const connectorTypeLowerCase = connectorType.toLowerCase()
  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item text={item.label} disabled={clusterLoading} onClick={handleClick} />
    </div>
  ))

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: `${connectorTypeLowerCase}InfraConnector`
            }}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorType}
            setRefValue
            onChange={
              /* istanbul ignore next */ (selected, _typeValue, type) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                if (type === MultiTypeInputType.FIXED) {
                  const connectorRefValue =
                    item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                      ? `${item.scope}.${item?.record?.identifier}`
                      : item.record?.identifier
                  connectorRefValue && fetchClusters(connectorRefValue)
                } else {
                  fetchClusters(selected as string)
                  setClusterOptions([])
                }
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.connectorRef
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md, css.clusterInputWrapper)}
          name={`${path}.cluster`}
          disabled={readonly}
          placeholder={
            clusterLoading
              ? /* istanbul ignore next */ getString('loading')
              : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
          }
          useValue
          selectItems={clusterOptions}
          label={getString('common.cluster')}
          multiTypeInputProps={{
            selectProps: {
              items: clusterOptions,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addClearBtn: !(clusterLoading || readonly),
              noResults: (
                <Text padding={'small'}>
                  {clusterLoading
                    ? getString('loading')
                    : defaultTo(
                        getRBACErrorMessage(
                          clusterError as RBACError // clusterError={clusterError || clustersForInfraError}
                        ),
                        getString('cd.pipelineSteps.infraTab.clusterError')
                      )}
                </Text>
              )
            },
            expressions,
            allowableTypes,
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!clusterLoading && isEmpty(clusterOptions)) {
                fetchClusters(connectorRef as string)
              }
            }
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          fieldPath="cluster"
          template={template}
        />
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.namespace`}
          label={getString('common.namespace')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
          fieldPath="namespace"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.releaseName`}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          label={getString('common.releaseName')}
          disabled={readonly}
          placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
          fieldPath="releaseName"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </Layout.Vertical>
  )
}
