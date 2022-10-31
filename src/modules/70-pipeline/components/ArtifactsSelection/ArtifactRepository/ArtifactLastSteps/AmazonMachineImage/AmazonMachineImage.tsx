/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
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
  MultiSelectOption,
  FormikForm
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, defaultTo, get, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  JobDetails,
  useGetArtifactPathForJenkins,
  useGetJobDetailsForJenkins,
  useGetBuildsForJenkins,
  BuildDetails,
  useTags
} from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  resetVersion
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  AmazonMachineImageInitialValuesType,
  ArtifactType,
  ImagePathProps,
  JenkinsArtifactProps,
  JenkinsArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import type { SubmenuSelectOption } from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/types'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'
import { useListAwsRegions } from 'services/portal'
import MultiTypeTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  formClassName = ''
}: any): React.ReactElement {
  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [versionList, setVersionList] = React.useState([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [tags, setTags] = useState<SelectOption[]>([])
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const selectedJobName = useRef<string | null>(null)
  const [artifactPath, setFilePath] = useState<SelectOption[]>([])
  const [build, setJenkinsBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.value)
  const isTemplateContext = context === ModalViewFor.Template

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const {
    data: tagsData,
    refetch: refetchTags,
    loading: isTagsLoading,
    error: tagsError
  } = useTags({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(initialValues, 'region', ''),
      awsConnectorRef: get(initialValues, 'connectorRef', '')
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
            name="region"
            selectItems={regions}
            multiTypeInputProps={{
              onChange: () => {
                versionList.length && setVersionList([])
                resetVersion(formik)
              },
              selectProps: {
                defaultSelectedItem: formik.values.region,
                items: regions
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('select')}
          />

          {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.region as string}
                type="String"
                variableName="region"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('region', value)
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
              name="version"
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.version) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.version, '')}
                type="String"
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTextInput
              name="versionRegex"
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.versionRegex, '')}
                type="String"
                variableName="versionRegex"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('versionRegex', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="amiTags"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            tags={tags}
            isLoadingTags={isTagsLoading}
            initialTags={initialValues?.initialTags}
            errorMessage={get(tagsError, 'data.message', '')}
          />
        </div>
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
  const { context, handleSubmit, initialValues, prevStepData, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const isTemplateContext = context === ModalViewFor.Template

  const getInitialValues = (): AmazonMachineImageInitialValuesType => {
    console.log('initialValues', initialValues)
    return {
      ...initialValues
    }
  }

  const submitFormData = (formData: AmazonMachineImageInitialValuesType, connectorId?: string): void => {
    // handleSubmit({
    //   identifier: formData.identifier,
    //   spec: {
    //     connectorRef: connectorId,
    //     artifactPath: formData.spec.artifactPath,
    //     build: formData.spec.build,
    //     jobName:
    //       getMultiTypeFromValue(formData.spec?.jobName) === MultiTypeInputType.FIXED
    //         ? (formData.spec?.jobName as SelectOption).label
    //         : formData.spec?.jobName
    //   }
    // })
    handleSubmit(formData)
  }

  const schemaObject = {
    spec: Yup.object().shape({
      jobName: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.jenkinsStep.validations.jobName')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.jenkinsStep.validations.jobName'))
      ),
      artifactPath: Yup.string(),
      build: Yup.string().required('Build is a required Field')
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
        onSubmit={formData => {
          submitFormData(
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
