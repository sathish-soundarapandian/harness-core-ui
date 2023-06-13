/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import type { FormikValues } from 'formik'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  ArtifactDigestWrapperDetails,
  canFetchGcrDigest,
  checkIfQueryParamsisNotEmpty,
  helperTextDataForDigest,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetLastSuccessfulBuildForGcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getHelperTextForDigest } from '@pipeline/utils/stageHelpers'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { isValueFixed } from '@common/utils/utils'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface GcrDigestFieldWrapperProps {
  formik: FormikValues
  isVersionDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
}
export function GcrArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isVersionDetailsLoading
}: GcrDigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.Gcr
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.errors.nodigest'),
    digestPath: 'digest',
    formikDigestValueField: formik?.values?.digest as SelectOption
  }
  const canFetchDigest = canFetchGcrDigest(
    get(formik?.values, 'imagePath'),
    get(formik?.values, 'registryHostname'),
    defaultTo(formik?.values?.tag?.value, formik?.values?.tag),
    connectorRefValue
  )
  const tagValue = defaultTo(formik?.values?.tag?.value, formik?.values?.tag)
  const digestValue = defaultTo(formik?.values?.digest?.value, formik?.values?.digest)

  const isDigestDisabled = React.useMemo(() => {
    if (formik?.values?.tagType === TagTypes.Value && tagValue) {
      if ((isValueFixed(tagValue) && checkIfQueryParamsisNotEmpty([tagValue])) || !isValueFixed(tagValue)) return false
    } else if (formik?.values?.tagType === TagTypes.Regex && formik?.values?.tagRegex) {
      if (
        (isValueFixed(formik?.values?.tagRegex) && checkIfQueryParamsisNotEmpty([formik?.values?.tagRegex])) ||
        !isValueFixed(formik?.values?.tagRegex)
      )
        return false
    }
    // return true will disable the digest fields
    else {
      resetFieldValue(formik, 'digest')
      return true
    }
  }, [tagValue, formik?.values?.tagRegex])

  const isTagRegexType = formik?.values?.tagType === TagTypes.Regex

  const helperText =
    isValueFixed(digestValue) &&
    getHelperTextForDigest(helperTextDataForDigest(artifactType, formik, connectorRefValue), getString, false)

  const { data, loading, refetch, error } = useMutateAsGet(useGetLastSuccessfulBuildForGcr, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: connectorRefValue,
      imagePath: formik?.values?.imagePath
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: defaultTo(formik?.values?.tag?.value, formik?.values?.tag),
      registryHostname: formik?.values?.registryHostname
    }
  })

  return (
    <BaseArtifactDigestField
      data={data}
      loading={loading}
      refetch={refetch}
      error={error}
      canFetchDigest={canFetchDigest}
      digestDetails={digestDetails}
      selectedArtifact={artifactType}
      formik={formik}
      expressions={expressions}
      allowableTypes={allowableTypes}
      isReadonly={isReadonly}
      isBuildDetailsLoading={isVersionDetailsLoading}
      isDigestDisabled={isDigestDisabled}
      isLastBuildRegexType={isTagRegexType}
      helperText={helperText}
    />
  )
}
