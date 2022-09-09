/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react'
import {
  Layout,
  FormInput,
  Text,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Formik
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { get, set, defaultTo, noop, debounce } from 'lodash-es'
import cx from 'classnames'
import { SshWinRmAwsInfrastructure, useRegionsForAws, useTagsV2 } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeSecretInput, {
  getMultiTypeSecretInputType
} from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { MultiSelectInputSetView } from '@pipeline/components/InputSetView/MultiSelectInputSetView/MultiSelectInputSetView'
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
}

const errorMessage = 'data.message'

const preventEnter = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
  }
}

export const validateAndParseTags = (tagsForValidation: SelectOption[]) => {
  return tagsForValidation.reduce((prevValue: object, tag: SelectOption) => {
    return {
      ...prevValue,
      [tag.value]: tag.label
    }
  }, {})
}

export const SshWimRmAwsInfrastructureSpecInputForm: React.FC<AwsInfrastructureSpecEditableProps> = ({
  initialValues,
  template,
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

  const delayedOnUpdate = useRef(debounce(onUpdate || noop, 300)).current

  const { getString } = useStrings()

  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  const { data: regionsData, loading: loadingRegions, error: regionsError } = useRegionsForAws({})

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
      region: get(initialValues, 'region', undefined),
      awsConnectorRef: get(initialValues, 'connectorRef', undefined),
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

  const parsedInitialValues = useMemo(() => {
    const initials = { ...initialValues }
    if (getMultiTypeFromValue(get(template, 'awsInstanceFilter.tags', '')) === MultiTypeInputType.RUNTIME) {
      const initialTags = get(initialValues, 'awsInstanceFilter.tags', [])
      set(
        initials,
        'awsInstanceFilter.tags',
        Object.entries(initialTags).map(entry => ({
          value: entry[0],
          label: entry[1]
        }))
      )
    }
    return initials
  }, [])

  return (
    <Layout.Vertical spacing="small">
      <Formik<SshWinRmAwsInfrastructure>
        formName="sshWinRmAWSInfra"
        initialValues={parsedInitialValues as SshWinRmAwsInfrastructure}
        validate={value => {
          const data: Partial<SshWinRmAwsInfrastructure> = {}
          if (value.connectorRef) {
            set(
              data,
              'connectorRef',
              typeof value.connectorRef === 'string' ? value.connectorRef : get(value, 'connectorRef.value', '')
            )
          }
          if (value.credentialsRef) {
            set(
              data,
              'credentialsRef',
              typeof get(value, 'credentialsRef', '') === 'string'
                ? get(value, 'credentialsRef', '')
                : get(value, 'credentialsRef.referenceString', '')
            )
          }
          if (value.region) {
            set(data, 'region', typeof value.region === 'string' ? value.region : get(value, 'region.value', ''))
          }
          const selectedTags = get(value, 'awsInstanceFilter.tags', [])
          if (getMultiTypeFromValue(selectedTags) === MultiTypeInputType.FIXED) {
            const awsTags = validateAndParseTags(selectedTags)
            set(data, 'awsInstanceFilter.tags', awsTags)
          } else {
            set(data, 'awsInstanceFilter.tags', value.awsInstanceFilter.tags)
          }

          delayedOnUpdate(data as SshWinRmAwsInfrastructure)
        }}
        onSubmit={noop}
      >
        {getMultiTypeFromValue(get(template, 'credentialsRef', '')) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <MultiTypeSecretInput
              name={'credentialsRef'}
              type={getMultiTypeSecretInputType(initialValues.serviceType)}
              label={getString('cd.steps.common.specifyCredentials')}
              expressions={expressions}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(template, 'connectorRef', '')) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeConnectorField
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              name={'connectorRef'}
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
              name={'region'}
              tooltipProps={{
                dataTooltipId: 'awsInfraRegion'
              }}
              disabled={readonly}
              placeholder={
                loadingRegions
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('pipeline.regionPlaceholder')
              }
              useValue
              selectItems={regions}
              label={getString('regionLabel')}
              multiTypeInputProps={{
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
        {getMultiTypeFromValue(get(template, 'awsInstanceFilter.tags', '')) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <MultiSelectInputSetView
              name={'awsInstanceFilter.tags'}
              tooltipProps={{
                dataTooltipId: 'awsInfraTags'
              }}
              disabled={readonly}
              placeholder={loadingTags ? /* istanbul ignore next */ getString('loading') : getString('tagsLabel')}
              selectItems={tags}
              label={getString('tagsLabel')}
              fieldPath={'awsInstanceFilter.tags'}
              template={template}
              multiSelectTypeInputProps={{
                placeholder: loadingTags ? /* istanbul ignore next */ getString('loading') : getString('tagsLabel'),
                onKeyDown: preventEnter,
                onFocus: () => {
                  refetchTags()
                },
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
