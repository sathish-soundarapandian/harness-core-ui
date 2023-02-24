/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  SelectOption
} from '@harness/uicore'

import type { AsgInfrastructure } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes } from '@pipeline/utils/constants'
import type { AsgInfraSpecCustomStepProps } from './AsgInfraSpec'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AsgInfraSpecInputFormProps {
  initialValues: AsgInfrastructure
  allValues: AsgInfrastructure
  onUpdate?: (data: AsgInfrastructure) => void
  readonly?: boolean
  template?: AsgInfrastructure
  allowableTypes: AllowedTypes
  path: string
  formik?: FormikProps<AsgInfrastructure>
  customStepProps: AsgInfraSpecCustomStepProps
}

const AsgInfraSpecInputForm = ({ template, readonly = false, path, allowableTypes }: AsgInfraSpecInputFormProps) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const { data: awsRegionsData } = useListAwsRegions({
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

  return (
    <Layout.Vertical spacing="small">
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
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={regionFieldName}
            selectItems={regions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: regions,
                popoverClassName: cx(stepCss.formGroup, stepCss.md)
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('pipeline.regionPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export const AsgInfraSpecInputSetMode = connect(AsgInfraSpecInputForm)
