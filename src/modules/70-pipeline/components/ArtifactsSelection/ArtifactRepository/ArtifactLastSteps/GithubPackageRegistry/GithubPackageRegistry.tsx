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
import { defaultTo, isNil, memoize, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import {
  getConnectorIdValue,
  getArtifactFormData,
  shouldHideHeaderAndNavBtns
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  ArtifactType,
  GithubPackageRegistryProps,
  GithubPackageRegistryInitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  BuildDetails,
  ConnectorConfigDTO,
  GithubPackageDTO,
  useGetPackagesFromGithub,
  useGetVersionsFromPackages
} from 'services/cd-ng'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions, packageSourceOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export enum PACKAGE_TYPES {
  CONTAINER = 'container',
  MAVEN = 'maven',
  NPM = 'npm',
  NUGET = 'nuget'
}

export const packageTypesList: SelectOption[] = [
  { label: 'Container', value: PACKAGE_TYPES.CONTAINER },
  { label: 'Maven', value: PACKAGE_TYPES.MAVEN },
  { label: 'Npm', value: PACKAGE_TYPES.NPM },
  { label: 'Nuget', value: PACKAGE_TYPES.NUGET }
]

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  initialValues,
  editArtifactModePrevStepData
}: any) {
  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const { getString } = useStrings()
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const packageTypeValue = getGenuineValue(formik.values.spec.packageType || initialValues?.spec?.packageType)
  const connectorRefValue = getGenuineValue(
    defaultTo(modifiedPrevStepData?.connectorId?.value, modifiedPrevStepData?.identifier)
  )
  const packageNameValue = getGenuineValue(formik.values.spec.packageName || initialValues?.spec?.packageName)
  const orgValue = getGenuineValue(formik.values.spec.org)

  const {
    data: packageDetails,
    refetch: refetchPackageDetails,
    loading: fetchingPackages,
    error: errorFetchingPackages
  } = useGetPackagesFromGithub({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: defaultTo(connectorRefValue, ''),
      packageType: defaultTo(packageTypeValue, ''),
      org: orgValue
    }
  })

  const {
    data: versionDetails,
    refetch: refetchVersionDetails,
    loading: fetchingVersion,
    error: errorFetchingVersion
  } = useGetVersionsFromPackages({
    lazy: true,
    queryParams: {
      ...commonParams,
      packageType: defaultTo(packageTypeValue, ''),
      packageName: defaultTo(packageNameValue, ''),
      connectorRef: defaultTo(connectorRefValue, ''),
      versionRegex: '*',
      org: orgValue
    }
  })

  const selectPackageItems = useMemo(() => {
    return packageDetails?.data?.githubPackageResponse?.map((packageInfo: GithubPackageDTO) => ({
      value: defaultTo(packageInfo.packageName, ''),
      label: defaultTo(packageInfo.packageName, '')
    }))
  }, [packageDetails?.data])

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

  const getPackages = (): SelectOption[] => {
    if (fetchingPackages) {
      return [{ label: 'Loading Packages...', value: 'Loading Packages...' }]
    }
    return defaultTo(selectPackageItems, [])
  }

  const getVersions = (): SelectOption[] => {
    if (fetchingVersion) {
      return [{ label: 'Loading Versions...', value: 'Loading Versions...' }]
    }
    return defaultTo(selectVersionItems, [])
  }

  const getItemRenderer = memoize((item: SelectOption, { handleClick }: IItemRendererProps, disabled: boolean) => {
    return (
      <div key={item.label.toString()}>
        <Menu.Item
          text={
            <Layout.Horizontal spacing="small">
              <Text>{item.label}</Text>
            </Layout.Horizontal>
          }
          disabled={disabled}
          onClick={handleClick}
        />
      </div>
    )
  })

  return (
    <FormikForm>
      <div className={css.artifactForm}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <div className={cx(stepCss.formGroup, stepCss.xxlg)}>
            <FormInput.Select
              items={packageTypesList}
              name="spec.packageType"
              onChange={value => {
                formik.setValues({
                  ...omit(formik.values, ['packageSource']),
                  packageSource: value.value !== PACKAGE_TYPES.MAVEN ? undefined : 'org',
                  spec: {
                    ...formik.values?.spec,
                    packageType: value.value,
                    packageName: formik.values?.spec?.packageName === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : '',
                    version: formik.values?.spec?.version === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : ''
                  }
                })
              }}
              label={getString('pipeline.packageType')}
              placeholder={getString('pipeline.packageTypePlaceholder')}
            />
          </div>
        </div>
        {formik.values?.spec?.packageType !== PACKAGE_TYPES.MAVEN && (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTextInput
              name="spec.org"
              label={getString('projectsOrgs.orgName')}
              placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
              disabled={isReadonly}
              isOptional={true}
              onChange={value => {
                formik.setValues({
                  ...formik.values,
                  spec: {
                    ...formik.values?.spec,
                    org: value,
                    packageName: formik.values?.spec?.packageName === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : '',
                    version: formik.values?.spec?.version === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : ''
                  }
                })
              }}
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
                onChange={value => formik.setFieldValue('spec.org', value)}
                isReadonly={isReadonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            )}
          </div>
        )}
        {formik.values?.spec?.packageType === PACKAGE_TYPES.MAVEN && (
          <>
            <div className={css.tagGroup}>
              <FormInput.RadioGroup
                label={getString('pipeline.artifactsSelection.packageSource')}
                name="packageSource"
                radioGroup={{ inline: true }}
                items={packageSourceOptions}
                className={css.radioGroup}
              />
            </div>
            {formik.values?.packageSource === 'org' ? (
              <div className={css.imagePathContainer}>
                <>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.artifactsSelection.organizationLabel')}
                    name="spec.org"
                    placeholder={getString('pipeline.artifactsSelection.organizationPlaceholder')}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.org) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.spec?.org || ''}
                        type="String"
                        variableName="spec.org"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.org', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </>
              </div>
            ) : (
              <div className={css.imagePathContainer}>
                <>
                  <FormInput.MultiTextInput
                    label={getString('common.userLabel')}
                    name="spec.user"
                    placeholder={getString('pipeline.artifactsSelection.userPlaceholder')}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.user) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.spec?.user || ''}
                        type="String"
                        variableName="spec.user"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.user', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </>
              </div>
            )}
          </>
        )}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getPackages()}
            disabled={isReadonly}
            name="spec.packageName"
            label={getString('pipeline.artifactsSelection.packageName')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={errorFetchingPackages}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                  />
                ),
                itemRenderer: (item, props) => getItemRenderer(item, props, fetchingPackages),
                items: getPackages(),
                allowCreatingNewItems: true
              },
              onChange: (value: any) => {
                formik.setValues({
                  ...formik.values,
                  spec: {
                    ...formik.values?.spec,
                    packageName: value?.label || value,
                    version: formik.values?.spec?.version === RUNTIME_INPUT_VALUE ? RUNTIME_INPUT_VALUE : ''
                  }
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
          {getMultiTypeFromValue(formik.values?.spec?.packageName) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              options={getPackages()}
              loading={fetchingPackages}
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.packageName || ''}
              type="String"
              variableName="packageName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.packageName', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        {formik.values?.spec?.packageType === PACKAGE_TYPES.MAVEN && (
          <>
            <div className={css.imagePathContainer}>
              <>
                <FormInput.MultiTextInput
                  label={getString('repository')}
                  placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                  name="spec.repository"
                  multiTextInputProps={{ expressions, allowableTypes }}
                />
                {getMultiTypeFromValue(formik.values?.spec?.repository) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values?.spec?.repository || ''}
                      type="String"
                      variableName="spec.repository"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.repository', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </>
            </div>
            <div className={css.imagePathContainer}>
              <>
                <FormInput.MultiTextInput
                  label={getString('pipeline.artifactsSelection.groupId')}
                  name="spec.groupId"
                  placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                />
                {getMultiTypeFromValue(formik.values?.spec?.groupId) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values?.spec?.groupId || ''}
                      type="String"
                      variableName="spec.groupId"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.groupId', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </>
            </div>
            <div className={css.imagePathContainer}>
              <>
                <FormInput.MultiTextInput
                  label={getString('pipeline.artifactsSelection.artifactId')}
                  name="spec.artifactId"
                  placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                />
                {getMultiTypeFromValue(formik.values?.spec?.artifactId) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values?.spec?.artifactId || ''}
                      type="String"
                      variableName="spec.artifactId"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.artifactId', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </>
            </div>
            <div className={css.imagePathContainer}>
              <FormInput.MultiTextInput
                label={getString('pipeline.artifactsSelection.extension')}
                name="spec.extension"
                isOptional={true}
                placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                multiTextInputProps={{ expressions, allowableTypes }}
              />
              {getMultiTypeFromValue(formik.values?.spec?.extension) === MultiTypeInputType.RUNTIME && (
                <div className={css.configureOptions}>
                  <ConfigureOptions
                    value={formik.values?.spec?.extension || ''}
                    type="String"
                    variableName="spec.extension"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('spec.extension', value)
                    }}
                    isReadonly={isReadonly}
                  />
                </div>
              )}
            </div>
          </>
        )}
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
                      tagError={errorFetchingVersion}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noVersion')}
                    />
                  ),
                  itemRenderer: (item, props) => getItemRenderer(item, props, fetchingVersion),
                  items: getVersions(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchVersionDetails()
                }
              }}
            />
            {getMultiTypeFromValue(formik.values?.spec?.version) === MultiTypeInputType.RUNTIME && (
              <SelectConfigureOptions
                options={getVersions()}
                loading={fetchingVersion}
                style={{ marginTop: 22 }}
                value={formik.values?.spec?.version || ''}
                type="String"
                variableName="version"
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
            {getMultiTypeFromValue(formik.values?.spec?.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={formik.values?.spec?.versionRegex || ''}
                type="String"
                variableName="versionRegex"
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

const getExtraDataForMavenIfApplicable = (formData: GithubPackageRegistryInitialValuesType) => {
  const packageSourceData =
    formData.spec?.packageType === PACKAGE_TYPES.MAVEN && formData.packageSource === 'user'
      ? {
          user: defaultTo(formData.spec?.user, '')
        }
      : {
          org: formData.spec.org
        }

  return formData.spec?.packageType === PACKAGE_TYPES.MAVEN
    ? {
        repository: formData.spec?.repository,
        groupId: formData.spec?.groupId,
        artifactId: formData.spec?.artifactId,
        extension: formData.spec?.extension,
        ...packageSourceData
      }
    : packageSourceData
}

export function GithubPackageRegistry(
  props: StepProps<ConnectorConfigDTO> & GithubPackageRegistryProps
): React.ReactElement {
  const { getString } = useStrings()
  const {
    context,
    handleSubmit,
    initialValues,
    prevStepData,
    selectedArtifact,
    artifactIdentifiers,
    editArtifactModePrevStepData
  } = props

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
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
        packageName: formData.spec.packageName,
        packageType: formData.spec.packageType,
        ...versionData,
        ...getExtraDataForMavenIfApplicable(formData)
      }
    })
  }

  const handleValidate = (formData: GithubPackageRegistryInitialValuesType) => {
    if (hideHeaderAndNavBtns) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(modifiedPrevStepData)
      )
    }
  }

  const commonSpecSchemaObject = {
    packageType: Yup.string()
      .trim()
      .required(getString('fieldRequired', { field: getString('pipeline.packageType') })),
    packageName: Yup.string()
      .trim()
      .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.packageName') })),
    artifactId: Yup.string().when('packageType', {
      is: val => val === PACKAGE_TYPES.MAVEN,
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.artifactId') })),
      otherwise: Yup.string().notRequired()
    }),
    groupId: Yup.string().when('packageType', {
      is: val => val === PACKAGE_TYPES.MAVEN,
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.groupId') })),
      otherwise: Yup.string().notRequired()
    }),
    repository: Yup.string().when('packageType', {
      is: val => val === PACKAGE_TYPES.MAVEN,
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('repository') })),
      otherwise: Yup.string().notRequired()
    })
  }
  const schemaObject = {
    versionType: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionDetails') })
    ),
    spec: Yup.object()
      .when('versionType', {
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
      .when(['packageSource'], {
        is: 'user',
        then: Yup.object().shape({
          ...commonSpecSchemaObject,
          user: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('common.userLabel') }))
        })
      })
      .when(['packageSource'], {
        is: 'org',
        then: Yup.object().shape({
          ...commonSpecSchemaObject,
          org: Yup.string()
            .trim()
            .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.organizationLabel') }))
        })
      })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
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
        validationSchema={isIdentifierAllowed ? sidecarSchema : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData(
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
