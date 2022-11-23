/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { Menu } from '@blueprintjs/core'
import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ImagePathTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactoryImagePath, Failure, useGetImagePathsForArtifactory } from 'services/cd-ng'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

type ArtifactoryArtifactPathProps = {
  fieldName: string
  expressions: string[]
  isReadonly?: boolean
  allowableTypes: AllowedTypes
  formik: FormikProps<ImagePathTypes>
  connectorRef: string
  repository: string
}

export default function ArtifactoryArtifactPath(props: ArtifactoryArtifactPathProps): React.ReactElement {
  const { fieldName, isReadonly, expressions, allowableTypes, formik, connectorRef, repository } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const {
    data: imagePathData,
    loading: imagePathLoading,
    refetch: refetchImagePathData,
    error: imagePathError
  } = useGetImagePathsForArtifactory({
    queryParams: {
      repository,
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (imagePathLoading) {
      setArtifactPaths([{ label: getString('loading'), value: getString('loading') }])
    }
    if ((imagePathError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (imagePathError?.data as Failure)?.message as string
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    } else if ((imagePathError?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (imagePathError?.data as Failure)?.errors?.[0]
      const errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePathLoading, imagePathError])

  useEffect(() => {
    if (imagePathData) {
      setArtifactPaths(
        imagePathData.data?.imagePaths?.map((path: ArtifactoryImagePath) => {
          const imagePath = defaultTo(path.imagePath, '')
          return {
            label: imagePath,
            value: imagePath
          }
        }) || []
      )
    }
  }, [imagePathData, connectorRef])

  const shouldFetchImagePathListData = (formikProps: FormikProps<ImagePathTypes>): boolean => {
    if (getMultiTypeFromValue(formikProps?.values?.repository) === MultiTypeInputType.RUNTIME) {
      return false
    }

    return !!(
      (formikProps.values?.repository as SelectOption)?.value?.toString()?.length ||
      formikProps.values?.repository?.toString()?.length
    )
  }

  const imagePathItemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={imagePathLoading}
        onClick={handleClick}
      />
    </div>
  ))
  const fieldValue = get(formik.values, fieldName, '')
  return (
    <div className={css.imagePathContainer}>
      <FormInput.MultiTypeInput
        selectItems={artifactPaths}
        multiTypeInputProps={{
          expressions,
          allowableTypes,
          selectProps: {
            noResults: <NoTagResults tagError={imagePathError} />,
            items: artifactPaths,
            addClearBtn: true,
            itemRenderer: imagePathItemRenderer,
            allowCreatingNewItems: true,
            addTooltip: true
          },
          onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            if (
              e?.target?.type !== 'text' ||
              (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
            ) {
              return
            }
            if (shouldFetchImagePathListData(formik)) {
              refetchImagePathData()
            }
          }
        }}
        label={getString('pipeline.artifactImagePathLabel')}
        name={fieldName}
        placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
        className={css.tagInputButton}
        useValue
      />
      {getMultiTypeFromValue(fieldValue) === MultiTypeInputType.RUNTIME && (
        <div className={css.configureOptions}>
          <SelectConfigureOptions
            options={artifactPaths}
            loading={imagePathLoading}
            value={fieldValue}
            type="String"
            variableName={fieldName}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(fieldName, value)
            }}
            isReadonly={isReadonly}
          />
        </div>
      )}
    </div>
  )
}
