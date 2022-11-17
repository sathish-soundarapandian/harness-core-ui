/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
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
  FormikForm,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, isNil, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, GithubPackageDTO, useGetPackagesFromGithub } from 'services/cd-ng'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { GithubPackagesSpec } from 'services/pipeline-ng'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier } from '../ArtifactIdentifier'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const packageTypes: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'rubygems', value: 'rubygems' },
  { label: 'nuget', value: 'nuget' },
  { label: 'container', value: 'container' }
]

function FormComponent({
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  initialValues
}: any) {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const packageTypeValue = getGenuineValue(formik.values.packageType || initialValues?.packageType)
  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.value)
  const orgValue = getGenuineValue(formik.values.org)

  const {
    data: packageDetails,
    refetch: refetchPackageDetails,
    loading: fetchingPackages,
    error
  } = useGetPackagesFromGithub({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: defaultTo(connectorRefValue, ''),
      packageType: defaultTo(packageTypeValue, ''),
      org: orgValue
    }
  })

  const selectPackageItems = useMemo(() => {
    return packageDetails?.data?.githubPackageResponse?.map((packageInfo: GithubPackageDTO) => ({
      value: defaultTo(packageInfo.packageName, ''),
      label: defaultTo(packageInfo.packageName, '')
    }))
  }, [packageDetails?.data])

  useEffect(() => {
    if (!isNil(formik.values?.version)) {
      if (getMultiTypeFromValue(formik.values?.version) !== MultiTypeInputType.FIXED) {
        formik.setFieldValue('versionRegex', formik.values?.version)
      } else {
        formik.setFieldValue('versionRegex', '')
      }
    }
  }, [formik.values?.version])

  const getPackages = (): SelectOption[] => {
    if (fetchingPackages) {
      return [{ label: 'Loading Packages...', value: 'Loading Packages...' }]
    }
    return defaultTo(selectPackageItems, [])
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingPackages}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <FormikForm>
      <div className={css.connectorForm}>
        {isMultiArtifactSource && <ArtifactSourceIdentifier />}
        <div className={css.jenkinsFieldContainer}>
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormInput.Select
              items={packageTypes}
              name="packageType"
              disabled
              onChange={value => {
                formik.setValues({
                  ...formik.values,
                  packageType: value.value,
                  packageName: formik.values?.packageName === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : '',
                  version: formik.values?.version === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : ''
                })
              }}
              label={getString('pipeline.packageType')}
              placeholder={getString('pipeline.packageTypePlaceholder')}
            />
          </div>
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="org"
            label={getString('projectsOrgs.orgName')}
            placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
            disabled={isReadonly}
            isOptional={true}
            onChange={value => {
              formik.setValues({
                ...formik.values,
                org: value,
                packageName: formik.values?.packageName === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : ''
              })
            }}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            selectItems={getPackages()}
            disabled={isReadonly}
            name="packageName"
            label={getString('pipeline.artifactsSelection.packageName')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={error}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                  />
                ),
                itemRenderer: itemRenderer,
                items: getPackages(),
                allowCreatingNewItems: true
              },
              onChange: (value: any) => {
                formik.setValues({
                  ...formik.values,
                  packageName: value?.label || value
                })
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                refetchPackageDetails({
                  queryParams: {
                    ...commonParams,
                    connectorRef: defaultTo(connectorRefValue, ''),
                    packageType: defaultTo(packageTypeValue, ''),
                    org: orgValue
                  }
                })
              }
            }}
          />
        </div>
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
    </FormikForm>
  )
}

export function GithubPackageRegistry(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<GithubPackagesSpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props
  const schemaObject = {
    packageType: Yup.string().required(getString('pipeline.artifactsSelection.validation.packageType')),
    packageName: Yup.string().required(getString('pipeline.artifactsSelection.validation.packageName'))
  }

  const primarySchema = Yup.object().shape(schemaObject)

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="imagePath"
        validationSchema={primarySchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
