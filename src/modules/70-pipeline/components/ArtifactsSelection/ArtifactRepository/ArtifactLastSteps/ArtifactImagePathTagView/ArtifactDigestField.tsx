/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { get, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'

import type { GetDataError } from 'restful-react'
import type { FormikValues } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'

import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'

import { Failure, useGetLastSuccessfulBuildForDocker } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { canFetchDigest } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'

import css from '../../ArtifactConnector.module.scss'

const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, fetchDigest: () => void): void => {
  if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
    return
  }
  fetchDigest()
}

export function NoDigestResults({
  digestError,

  defaultErrorText
}: {
  digestError: GetDataError<Failure | Error> | null
  defaultErrorText?: string
}): JSX.Element {
  const { getString } = useStrings()

  const getErrorText = useCallback(() => {
    return defaultErrorText || getString('pipeline.artifactsSelection.errors.nodigest')
  }, [getString])

  return (
    <Text className={css.padSmall} lineClamp={1}>
      {get(digestError, 'data.message', null) || getErrorText()}
    </Text>
  )
}

interface ArtifactDigestFieldProps {
  formik: FormikValues
  isBuildDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
  selectedArtifact: ArtifactType
  lastImagePath: string
}

function ArtifactDigestField({
  formik,
  isBuildDetailsLoading,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue
}: ArtifactDigestFieldProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const loadingPlaceholderText = getString('pipeline.artifactsSelection.loadingDigest')
  const digestDefaultValue = [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
  const [digestItems, setDigestItems] = React.useState<any>(digestDefaultValue)
  const { data, loading, refetch, error } = useMutateAsGet(useGetLastSuccessfulBuildForDocker, {
    queryParams: {
      imagePath: formik?.values?.imagePath,
      connectorRef: connectorRefValue,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: formik?.values?.tag?.value
    }
  })

  React.useEffect(() => {
    if (data && !loading) {
      /* istanbul ignore next */
      const options = []
      if (data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHA) {
        options.push({ label: data.data.metadata.SHA, value: data.data.metadata.SHA })
      }
      if (data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHAV2) {
        options.push({ label: data.data.metadata.SHAV2, value: data.data.metadata.SHAV2 })
      }
      setDigestItems(options)
    } else if (loading) {
      /* istanbul ignore next */
      setDigestItems(digestDefaultValue)
    }
  }, [data, loading])

  React.useEffect(() => {
    if (error) {
      setDigestItems([])
    }
  }, [error])

  React.useEffect(() => {
    if (formik?.values?.digest) {
      refetch()
    }
  }, [formik?.values?.digest])

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={isBuildDetailsLoading} />
  ))

  return (
    <>
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          selectItems={digestItems}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              defaultSelectedItem: formik?.values?.digest,
              noResults: <NoDigestResults digestError={error} />,
              items: digestItems,
              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              /* istanbul ignore next */
              if (canFetchDigest(formik?.values?.imagePath, formik?.values?.tag, connectorRefValue)) {
                /* istanbul ignore next */
                onTagInputFocus(e, refetch)
              }
            }
          }}
          label={getString('pipeline.digest')}
          name="digest"
          className={css.tagInputButton}
        />
        {getMultiTypeFromValue(formik?.values?.digest) === MultiTypeInputType.RUNTIME && (
          <div className={css.configureOptions}>
            <SelectConfigureOptions
              value={formik?.values?.digest}
              type="String"
              options={digestItems}
              variableName="digest"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => {
                /* istanbul ignore next */
                formik.setFieldValue('digest', value)
              }}
              isReadonly={isReadonly}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default ArtifactDigestField
