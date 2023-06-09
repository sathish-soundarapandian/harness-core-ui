/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback } from 'react'
import cx from 'classnames'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  SelectOption,
  ButtonVariation,
  FormikForm
} from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, memoize, merge } from 'lodash-es'
import { ConnectorConfigDTO, useGetBuildDetailsForGcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactObj,
  RegistryHostNames,
  resetTag,
  shouldFetchFieldOptions,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { GcrArtifactDigestField } from './GcrDigestField'
import css from '../../ArtifactConnector.module.scss'

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))
export function GCRImagePath({
  context,
  expressions,
  allowableTypes,
  handleSubmit,
  prevStepData,
  editArtifactModePrevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  isMultiArtifactSource,
  formClassName = ''
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    registryHostname: Yup.string().trim().required('GCR Registry URL is required'),
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

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const { CD_NG_DOCKER_ARTIFACT_DIGEST } = useFeatureFlags()

  const getConnectorRefQueryData = (): string => {
    return defaultTo(modifiedPrevStepData?.connectorId?.value, modifiedPrevStepData?.connectorId)
  }

  const [tagList, setTagList] = useState([])
  const [lastQueryData, setLastQueryData] = useState({ imagePath: '', registryHostname: '' })
  const {
    data,
    loading: gcrBuildDetailsLoading,
    refetch,
    error: gcrTagError
  } = useGetBuildDetailsForGcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: modifiedPrevStepData?.connectorId?.value
        ? modifiedPrevStepData?.connectorId?.value
        : modifiedPrevStepData?.identifier || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      registryHostname: lastQueryData.registryHostname,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  useEffect(() => {
    if (gcrTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList as [])
    }
  }, [data, gcrTagError])

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetch()
    }
  }, [lastQueryData, refetch])

  const getInitialValues = useCallback((): ImagePathTypes => {
    return getArtifactFormData(initialValues, selectedArtifact as ArtifactType, isIdentifierAllowed) as ImagePathTypes
  }, [initialValues, isIdentifierAllowed, selectedArtifact])

  const fetchTags = (imagePath = '', registryHostname = ''): void => {
    if (canFetchTags(imagePath, registryHostname)) {
      setLastQueryData({ imagePath, registryHostname })
    }
  }
  const canFetchTags = (imagePath: string, registryHostname: string): boolean =>
    !!(
      (lastQueryData.imagePath !== imagePath || lastQueryData.registryHostname !== registryHostname) &&
      shouldFetchFieldOptions(modifiedPrevStepData, [imagePath, registryHostname])
    )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.imagePath, formikValue.registryHostname])
  }, [])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactObj(formData, isIdentifierAllowed)

    merge(artifactObj.spec, { registryHostname: formData?.registryHostname, digest: formData?.digest })
    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: ImagePathTypes & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        tag: formData?.tag?.value ? formData?.tag?.value : formData?.tag,
        digest: defaultTo(formData?.digest?.value, formData?.digest),
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }

  const registryHostNameRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={gcrBuildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        formName="gcrImagePath"
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            tag: formData?.tag?.value ? formData?.tag?.value : formData?.tag,
            digest: defaultTo(formData?.digest?.value, formData?.digest),
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  label={getString('connectors.GCR.registryHostname')}
                  placeholder={getString('common.enterPlaceholder', {
                    name: getString('connectors.GCR.registryHostname')
                  })}
                  name="registryHostname"
                  selectItems={gcrUrlList}
                  useValue
                  multiTypeInputProps={{
                    onChange: () => {
                      tagList.length && setTagList([])
                      resetTag(formik)
                    },
                    expressions,
                    allowableTypes,
                    selectProps: {
                      allowCreatingNewItems: true,
                      addClearBtn: true,
                      items: gcrUrlList,
                      itemRenderer: registryHostNameRenderer
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.registryHostname) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <SelectConfigureOptions
                      value={formik.values.registryHostname as string}
                      type="String"
                      options={gcrUrlList}
                      loading={false}
                      variableName="registryHostname"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('registryHostname', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>
              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(modifiedPrevStepData)}
                fetchTags={imagePath => fetchTags(imagePath, formik.values?.registryHostname)}
                buildDetailsLoading={gcrBuildDetailsLoading}
                tagError={gcrTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={isTagDisabled(formik?.values)}
              />
              {CD_NG_DOCKER_ARTIFACT_DIGEST && (
                <GcrArtifactDigestField
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  isReadonly={isReadonly}
                  connectorRefValue={getConnectorRefQueryData()}
                  isVersionDetailsLoading={false}
                />
              )}
            </div>
            {!hideHeaderAndNavBtns && (
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(modifiedPrevStepData)}
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
