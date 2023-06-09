/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect } from 'formik'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, SelectOption, Text } from '@harness/uicore'

import type { AwsLambdaInfrastructure, ExecutionElementConfig } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import ProvisionerSelectField from '@pipeline/components/Provisioner/ProvisionerSelect'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AwsLambdaInfraSpecInputFormProps {
  readonly?: boolean
  template?: AwsLambdaInfrastructure
  allowableTypes: AllowedTypes
  path: string
  provisioner?: ExecutionElementConfig['steps']
}

const AwsLambdaInfraSpecInputForm = ({
  template,
  readonly = false,
  path,
  allowableTypes,
  provisioner
}: AwsLambdaInfraSpecInputFormProps) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const { data: awsRegionsData, error: fetchRegionsError } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsRegionsData?.resource, []).map(region => ({
      value: region.value,
      label: region.name as string
    }))
  }, [awsRegionsData?.resource])

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`
  const provisionerName = isEmpty(path) ? 'provisioner' : `${path}.provisioner`

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.provisioner) === MultiTypeInputType.RUNTIME && provisioner && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <ProvisionerSelectField name={provisionerName} path={path} provisioners={provisioner} />
        </div>
      )}
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: get(template, `connectorRef`)
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          fieldPath={'region'}
          template={template}
          name={regionFieldName}
          selectItems={regions}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              items: regions,
              popoverClassName: cx(stepCss.formGroup, stepCss.md),
              allowCreatingNewItems: true,
              noResults: (
                <Text lineClamp={1} width={500} height={35} padding="small">
                  {getRBACErrorMessage(fetchRegionsError as RBACError) || getString('pipeline.noRegions')}
                </Text>
              )
            }
          }}
          label={getString('regionLabel')}
          placeholder={getString('pipeline.regionPlaceholder')}
          disabled={readonly}
        />
      )}
    </Layout.Vertical>
  )
}

export const AwsLambdaInfraSpecInputSetMode = connect(AwsLambdaInfraSpecInputForm)
