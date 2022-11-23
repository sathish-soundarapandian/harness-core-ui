/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
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
import { cloneDeep, defaultTo, get, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { ConnectorConfigDTO, useTags } from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  amiFilters,
  getInSelectOptionForm
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  AmazonMachineImageInitialValuesType,
  ArtifactType,
  ImagePathProps,
  TagTypes,
  VariableInterface
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useListAwsRegions } from 'services/portal'
import MultiTypeTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
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
  formClassName = ''
}: any): React.ReactElement {
  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [tags, setTags] = useState<SelectOption[]>([])

  const isTemplateContext = context === ModalViewFor.Template

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.value)

  const {
    data: tagsData,
    loading: isTagsLoading,
    refetch: refetchTags,
    error: tagsError
  } = useTags({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(formik, 'values.spec.region'),
      awsConnectorRef: connectorRefValue || ''
    },
    lazy: true
  })

  useEffect(() => {
    const tagOption = get(tagsData, 'data', []).map((tagItem: string) => ({
      value: tagItem,
      label: tagItem
    }))
    setTags(tagOption)
  }, [tagsData])

  useEffect(() => {
    if (
      getMultiTypeFromValue(get(formik, 'values.spec.region')) === MultiTypeInputType.FIXED &&
      get(formik, 'values.spec.region')
    ) {
      refetchTags()
    }
  }, [formik.values?.spec?.region])

  useEffect(() => {
    const regionValues = defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  return (
    <FormikForm>
      <div className={cx(css.connectorForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.jenkinsFieldContainer}>
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
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.spec?.region as string}
                type="String"
                variableName="spec.region"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.region', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="spec.tags"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            tags={tags}
            label={'AMI Tags'}
            isLoadingTags={isTagsLoading}
            initialTags={formik?.initialValues?.spec?.tags}
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
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.tags', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="spec.filters"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            tags={amiFilters}
            label={'AMI Filters'}
            initialTags={formik?.initialValues?.spec?.filters}
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
                showAdvanced={true}
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
          />
        </div>
        {formik.values.versionType === 'value' ? (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTextInput
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              name="spec.version"
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.spec?.version) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec?.version, '')}
                type="String"
                variableName="spec.version"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('spec.version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.jenkinsFieldContainer}>
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
                showAdvanced={true}
                onChange={value => formik.setFieldValue('spec.versionRegex', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
      </div>
      {!isTemplateContext && (
        <Layout.Horizontal spacing="medium">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            onClick={() => previousStep?.(prevStepData)}
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
  const { context, handleSubmit, initialValues, prevStepData, artifactIdentifiers, selectedArtifact } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const isTemplateContext = context === ModalViewFor.Template

  const getInitialValues = (): AmazonMachineImageInitialValuesType => {
    const clonedInitialValues = cloneDeep(initialValues)
    if (
      clonedInitialValues?.spec?.tags &&
      getMultiTypeFromValue(clonedInitialValues.spec.tags as string) === MultiTypeInputType.FIXED
    ) {
      const parsedTag = {}
      ;(clonedInitialValues.spec?.tags as VariableInterface[])?.forEach((tag: VariableInterface) => {
        if (tag.name) set(parsedTag, tag.name, tag.value)
      })
      clonedInitialValues.spec.tags = parsedTag
    }
    if (
      clonedInitialValues?.spec?.filters &&
      getMultiTypeFromValue(clonedInitialValues.spec.filters as string) === MultiTypeInputType.FIXED
    ) {
      const parsedFilter = {} as { [key: string]: any }
      ;(clonedInitialValues.spec?.filters as VariableInterface[])?.forEach((tag: VariableInterface) => {
        if (tag.name) set(parsedFilter, tag.name, tag.value)
      })

      clonedInitialValues.spec.filters = parsedFilter
    }
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
        tags: getInSelectOptionForm(formData.spec?.tags || ''),
        filters: getInSelectOptionForm(formData.spec?.filters || ''),
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
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!isTemplateContext && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
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
              getConnectorIdValue(prevStepData)
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
