/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Layout,
  FormInput,
  Text,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { get, defaultTo, set } from 'lodash-es'
import cx from 'classnames'
import { SshWinRmAwsInfrastructure, useRegionsForAws, useTags } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { SshWinRmAwsInfrastructureTemplate } from './SshWinRmAwsInfrastructureSpec'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface AwsInfrastructureSpecEditableProps {
  initialValues: SshWinRmAwsInfrastructure
  allValues?: SshWinRmAwsInfrastructure
  onUpdate?: (data: SshWinRmAwsInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: SshWinRmAwsInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SshWinRmAwsInfrastructure
  allowableTypes: AllowedTypes
  path: string
}

const errorMessage = 'data.message'
interface SelectedTagsType {
  key: string
  value: string
}

export const SshWimRmAwsInfrastructureSpecInputForm: React.FC<AwsInfrastructureSpecEditableProps> = ({
  initialValues,
  template,
  path,
  onUpdate,
  allowableTypes,
  allValues,
  readonly
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const [tags, setTags] = useState<SelectOption[]>([])
  const [selectedTags, setSelectedTags] = useState([] as SelectedTagsType[])
  const { expressions } = useVariablesExpression()

  const [renderCount, setRenderCount] = useState<number>(0)

  const { getString } = useStrings()

  const connectorRef = useMemo(
    () => defaultTo(initialValues?.connectorRef, allValues?.connectorRef),
    [initialValues.connectorRef, allValues?.connectorRef]
  )

  const credentialsRef = useMemo(
    () => defaultTo(initialValues?.credentialsRef, allValues?.credentialsRef),
    [initialValues.credentialsRef, allValues?.credentialsRef]
  )

  React.useEffect(() => {
    if (renderCount) {
      set(initialValues, 'region', '')
      set(initialValues, 'tags', {})
      onUpdate?.(initialValues)
    }
  }, [connectorRef])

  React.useEffect(() => {
    if (renderCount) {
      set(initialValues, 'region', '')
      set(initialValues, 'tags', {})
      onUpdate?.(initialValues)
    }
  }, [credentialsRef])

  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }

  const {
    data: regionsData,
    loading: loadingRegions,
    refetch: refetchRegions,
    error: regionsError
  } = useRegionsForAws({
    lazy: true
  })

  useEffect(() => {
    debugger
    setRegions(
      defaultTo(regionsData?.data?.regions, []).reduce((subscriptionValues: SelectOption[], region: string) => {
        subscriptionValues.push({
          label: region,
          value: region
        })
        return subscriptionValues
      }, [])
    )
  }, [regionsData])

  const {
    data: tagsData,
    refetch: refetchTags,
    loading: loadingTags
  } = useTags({
    queryParams: {
      ...queryParams,
      region: initialValues?.region,
      awsConnectorRef: initialValues?.connectorRef
    },
    lazy: true
  })

  React.useEffect(() => {
    setTags(
      get(tagsData, 'data.tags', []).map(tag => ({
        label: tag.tag,
        value: tag.tag
      }))
    )
  }, [tagsData])

  useEffect(() => {
    if (
      initialValues?.connectorRef &&
      getMultiTypeFromValue(initialValues?.connectorRef) === MultiTypeInputType.FIXED
    ) {
      refetchRegions({})
    }
    if (initialValues?.region && getMultiTypeFromValue(initialValues?.region) === MultiTypeInputType.FIXED) {
      refetchTags({
        pathParams: {
          subscriptionId: initialValues?.subscriptionId
        }
      })
      /* istanbul ignore else */
    }
    setRenderCount(renderCount + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.credentialsRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeSecretInput
            name={`${path}.credentialsRef`}
            type="SSHKey"
            label={getString('cd.steps.common.specifyCredentials')}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.connectorRef`}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.AWS}
            setRefValue
            onChange={
              /* istanbul ignore next */ () => {
                setSelectedTags([])
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={`${path}.region`}
            tooltipProps={{
              dataTooltipId: 'awsInfraRegion'
            }}
            disabled={readonly}
            placeholder={
              loadingRegions ? /* istanbul ignore next */ getString('loading') : getString('pipeline.regionPlaceholder')
            }
            useValue
            selectItems={regions}
            label={getString('regionLabel')}
            multiTypeInputProps={{
              onFocus: () => {
                if (initialValues?.connectorRef && initialValues?.credentialsRef) {
                  refetchRegions({})
                }
              },
              selectProps: {
                items: regions,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingRegions || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {loadingRegions
                      ? getString('loading')
                      : defaultTo(
                          get(regionsError, errorMessage, regionsError?.message),
                          getString('cd.steps.awsInfraStep.regionError')
                        )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.tags) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiSelectTypeInput
            name={`${path}.tags`}
            tooltipProps={{
              dataTooltipId: 'awsInfraTags'
            }}
            disabled={readonly}
            placeholder={loadingTags ? /* istanbul ignore next */ getString('loading') : getString('tagsLabel')}
            useValue
            selectItems={regions}
            label={getString('tagsLabel')}
            multiSelectTypeInputProps={{
              onFocus: () => {
                if (initialValues?.connectorRef && initialValues?.region) {
                  refetchTags({})
                }
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}
