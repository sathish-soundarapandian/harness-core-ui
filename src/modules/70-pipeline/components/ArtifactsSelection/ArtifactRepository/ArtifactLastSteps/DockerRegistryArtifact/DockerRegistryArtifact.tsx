/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { Formik, Layout, Button, StepProps, Text, ButtonVariation, FormikForm } from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { useQueryParams } from '@common/hooks'

import { ConnectorConfigDTO, DockerBuildDetailsDTO, useGetBuildDetailsForDocker } from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactObj,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView/ArtifactImagePathTagView'

import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { DockerArtifactDigestField } from './DockerArtifactDigestField'
import css from '../../ArtifactConnector.module.scss'

export function DockerRegistryArtifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()
  const [lastImagePath, setLastImagePath] = useState('')
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const { CD_NG_DOCKER_ARTIFACT_DIGEST } = useFeatureFlags()

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(modifiedPrevStepData?.connectorId?.value, modifiedPrevStepData?.identifier)
  }

  const queryParams = {
    imagePath: lastImagePath,
    connectorRef: getConnectorRefQueryData(),
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    repoIdentifier,
    branch
  }

  const {
    data,
    loading: dockerBuildDetailsLoading,
    refetch: refetchDockerTag,
    error: dockerTagError
  } = useGetBuildDetailsForDocker({
    queryParams,
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty([lastImagePath])) {
      /* istanbul ignore next */
      refetchDockerTag()
    }
  }, [lastImagePath, refetchDockerTag])
  useEffect(() => {
    if (dockerTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, dockerTagError])

  const canFetchTags = useCallback(
    /* istanbul ignore next */
    (imagePath: string): boolean => {
      return !!(lastImagePath !== imagePath && shouldFetchFieldOptions(modifiedPrevStepData, [imagePath]))
    },
    [lastImagePath, modifiedPrevStepData]
  )

  const fetchTags = useCallback(
    (imagePath = ''): void => {
      if (canFetchTags(imagePath)) {
        setLastImagePath(imagePath)
      }
    },
    [canFetchTags]
  )
  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.imagePath])
  }, [])

  const getInitialValues = (): ImagePathTypes => {
    return getArtifactFormData(initialValues, selectedArtifact as ArtifactType, isIdentifierAllowed) as ImagePathTypes
  }
  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactObj(formData, isIdentifierAllowed)
    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: ImagePathTypes) => {
    /* istanbul ignore next */
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...formData,
        tag: defaultTo(formData?.tag?.value, formData?.tag),
        connectorId: getConnectorIdValue(modifiedPrevStepData),
        digest: defaultTo(formData?.digest?.value, formData?.digest)
      })
    }
  }
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          const formObject = {
            ...modifiedPrevStepData,
            ...formData,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          }

          if (CD_NG_DOCKER_ARTIFACT_DIGEST) {
            formObject['digest'] = defaultTo(formData?.digest?.value, formData?.digest)
          }
          submitFormData(formObject)
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}

              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(modifiedPrevStepData)}
                fetchTags={fetchTags}
                buildDetailsLoading={dockerBuildDetailsLoading}
                tagError={dockerTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={isTagDisabled(formik?.values)}
              />

              {CD_NG_DOCKER_ARTIFACT_DIGEST ? (
                <div className={css.imagePathContainer}>
                  <DockerArtifactDigestField
                    formik={formik}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    isReadonly={isReadonly}
                    connectorRefValue={getConnectorRefQueryData()}
                    isBuildDetailsLoading={dockerBuildDetailsLoading}
                  />
                </div>
              ) : null}
            </div>
            {!hideHeaderAndNavBtns && (
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => {
                    previousStep?.(modifiedPrevStepData)
                  }}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            )}
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
