/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { AllowedTypes } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import type { FormikValues } from 'formik'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  ArtifactDigestWrapperDetails,
  canFetchGarDigest,
  checkIfQueryParamsisNotEmpty,
  helperTextDataForDigest,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetLastSuccessfulBuildForGoogleArtifactRegistry } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { isValueFixed } from '@common/utils/utils'
import { getHelperTextForDigest } from '@pipeline/utils/stageHelpers'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface GarDigestFieldWrapperProps {
  formik: FormikValues
  isVersionDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
}
export function GarArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isVersionDetailsLoading
}: GarDigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.garNoDigestErrortest'),
    digestPath: 'spec.digest',
    formikDigestValueField: formik?.values?.spec?.digest
  }
  const canFetchDigest = canFetchGarDigest(
    get(formik?.values?.spec, 'project'),
    get(formik?.values?.spec, 'region'),
    get(formik?.values?.spec, 'repositoryName'),
    get(formik?.values?.spec, 'version'),
    get(formik?.values?.spec, 'package'),
    connectorRefValue
  )

  const versionValue = defaultTo(formik?.values?.spec?.version?.value, formik?.values?.spec?.version)
  const digestValue = defaultTo(formik?.values?.spec?.digest?.value, formik?.values?.spec?.digest)

  const isDigestDisabled = React.useMemo(() => {
    if (formik?.values?.versionType === TagTypes.Value && versionValue) {
      if ((isValueFixed(versionValue) && checkIfQueryParamsisNotEmpty([versionValue])) || !isValueFixed(versionValue))
        return false
    } else if (formik?.values?.versionType === TagTypes.Regex && formik?.values?.spec?.versionRegex) {
      if (
        (isValueFixed(formik?.values?.spec?.versionRegex) &&
          checkIfQueryParamsisNotEmpty([formik?.values?.spec?.versionRegex])) ||
        !isValueFixed(formik?.values?.spec?.versionRegex)
      )
        return false
    }
    // return true will disable the digest fields
    else {
      resetFieldValue(formik, 'spec.digest')
      return true
    }
  }, [versionValue, formik?.values?.spec?.versionRegex])

  const isVersionRegexType = formik?.values?.versionType === TagTypes.Regex

  const helperText =
    isValueFixed(digestValue) &&
    getHelperTextForDigest(helperTextDataForDigest(artifactType, formik, connectorRefValue), getString, false)

  const {
    data: dataGar,
    loading: loadingGar,
    refetch: refetchGar,
    error: errorGar
  } = useMutateAsGet(useGetLastSuccessfulBuildForGoogleArtifactRegistry, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: connectorRefValue,
      project: formik?.values?.spec?.project,
      region: formik?.values?.spec?.region,
      repositoryName: formik?.values?.spec?.repositoryName,
      package: formik?.values?.spec?.package
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      version: formik?.values?.spec?.version
    }
  })

  return (
    <BaseArtifactDigestField
      data={dataGar}
      loading={loadingGar}
      refetch={refetchGar}
      error={errorGar}
      canFetchDigest={canFetchDigest}
      digestDetails={digestDetails}
      selectedArtifact={artifactType}
      formik={formik}
      expressions={expressions}
      allowableTypes={allowableTypes}
      isReadonly={isReadonly}
      isBuildDetailsLoading={isVersionDetailsLoading}
      helperText={helperText}
      isLastBuildRegexType={isVersionRegexType}
      isDigestDisabled={isDigestDisabled}
    />
  )
}
