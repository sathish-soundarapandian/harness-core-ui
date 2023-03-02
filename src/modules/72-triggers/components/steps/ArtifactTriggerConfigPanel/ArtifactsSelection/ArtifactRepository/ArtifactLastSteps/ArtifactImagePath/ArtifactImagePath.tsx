/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FormInput, MultiSelectOption, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'

import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { GetImagesListForEcrQueryParams, useGetImagesListForEcr } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'

import css from '../../ArtifactConnector.module.scss'

interface ArtifactImagePathProps {
  connectorRef?: string
  region?: string
  artifactType?: string
}

function ArtifactImagePath(props: ArtifactImagePathProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [images, setImages] = useState<SelectOption[]>([])
  const { connectorRef, region, artifactType } = props

  const imagesListAPIQueryParams: GetImagesListForEcrQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef,
    region: region,
    repoIdentifier,
    branch
  }
  const {
    data: imagesListData,
    loading: imagesListLoading,
    refetch: refetchImagesList
    // error: imagesListError
  } = useMutateAsGet(useGetImagesListForEcr, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: imagesListAPIQueryParams,
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (imagesListData?.data) {
      const imageResponseFormatted: MultiSelectOption[] = imagesListData?.data?.images?.map(
        (artifactPathVal: string) => {
          return {
            label: artifactPathVal,
            value: artifactPathVal
          } as MultiSelectOption
        }
      ) || [
        {
          label: 'No images',
          value: 'noimages'
        }
      ]
      setImages(imageResponseFormatted)
    }
  }, [imagesListData])

  if (artifactType) {
    return (
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          label={getString('pipeline.imagePathLabel')}
          name="imagePath"
          useValue
          selectItems={images}
          placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED],
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!imagesListLoading) {
                refetchImagesList()
              }
            }
          }}
        />
      </div>
    )
  }

  return (
    <FormInput.MultiTextInput
      label={getString('pipeline.imagePathLabel')}
      name="imagePath"
      placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
      multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
    />
  )
}

export default ArtifactImagePath
