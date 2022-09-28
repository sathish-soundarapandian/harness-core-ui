/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
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
  FormInput
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, isNil } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { getConnectorIdValue, getArtifactFormData } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  ArtifactType,
  GithubPackageRegistryProps,
  GithubPackageRegistryInitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const packageType: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'rubygems', value: 'rubygems' },
  { label: 'nuget', value: 'nuget' },
  { label: 'container', value: 'container' }
]

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource
}: any) {
  const { getString } = useStrings()

  useEffect(() => {
    if (!isNil(formik.values?.version)) {
      if (getMultiTypeFromValue(formik.values?.version) !== MultiTypeInputType.FIXED) {
        formik.setFieldValue('versionRegex', formik.values?.version)
      } else {
        formik.setFieldValue('versionRegex', '')
      }
    }
  }, [formik.values?.version])

  return (
    <Form>
      <div className={css.connectorForm}>
        {isMultiArtifactSource && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.jenkinsFieldContainer}>
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.Select
              items={packageType}
              name="spec.packageType"
              label={getString('pipeline.packageType')}
              placeholder={getString('pipeline.packageTypePlaceholder')}
            />
          </div>
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="spec.org"
            label={getString('projectsOrgs.orgName')}
            placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.org) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.org || ''}
              type="String"
              variableName="org"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.org', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="spec.packageName"
            label={getString('pipeline.artifactsSelection.packageName')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.packageName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.packageName || ''}
              type="String"
              variableName="packageName"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.packageName', value)}
              isReadonly={isReadonly}
            />
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
        {formik.values?.versionType === 'value' ? (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTextInput
              name="spec.version"
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values?.spec?.version) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={formik.values?.spec?.version || ''}
                type="String"
                variableName="version"
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
            {getMultiTypeFromValue(formik.values?.spec?.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={formik.values?.spec?.versionRegex || ''}
                type="String"
                variableName="versionRegex"
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
    </Form>
  )
}

export function GithubPackageRegistry(
  props: StepProps<ConnectorConfigDTO> & GithubPackageRegistryProps
): React.ReactElement {
  const { getString } = useStrings()
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const getInitialValues = (): GithubPackageRegistryInitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as GithubPackageRegistryInitialValuesType
  }

  const submitFormData = (formData: GithubPackageRegistryInitialValuesType, connectorId?: string): void => {
    const versionData =
      (formData as any).versionType === TagTypes.Value
        ? {
            version: defaultTo(formData.spec?.version, '')
          }
        : {
            versionRegex: defaultTo(formData.spec?.versionRegex, '')
          }
    const identifierData = isIdentifierAllowed
      ? {
          identifier: formData.identifier
        }
      : {}
    handleSubmit({
      ...identifierData,
      spec: {
        connectorRef: connectorId,
        org: formData.spec.org,
        packageName: formData.spec.packageName,
        packageType: formData.spec.packageType,
        ...versionData
      }
    })
  }

  const schemaObject = {
    versionType: Yup.string().required(),
    spec: Yup.object().shape({
      packageType: Yup.string().required(getString('pipeline.artifactsSelection.validation.packageType')),
      packageName: Yup.string().required(getString('pipeline.artifactsSelection.validation.packageName')),
      versionRegex: Yup.string().when('versionType', {
        is: 'regex',
        then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.versionRegex'))
      }),
      version: Yup.mixed().when('versionType', {
        is: 'value',
        then: Yup.mixed().required(getString('validation.nexusVersion'))
      })
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? sidecarSchema : primarySchema}
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
