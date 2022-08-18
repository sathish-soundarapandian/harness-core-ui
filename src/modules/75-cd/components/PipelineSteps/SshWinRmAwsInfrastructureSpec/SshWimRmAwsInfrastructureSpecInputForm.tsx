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
import { SshWinRmAwsInfrastructure, useRegionsForAws, useTagsV2 } from 'services/cd-ng'
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
  const { expressions } = useVariablesExpression()

  const [renderCount, setRenderCount] = useState<number>(0)

  const { getString } = useStrings()

  const connectorRef = useMemo(
    () => defaultTo(get(initialValues, 'connectorRef', ''), get(allValues, 'connectorRef', '')),
    [initialValues.connectorRef, allValues?.connectorRef]
  )

  const credentialsRef = useMemo(
    () => defaultTo(get(initialValues, 'credentialsRef', ''), get(allValues, 'credentialsRef', '')),
    [initialValues.credentialsRef, allValues?.credentialsRef]
  )

  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  React.useEffect(() => {
    if (renderCount) {
      set(initialValues, 'region', '')
      set(initialValues, 'tags', [])
      onUpdate?.(initialValues)
    }
  }, [connectorRef, credentialsRef])

  const {
    data: regionsData,
    loading: loadingRegions,
    refetch: refetchRegions,
    error: regionsError
  } = useRegionsForAws({
    lazy: true
  })

  useEffect(() => {
    const regionOptions = Object.entries(get(regionsData, 'data', {})).map(regEntry => ({
      value: regEntry[0],
      label: regEntry[1]
    }))
    setRegions(regionOptions)
  }, [regionsData])

  const {
    data: tagsData,
    refetch: refetchTags,
    loading: loadingTags
  } = useTagsV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      region: get(initialValues, 'region', ''),
      awsConnectorRef: get(initialValues, 'connectorRef', ''),
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: true
  })

  React.useEffect(() => {
    const tagOptions = get(tagsData, 'data', []).map((tagItem: string) => ({
      value: tagItem,
      label: tagItem
    }))
    setTags(tagOptions)
  }, [tagsData])

  useEffect(() => {
    const connRef = get(initialValues, 'connectorRef', '')
    const reg = get(initialValues, 'region', '')
    if (connRef && getMultiTypeFromValue(connRef) === MultiTypeInputType.FIXED) {
      refetchRegions({})
    }
    if (reg && getMultiTypeFromValue(reg) === MultiTypeInputType.FIXED) {
      /* istanbul ignore else */
      refetchTags()
    }
    setRenderCount(renderCount + 1)
  }, [])

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(get(template, 'credentialsRef', '')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeSecretInput
            name={`${path}.credentialsRef`}
            type="SSHKey"
            label={getString('cd.steps.common.specifyCredentials')}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(template, 'connectorRef', '')) === MultiTypeInputType.RUNTIME && (
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
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(template, 'region', '')) === MultiTypeInputType.RUNTIME && (
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
                if (get(initialValues, 'connectorRef', false) && get(initialValues, 'credentialsRef', false)) {
                  refetchRegions()
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
                          get(regionsError, errorMessage, get(regionsError, 'message', '')),
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
      {getMultiTypeFromValue(get(template, 'tags', '')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiSelectTypeInput
            name={`${path}.tags`}
            tooltipProps={{
              dataTooltipId: 'awsInfraTags'
            }}
            disabled={readonly}
            placeholder={loadingTags ? /* istanbul ignore next */ getString('loading') : getString('tagsLabel')}
            useValue
            selectItems={tags}
            label={getString('tagsLabel')}
            multiSelectTypeInputProps={{
              onFocus: () => {
                if (get(initialValues, 'connectorRef', false) && get(initialValues, 'region', false)) {
                  refetchTags()
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
