/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { AllowedTypes } from '@harness/uicore'
import type { FormikValues } from 'formik'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ArtifactDigestWrapperDetails, canFetchDigest } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useMutateAsGet } from '@common/hooks'
import { useGetLastSuccessfulBuildForDocker } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface DockerDigestFieldWrapperProps {
  formik: FormikValues
  isBuildDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
}
export function DockerArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isBuildDetailsLoading
}: DockerDigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.DockerRegistry
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.errors.nodigest'),
    digestPath: 'digest',
    formikDigestValueField: formik?.values?.digest
  }

  const canFetchDockerDigest = canFetchDigest(formik?.values?.imagePath, formik?.values?.tag, connectorRefValue)

  const {
    data: dataDocker,
    loading: loadingDocker,
    refetch: refetchDocker,
    error: errorDocker
  } = useMutateAsGet(useGetLastSuccessfulBuildForDocker, {
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

  return (
    <BaseArtifactDigestField
      data={dataDocker}
      loading={loadingDocker}
      refetch={refetchDocker}
      error={errorDocker}
      canFetchDigest={canFetchDockerDigest}
      digestDetails={digestDetails}
      selectedArtifact={artifactType}
      formik={formik}
      expressions={expressions}
      allowableTypes={allowableTypes}
      isReadonly={isReadonly}
      isBuildDetailsLoading={isBuildDetailsLoading}
    />
  )
}
