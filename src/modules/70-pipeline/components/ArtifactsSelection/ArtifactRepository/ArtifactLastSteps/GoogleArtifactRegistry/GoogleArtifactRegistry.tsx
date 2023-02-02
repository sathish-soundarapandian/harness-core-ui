/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
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
import cx from 'classnames'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  getConnectorIdValue,
  getArtifactFormData,
  helperTextData,
  isFieldFixedAndNonEmpty,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  ArtifactType,
  GoogleArtifactRegistryProps,
  GoogleArtifactRegistryInitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  ConnectorConfigDTO,
  GARBuildDetailsDTO,
  RegionGar,
  useGetBuildDetailsForGoogleArtifactRegistry,
  useGetRegionsForGoogleArtifactRegistry
} from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const repositoryType: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'docker', value: 'docker' },
  { label: 'apt', value: 'apt' },
  { label: 'yum', value: 'yum' },
  { label: 'python', value: 'python' },
  { label: 'kubeflow-pipelines', value: 'kubeflow-pipelines' }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> &
    GoogleArtifactRegistryProps & { formik: FormikProps<GoogleArtifactRegistryInitialValuesType> }
): React.ReactElement {
  const {
    context,
    expressions,
    allowableTypes,
    prevStepData,
    previousStep,
    initialValues,
    isReadonly = false,
    formik,
    selectedArtifact,
    isMultiArtifactSource,
    formClassName = ''
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefValue = getConnectorIdValue(prevStepData)
  const packageValue = defaultTo(formik.values.spec.package, initialValues?.spec?.package)
  const projectValue = defaultTo(formik.values.spec.project, initialValues?.spec?.project)
  const regionValue = defaultTo(formik.values.spec.region, initialValues?.spec?.region)
  const repositoryNameValue = defaultTo(formik.values?.spec.repositoryName, initialValues?.spec?.repositoryName)
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const {
    data: buildDetails,
    refetch: refetchBuildDetails,
    loading: fetchingBuilds,
    error
  } = useGetBuildDetailsForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      package: packageValue,
      project: projectValue,
      region: regionValue,
      repositoryName: repositoryNameValue
    }
  })
  const { data: regionsData } = useGetRegionsForGoogleArtifactRegistry({})

  useEffect(() => {
    if (regionsData?.data) {
      setRegions(
        regionsData?.data?.map((item: RegionGar) => {
          return { label: item.name, value: item.value } as SelectOption
        })
      )
    }
  }, [regionsData])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingBuilds}
        onClick={handleClick}
      />
    </div>
  ))

  const selectItems = useMemo(() => {
    return buildDetails?.data?.buildDetailsList?.map((builds: GARBuildDetailsDTO) => ({
      value: defaultTo(builds.version, ''),
      label: defaultTo(builds.version, '')
    }))
  }, [buildDetails?.data])

  const getBuilds = (): { label: string; value: string }[] => {
    if (fetchingBuilds) {
      return [{ label: 'Loading Builds...', value: 'Loading Builds...' }]
    }
    return defaultTo(selectItems, [])
  }

  const isAllFieldsAreFixed = (): boolean => {
    return (
      isFieldFixedAndNonEmpty(formik.values.spec.project) &&
      isFieldFixedAndNonEmpty(formik.values.spec.region) &&
      isFieldFixedAndNonEmpty(formik.values.spec.repositoryName) &&
      isFieldFixedAndNonEmpty(formik.values.spec.package)
    )
  }

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const getVersionFieldHelperText = () => {
    return (
      getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.FIXED &&
      getHelpeTextForTags(
        helperTextData(selectedArtifact as ArtifactType, formik, getConnectorRefQueryData()),
        getString,
        false
      )
    )
  }

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.Select
            items={repositoryType}
            name="spec.repositoryType"
            label={getString('repositoryType')}
            placeholder={getString('pipeline.artifactsSelection.repositoryTypePlaceholder')}
            disabled
          />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            name="spec.project"
            label={getString('pipelineSteps.projectIDLabel')}
            placeholder={getString('pipeline.artifactsSelection.projectIDPlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.project) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.project}
              type="String"
              variableName="project"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.project', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name="spec.region"
            useValue
            placeholder={getString('pipeline.regionPlaceholder')}
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.region', type),
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: regions,
                usePortal: false
              },
              allowableTypes
            }}
            selectItems={regions}
          />
          {getMultiTypeFromValue(formik.values.spec.region) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values.spec.region}
                type="String"
                variableName="region"
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
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            name="spec.repositoryName"
            label={getString('common.repositoryName')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.repositoryName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.repositoryName}
              type="String"
              variableName="repositoryName"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.repositoryName', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            name="spec.package"
            label={getString('pipeline.testsReports.callgraphField.package')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.package) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.package}
              type="String"
              variableName="package"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.package', value)}
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
        {formik.values.versionType === 'value' ? (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getBuilds()}
              disabled={!isAllFieldsAreFixed()}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              name="spec.version"
              useValue
              helperText={getVersionFieldHelperText()}
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
                  items: getBuilds(),
                  allowCreatingNewItems: true,
                  usePortal: false
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (isAllFieldsAreFixed()) {
                    refetchBuildDetails({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRefValue,
                        package: packageValue,
                        project: projectValue,
                        region: regionValue,
                        repositoryName: repositoryNameValue
                      }
                    })
                  }
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec.version, '')}
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
            {getMultiTypeFromValue(formik.values.spec.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec.versionRegex, '')}
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
      {!hideHeaderAndNavBtns && (
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

export function GoogleArtifactRegistry(
  props: StepProps<ConnectorConfigDTO> & GoogleArtifactRegistryProps
): React.ReactElement {
  const { getString } = useStrings()
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): GoogleArtifactRegistryInitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as GoogleArtifactRegistryInitialValuesType
  }

  const submitFormData = (formData: GoogleArtifactRegistryInitialValuesType, connectorId?: string): void => {
    const versionData =
      formData.versionType === TagTypes.Value
        ? {
            version: defaultTo(formData.spec.version, '')
          }
        : {
            versionRegex: defaultTo(formData.spec.versionRegex, '')
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
        repositoryType: formData.spec.repositoryType,
        project: formData.spec.project,
        region: defaultTo(formData.spec.region.value, formData.spec.region),
        repositoryName: formData.spec.repositoryName,
        package: formData.spec.package,
        ...versionData
      }
    })
  }

  const handleValidate = (formData: GoogleArtifactRegistryInitialValuesType) => {
    if (hideHeaderAndNavBtns) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(prevStepData)
      )
    }
  }

  const commonSpecSchemaObject = {
    repositoryType: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryType')),
    project: Yup.string().required(getString('fieldRequired', { field: getString('projectLabel') })),
    region: Yup.string().required(getString('fieldRequired', { field: getString('regionLabel') })),
    repositoryName: Yup.string().required(getString('fieldRequired', { field: getString('common.repositoryName') })),
    package: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.testsReports.callgraphField.package') })
    )
  }

  const schemaObject = {
    versionType: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionDetails') })
    ),
    spec: Yup.object().when('versionType', {
      is: 'regex',
      then: Yup.object().shape({
        ...commonSpecSchemaObject,
        versionRegex: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionRegex') }))
      }),
      otherwise: Yup.object().shape({
        ...commonSpecSchemaObject,
        version: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('version') }))
      })
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
