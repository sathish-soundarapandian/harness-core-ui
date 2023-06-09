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
  canFetchArtifactDigest
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetLastSuccessfulBuildForACRRepository } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface AcrDigestFieldWrapperProps {
  formik: FormikValues
  isVersionDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
}
export function AcrArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isVersionDetailsLoading
}: AcrDigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.Acr
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.garNoDigestErrortest'),
    digestPath: 'digest',
    formikDigestValueField: formik?.values?.digest
  }
  const canFetchDigest = canFetchArtifactDigest(
    connectorRefValue,
    get(formik?.values, 'registry'),
    get(formik?.values, 'repository'),
    get(formik?.values, 'subscriptionId'),
    get(formik?.values, 'tag')
  )

  const {
    data: dataGar,
    loading: loadingGar,
    refetch: refetchGar,
    error: errorGar
  } = useMutateAsGet(useGetLastSuccessfulBuildForACRRepository, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: connectorRefValue,
      repository: defaultTo(formik?.values?.repository?.value, formik?.repository?.tag),
      registry: defaultTo(formik?.values?.registry?.value, formik?.registry?.tag),
      subscriptionId: defaultTo(formik?.values?.subscriptionId?.value, formik?.values?.subscriptionId)
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: defaultTo(formik?.values?.tag?.value, formik?.values?.tag)
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
    />
  )
}
