/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useGetServiceNowStagingTables } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type { ServiceNowImportSetDeploymentModeProps, ServiceNowStagingTableSelectOption } from './types'
import css from '@pipeline/components/PipelineSteps/Steps/ServiceNowImportSet/ServiceNowImportSet.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ServiceNowImportSetDeploymentMode(props: ServiceNowImportSetDeploymentModeProps): JSX.Element {
  const { inputSetData, initialValues, allowableTypes } = props
  const readonly = inputSetData?.readonly
  const path = inputSetData?.path
  const template = inputSetData?.template
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const fetchingStagingTableNamePlaceholder = getString(
    'pipeline.serviceNowImportSetStep.fetchingStagingTableNamePlaceholder'
  )
  const connectorRefFixedValue = getGenuineValue(
    get(initialValues, 'spec.connectorRef', get(inputSetData?.allValues, 'spec.connectorRef') as string)
  )

  const getServiceNowStagingTablesQuery = useGetServiceNowStagingTables({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const serviceNowStagingTablesOptions: ServiceNowStagingTableSelectOption[] = defaultTo(
    getServiceNowStagingTablesQuery.data?.data?.map(stagingTable => ({
      label: defaultTo(stagingTable.label, ''),
      value: defaultTo(stagingTable.name, ''),
      key: defaultTo(stagingTable.name, '')
    })),
    []
  )

  useEffect(() => {
    /* istanbul ignore else */
    if (connectorRefFixedValue) {
      getServiceNowStagingTablesQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  return (
    <Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          name={`${prefix}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          fieldPath={'timeout'}
          template={template}
        />
      )}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          selected={get(initialValues, 'spec.connectorRef', '') as string}
          placeholder={getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={385}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            expressions
          }}
          type={'ServiceNow'}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
      )}

      {getMultiTypeFromValue(template?.spec?.stagingTableName) === MultiTypeInputType.RUNTIME && (
        <FormInput.MultiTypeInput
          selectItems={
            getServiceNowStagingTablesQuery.loading
              ? [{ label: fetchingStagingTableNamePlaceholder, value: fetchingStagingTableNamePlaceholder }]
              : serviceNowStagingTablesOptions
          }
          name={`${prefix}spec.stagingTableName`}
          label={getString('pipeline.serviceNowImportSetStep.stagingTable')}
          className={css.deploymentViewMedium}
          placeholder={
            getServiceNowStagingTablesQuery.loading
              ? fetchingStagingTableNamePlaceholder
              : get(getServiceNowStagingTablesQuery, 'error.message', getString('select'))
          }
          useValue
          disabled={isApprovalStepFieldDisabled(readonly, getServiceNowStagingTablesQuery.loading)}
          multiTypeInputProps={{
            selectProps: {
              addClearBtn: true,
              allowCreatingNewItems: true,
              items: getServiceNowStagingTablesQuery.loading
                ? [{ label: fetchingStagingTableNamePlaceholder, value: fetchingStagingTableNamePlaceholder }]
                : serviceNowStagingTablesOptions
            },
            allowableTypes
          }}
        />
      )}

      {getMultiTypeFromValue(template?.spec?.importData?.spec?.jsonBody) === MultiTypeInputType.RUNTIME && (
        <div
          className={cx(stepCss.formGroup, stepCss.alignStart)}
          onKeyDown={
            /* istanbul ignore next */ event => {
              if (event.key === 'Enter') {
                event.stopPropagation()
              }
            }
          }
        >
          <MultiTypeFieldSelector
            name={`${prefix}spec.importData.spec.jsonBody`}
            label={getString('pipeline.serviceNowImportSetStep.jsonBody')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            disableTypeSelection={readonly}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name={`${prefix}spec.importData.spec.jsonBody`}
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('pipeline.serviceNowImportSetStep.jsonBody')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name={`${prefix}spec.importData.spec.jsonBody`}
              expressions={expressions}
              height={320}
              disabled={readonly}
              fullScreenAllowed
              fullScreenTitle={getString('pipeline.serviceNowImportSetStep.jsonBody')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
    </Fragment>
  )
}
