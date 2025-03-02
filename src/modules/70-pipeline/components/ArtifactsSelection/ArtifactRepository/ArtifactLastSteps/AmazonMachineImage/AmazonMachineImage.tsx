/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, defaultTo, get, isNil, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { AMITagObject, BuildDetails, ConnectorConfigDTO, useListVersionsForAMIArtifact } from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  amiFilters,
  shouldHideHeaderAndNavBtns,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  AmazonMachineImageInitialValuesType,
  ArtifactType,
  ImagePathProps,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useListAwsRegions } from 'services/portal'
import MultiTypeArrayTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeArrayTagSelector'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { useMutateAsGet } from '@common/hooks'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { useListTagsForAmiArtifactMutation } from 'services/cd-ng-rq'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData
}: any): React.ReactElement {
  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [tags, setTags] = useState<SelectOption[]>([])

  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const { data: regionData, loading: fetchingRegions } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const connectorRefValue = getGenuineValue(
    modifiedPrevStepData?.connectorId?.value || modifiedPrevStepData?.identifier
  )

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    mutate: refetchTags,
    error: tagsError
  } = useListTagsForAmiArtifactMutation({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(formik, 'values.spec.region'),
      connectorRef: connectorRefValue || ''
    },
    body: ''
  })

  const {
    data: versionDetails,
    loading: isVersionLoading,
    refetch: refetchVersion,
    error: versionError
  } = useMutateAsGet(useListVersionsForAMIArtifact, {
    body: {
      tags: formik?.values?.spec?.tags,
      filters: formik?.values?.spec?.filters
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(formik, 'values.spec.region'),
      connectorRef: connectorRefValue || '',
      versionRegex: '*'
    },
    lazy: true
  })

  const selectVersionItems = useMemo(() => {
    return versionDetails?.data?.map((packageInfo: BuildDetails) => ({
      value: defaultTo(packageInfo.number, ''),
      label: defaultTo(packageInfo.number, '')
    }))
  }, [versionDetails?.data])

  useEffect(() => {
    if (!isNil(formik.values?.version)) {
      if (getMultiTypeFromValue(formik.values?.version) !== MultiTypeInputType.FIXED) {
        formik.setFieldValue('versionRegex', formik.values?.version)
      } else {
        formik.setFieldValue('versionRegex', '')
      }
    }
  }, [formik.values?.version])

  const getVersions = (): SelectOption[] => {
    if (isVersionLoading) {
      return [{ label: 'Loading Versions...', value: 'Loading Versions...' }]
    }
    return defaultTo(selectVersionItems, [])
  }

  useEffect(() => {
    if (!isTagsLoading && tagsData?.data) {
      const tagOption = get(tagsData, 'data', []).map((tag: AMITagObject) => {
        const tagName = tag?.tagName as string
        return { label: tagName, value: tagName }
      })

      setTags(tagOption)
    }
  }, [tagsData?.data, isTagsLoading])

  useEffect(() => {
    if (
      getMultiTypeFromValue(get(formik, 'values.spec.region')) === MultiTypeInputType.FIXED &&
      get(formik, 'values.spec.region')
    ) {
      refetchTags()
    }
  }, [formik.values?.spec?.region])

  useEffect(() => {
    if (!fetchingRegions && regionData?.resource) {
      const regionValues = defaultTo(regionData?.resource, []).map(region => ({
        value: region.value,
        label: region.name
      }))
      setRegions(regionValues as SelectOption[])
    }
  }, [regionData?.resource, fetchingRegions])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={isVersionLoading}
        onClick={handleClick}
      />
    </div>
  ))

  const canFetchVersion =
    getMultiTypeFromValue(formik.values?.spec?.region) === MultiTypeInputType.RUNTIME || !formik.values?.spec?.region

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            name="spec.region"
            selectItems={regions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: regions
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('select')}
          />

          {getMultiTypeFromValue(formik.values?.spec?.region) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                options={regions}
                loading={fetchingRegions}
                style={{ alignSelf: 'center' }}
                value={formik.values?.spec?.region as string}
                type="String"
                variableName="spec.region"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.region', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.imagePathContainer}>
          <MultiTypeArrayTagSelector
            name="spec.tags"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            tags={tags}
            label={getString('pipeline.amiTags')}
            isLoadingTags={isTagsLoading}
            initialTags={formik?.initialValues?.spec?.tags || []}
            errorMessage={get(tagsError, 'data.message', '')}
          />
          {getMultiTypeFromValue(formik.values?.spec?.tags) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center', marginTop: 10 }}
                value={formik.values?.spec?.tags as string}
                type="String"
                variableName="spec.tags"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.tags', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.imagePathContainer}>
          <MultiTypeArrayTagSelector
            name="spec.filters"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            tags={amiFilters}
            label={getString('pipeline.amiFilters')}
            initialTags={formik?.initialValues?.spec?.filters || []}
            errorMessage={get(tagsError, 'data.message', '')}
          />
          {getMultiTypeFromValue(formik.values?.spec?.filters) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center', marginTop: 10 }}
                value={formik.values?.spec?.filters as string}
                type="String"
                variableName="spec.filters"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.filters', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.tagGroup}>
          <FormInput.RadioGroup
            label={getString('pipeline.artifactsSelection.versionDetails')}
            name="versionType"
            radioGroup={{ inline: true }}
            items={tagOptions}
            className={css.radioGroup}
            onChange={() => {
              // to clearValues when version is changed
              resetFieldValue(formik, 'spec.version')
              resetFieldValue(formik, 'spec.versionRegex')
            }}
          />
        </div>
        {formik.values.versionType === 'value' ? (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getVersions()}
              disabled={isReadonly}
              name="spec.version"
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={versionError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={
                        isVersionLoading
                          ? getString('loading')
                          : canFetchVersion
                          ? getString('pipeline.requiredToFetch', {
                              requiredField: 'Region',
                              dependentField: 'version'
                            })
                          : getString('pipeline.artifactsSelection.validation.noVersion')
                      }
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getVersions(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                    canFetchVersion
                  ) {
                    return
                  }
                  refetchVersion()
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.spec?.version) === MultiTypeInputType.RUNTIME && (
              <SelectConfigureOptions
                options={getVersions()}
                loading={isVersionLoading}
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec?.version, '')}
                type="String"
                variableName="spec.version"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('spec.version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTextInput
              name="spec.versionRegex"
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.spec?.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec?.versionRegex, '')}
                type="String"
                variableName="spec.versionRegex"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('spec.versionRegex', value)}
                isReadonly={isReadonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            )}
          </div>
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
  )
}

export function AmazonMachineImage(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AmazonMachineImageInitialValuesType>
): React.ReactElement {
  const { getString } = useStrings()
  const {
    context,
    handleSubmit,
    initialValues,
    prevStepData,
    artifactIdentifiers,
    selectedArtifact,
    editArtifactModePrevStepData
  } = props

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): AmazonMachineImageInitialValuesType => {
    const clonedInitialValues = cloneDeep(initialValues)

    return getArtifactFormData(
      clonedInitialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as AmazonMachineImageInitialValuesType
  }

  const submitFormData = (formData: AmazonMachineImageInitialValuesType, connectorId?: string): void => {
    const versionData =
      formData.versionType === TagTypes.Value
        ? {
            version: defaultTo(formData.spec?.version, '')
          }
        : {
            versionRegex: defaultTo(formData.spec?.versionRegex, '')
          }

    handleSubmit({
      identifier: formData.identifier,
      spec: {
        connectorRef: connectorId,
        region: formData.spec?.region,
        tags: formData.spec.tags as { [key: string]: any } | string,
        filters: formData.spec?.filters as { [key: string]: any } | string,
        ...versionData
      }
    })
  }

  const schemaObject = {
    spec: Yup.object().shape({
      region: Yup.string().required(getString('validation.regionRequired'))
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

  const handleValidate = (formData: AmazonMachineImageInitialValuesType) => {
    if (hideHeaderAndNavBtns) {
      submitFormData?.(
        {
          ...formData
        },
        getConnectorIdValue(modifiedPrevStepData)
      )
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
        onSubmit={(formData, formikhelper) => {
          let hasError = false
          if (formData?.versionType === 'value' && !formData?.spec?.version?.length) {
            formikhelper.setFieldError('spec.version', getString('validation.nexusVersion'))
            hasError = true
          } else if (formData?.versionType === 'regex' && !formData?.spec?.versionRegex?.length) {
            formikhelper.setFieldError(
              'spec.versionRegex',
              getString('pipeline.artifactsSelection.validation.versionRegex')
            )
            hasError = true
          }
          if (!hasError)
            submitFormData?.(
              {
                ...formData
              },
              getConnectorIdValue(modifiedPrevStepData)
            )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
