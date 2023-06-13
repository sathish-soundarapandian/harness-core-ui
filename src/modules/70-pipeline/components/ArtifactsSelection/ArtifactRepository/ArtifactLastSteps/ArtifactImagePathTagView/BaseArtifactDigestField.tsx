/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { defaultTo, get, memoize } from 'lodash-es'

import type { GetDataError } from 'restful-react'
import type { FormikValues } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'

import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'

import { EXPRESSION_STRING } from '@pipeline/utils/constants'

import type { Failure, ResponseDockerBuildDetailsDTO, ResponseGARBuildDetailsDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import type { ArtifactDigestWrapperDetails } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'

import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import css from '../../ArtifactConnector.module.scss'

const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, fetchDigest: () => void): void => {
  /* istanbul ignore next */
  if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
    /* istanbul ignore next */
    return
  }
  fetchDigest()
}

export function NoDigestResults({
  digestError,
  noDigestText,
  defaultErrorText
}: {
  digestError: GetDataError<Failure | Error> | null
  noDigestText: string
  defaultErrorText?: string
}): JSX.Element {
  const defaultDigestErrorMessage = defaultTo(defaultErrorText, noDigestText)

  return (
    <Text className={css.padSmall} lineClamp={1}>
      {get(digestError, 'data.message', defaultDigestErrorMessage)}
    </Text>
  )
}

const getItems = (isFetching: boolean, label: string, items: SelectOption[]): SelectOption[] => {
  if (isFetching) {
    return [{ label: `${label}...`, value: `${label}...` }]
  }
  return items
}

interface ArtifactDigestFieldProps {
  data: ResponseDockerBuildDetailsDTO | ResponseGARBuildDetailsDTO | null
  refetch: (props?: any) => Promise<void> | undefined
  loading: boolean
  error: GetDataError<Failure | Error> | null
  canFetchDigest: boolean
  digestDetails: ArtifactDigestWrapperDetails
  formik: FormikValues
  isBuildDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  selectedArtifact?: ArtifactType
  lastImagePath?: string
  isDigestDisabled?: boolean
  isLastBuildRegexType?: boolean
  helperText?: React.ReactNode
}

function BaseArtifactDigestField({
  data,
  loading,
  refetch,
  error,
  canFetchDigest,
  digestDetails,
  formik,
  isBuildDetailsLoading,
  isDigestDisabled,
  isLastBuildRegexType,
  helperText,
  expressions,
  allowableTypes,
  isReadonly
}: ArtifactDigestFieldProps): React.ReactElement {
  const { getString } = useStrings()
  const loadingPlaceholderText = getString('pipeline.artifactsSelection.loadingDigest')

  const digestItems: SelectOption[] = React.useMemo(() => {
    const options = []
    if (loading) {
      options.push({ label: loadingPlaceholderText, value: loadingPlaceholderText })
    } else {
      if (get(data, 'data.metadata.SHA', '')) {
        /* istanbul ignore next */
        options.push({ label: get(data, 'data.metadata.SHA', ''), value: get(data, 'data.metadata.SHA', '') })
      }
      if (get(data, 'data.metadata.SHAV2', '')) {
        /* istanbul ignore next */
        options.push({ label: get(data, 'data.metadata.SHAV2', ''), value: get(data, 'data.metadata.SHAV2', '') })
      }
    }
    return options
  }, [data?.data, loading])

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={isBuildDetailsLoading} />
  ))

  return (
    <>
      {isLastBuildRegexType ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            name={digestDetails.digestPath as string}
            placeholder={getString('pipeline.artifactsSelection.digestPlaceholder')}
            label={getString('pipeline.digest')}
            disabled={isReadonly || isDigestDisabled}
            tooltipProps={{
              dataTooltipId: 'artifactDigestTooltip'
            }}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(digestDetails.formikDigestValueField as any) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={defaultTo(digestDetails.formikDigestValueField as string, '')}
              type="String"
              variableName={digestDetails.digestPath as string}
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue(digestDetails.digestPath, value)}
              isReadonly={isReadonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
      ) : (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'artifactDigestTooltip'
            }}
            placeholder={getString('pipeline.artifactsSelection.digestPlaceholder')}
            disabled={isDigestDisabled}
            helperText={helperText}
            selectItems={getItems(loading, getString('pipeline.artifactsSelection.loadingDigest'), digestItems)}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                defaultSelectedItem: digestDetails.formikDigestValueField as SelectOption,
                noResults: !isLastBuildRegexType ? (
                  <NoDigestResults digestError={error} noDigestText={digestDetails.errorText} />
                ) : null,
                items: digestItems,
                addClearBtn: true,
                itemRenderer: itemRenderer,
                allowCreatingNewItems: true,
                addTooltip: true,
                usePortal: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                /* istanbul ignore next */
                if (canFetchDigest && !isLastBuildRegexType) {
                  /* istanbul ignore next */
                  onTagInputFocus(e, refetch)
                }
              }
            }}
            label={getString('pipeline.digest')}
            name={digestDetails.digestPath as string}
            className={css.tagInputButton}
          />

          {getMultiTypeFromValue(digestDetails.formikDigestValueField as string) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                value={digestDetails.formikDigestValueField as string}
                type="String"
                options={digestItems}
                loading={loading}
                variableName="digest"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue(digestDetails.digestPath, value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default BaseArtifactDigestField
