/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import type { FormikProps, FormikContextType } from 'formik'
import {
  FormikForm,
  ThumbnailSelect,
  Layout,
  IconName,
  MultiTypeInputType,
  AllowedTypesWithRunTime,
  getMultiTypeFromValue,
  AllowedTypes
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePrevious } from '@common/hooks/usePrevious'
import type { GitQueryParams, ProjectPathProps, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { usePermission } from '@rbac/hooks/usePermission'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type {
  AmazonS3InitialValuesType,
  CustomArtifactSource,
  GithubPackageRegistryInitialValuesType,
  GoogleArtifactRegistryInitialValuesType,
  ImagePathProps,
  ImagePathTypes,
  JenkinsArtifactType,
  Nexus2InitialValuesType,
  ArtifactType,
  AzureArtifactsInitialValues,
  GoogleCloudStorageInitialValuesType,
  GoogleCloudSourceRepositoriesInitialValuesType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useArtifactSelectionLastSteps } from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import type { ArtifactConfig, ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { isConnectorRefUpdated } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/utils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  ArtifactConnectorLabelMap,
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ArtifactToConnectorMap,
  ENABLED_ARTIFACT_TYPES,
  ModalViewFor
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { ArtifactSourceConfigFormData } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/types'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getConnectorListVersionQueryParam } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { isNewTemplate } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import css from './ArtifactSourceConfigForm.module.scss'

const ALLOWABLE_TYPES = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
] as AllowedTypesWithRunTime[]

interface ArtifactSourceConnectorProps {
  expressions: string[]
  isReadonly: boolean
  allowableTypes: AllowedTypes
  formik: FormikContextType<any>
  connectorType: ConnectorInfoDTO['type']
  selectedArtifactType: ArtifactType
}

type Params = {
  CUSTOM_ARTIFACT_NG?: boolean
  AZURE_WEBAPP_NG_JENKINS_ARTIFACTS?: boolean
}

const getEnabledArtifactTypesList = ({ CUSTOM_ARTIFACT_NG, AZURE_WEBAPP_NG_JENKINS_ARTIFACTS }: Params) => {
  return Object.values(ENABLED_ARTIFACT_TYPES).filter((artifactType: ArtifactType) => {
    if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
      return !!CUSTOM_ARTIFACT_NG
    }

    if (artifactType === ENABLED_ARTIFACT_TYPES.Jenkins) {
      return !!AZURE_WEBAPP_NG_JENKINS_ARTIFACTS
    }

    return true
  })
}

function ArtifactSourceConnector(props: ArtifactSourceConnectorProps) {
  const { expressions, isReadonly, allowableTypes, formik, connectorType, selectedArtifactType } = props

  const selectedConnectorLabel = ArtifactConnectorLabelMap[selectedArtifactType]
  const selectedConnectorTooltip = ArtifactToConnectorMap[selectedArtifactType]

  const { accountId } = useParams<ProjectPathProps>()
  const {
    state: { template }
  } = React.useContext(TemplateContext)

  const { projectIdentifier, orgIdentifier } = template

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  const newConnectorLabel = `${getString('newLabel')} ${selectedConnectorLabel} ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const connectorVersionQueryParamProp = getConnectorListVersionQueryParam(selectedArtifactType) || {}

  if (!connectorType) {
    return null
  }

  return (
    <div className={css.connectorForm}>
      <Layout.Horizontal
        spacing={'medium'}
        flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        className={css.connectorContainer}
      >
        <FormMultiTypeConnectorField
          name="connectorId"
          tooltipProps={{ dataTooltipId: `connectorId_${selectedConnectorTooltip}` }}
          label={`${selectedConnectorLabel} ${getString('connector')}`}
          placeholder={`${getString('select')} ${selectedConnectorLabel} ${getString('connector')}`}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          multiTypeProps={{ expressions, allowableTypes }}
          isNewConnectorLabelVisible={
            !(
              getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME &&
              (isReadonly || !canCreate)
            )
          }
          createNewLabel={newConnectorLabel}
          type={connectorType}
          enableConfigureOptions={false}
          selected={formik?.values?.connectorId}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          {...connectorVersionQueryParamProp}
        />
        {getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            value={formik.values.connectorId as unknown as string}
            type={connectorType}
            variableName="connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('connectorId', value)
            }}
            isReadonly={isReadonly}
          />
        )}
      </Layout.Horizontal>
    </div>
  )
}

export function ArtifactSourceSpecifications(props: {
  formik: FormikProps<ArtifactSourceConfigFormData>
  updateTemplate: (values: ArtifactSourceConfigFormData) => void
}): React.ReactElement {
  const { formik, updateTemplate } = props
  const {
    state: { template },
    isReadonly
  } = React.useContext(TemplateContext)
  const { values: formValues, setFieldValue, setValues } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()

  const [selectedArtifactType, setSelectedArtifactType] = React.useState<ArtifactType>(formValues?.artifactType)
  const { CUSTOM_ARTIFACT_NG, AZURE_WEBAPP_NG_JENKINS_ARTIFACTS } = useFeatureFlags()

  const artifactConnectorType = ArtifactToConnectorMap[selectedArtifactType]

  const [artifactDetailsFormKey, setArtifactDetailsFormKey] = React.useState(0)

  const oldConnectorRef = usePrevious(template?.spec?.spec?.connectorRef)

  useEffect(() => {
    const isConnectorUpdated = isConnectorRefUpdated({
      oldConnectorRef,
      newConnectorRef: template?.spec?.spec?.connectorRef,
      artifactType: selectedArtifactType
    })
    if (isConnectorUpdated) {
      setArtifactDetailsFormKey(artifactDetailsFormKey + 1)
    }
  }, [template?.spec?.spec?.connectorRef, oldConnectorRef, artifactDetailsFormKey, selectedArtifactType])

  const enabledArtifactTypesList = useMemo(
    () =>
      getEnabledArtifactTypesList({
        CUSTOM_ARTIFACT_NG,
        AZURE_WEBAPP_NG_JENKINS_ARTIFACTS
      }),
    [CUSTOM_ARTIFACT_NG, AZURE_WEBAPP_NG_JENKINS_ARTIFACTS]
  )

  const handleArtifactTypeSelection = (artifactType: ArtifactType) => {
    if (artifactType !== selectedArtifactType) {
      setSelectedArtifactType(artifactType)
      setValues({
        ...formValues,
        artifactType: artifactType,
        connectorId: ''
      })
    }
  }

  const supportedArtifactTypes = useMemo(
    () =>
      enabledArtifactTypesList.map(artifact => ({
        label: getString(ArtifactTitleIdByType[artifact]),
        icon: ArtifactIconByType[artifact] as IconName,
        value: artifact
      })),
    [enabledArtifactTypesList]
  )

  const artifactConnectorSectionTitle = useMemo(
    () =>
      `${selectedArtifactType && getString(ArtifactTitleIdByType[selectedArtifactType])} ${getString('repository')}`,
    [selectedArtifactType, getString]
  )

  const artifactLastStepProps = React.useMemo((): ImagePathProps<
    ImagePathTypes &
      AmazonS3InitialValuesType &
      JenkinsArtifactType &
      GoogleArtifactRegistryInitialValuesType &
      CustomArtifactSource &
      GithubPackageRegistryInitialValuesType &
      Nexus2InitialValuesType &
      AzureArtifactsInitialValues &
      GoogleCloudStorageInitialValuesType &
      GoogleCloudSourceRepositoriesInitialValuesType
  > => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context: ModalViewFor.Template,
      expressions,
      allowableTypes: ALLOWABLE_TYPES,
      initialValues: template?.spec as any,
      handleSubmit: (data: ArtifactConfig) => {
        setFieldValue('artifactConfig', data)
      },
      artifactIdentifiers: [],
      isReadonly: isReadonly,
      prevStepData: { connectorId: formValues.connectorId } as ConnectorConfigDTO,
      formClassName: css.connectorFormOverride,
      selectedArtifact: selectedArtifactType
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressions, isReadonly, selectedArtifactType, getString, formValues, updateTemplate, template, setFieldValue])

  const artifactSelectionLastSteps = useArtifactSelectionLastSteps({
    selectedArtifact: selectedArtifactType,
    artifactLastStepProps
  })

  return (
    <FormikForm>
      <Layout.Vertical className={css.specificationsFormContainer}>
        <CardWithOuterTitle
          title={getString('connectors.artifactRepoType')}
          dataTooltipId="artifactSourceConfig_artifactRepoType"
          headerClassName={css.headerText}
          className={css.artifactRepoTypeCard}
        >
          <Layout.Horizontal spacing="large">
            <ThumbnailSelect
              className={css.thumbnailSelect}
              name={'artifactType'}
              isReadonly={isReadonly || !isNewTemplate(templateIdentifier)}
              items={supportedArtifactTypes}
              onChange={handleArtifactTypeSelection}
              layoutProps={{ className: css.wrapping }}
            />
          </Layout.Horizontal>
        </CardWithOuterTitle>
        {selectedArtifactType && (
          <>
            {artifactConnectorType && (
              <CardWithOuterTitle
                title={artifactConnectorSectionTitle}
                dataTooltipId="artifactSourceConfig_artifactConnector"
                headerClassName={css.headerText}
                className={css.artifactConnectorCard}
              >
                <ArtifactSourceConnector
                  expressions={expressions}
                  isReadonly={isReadonly}
                  connectorType={artifactConnectorType}
                  selectedArtifactType={selectedArtifactType}
                  allowableTypes={ALLOWABLE_TYPES}
                  formik={formik}
                />
              </CardWithOuterTitle>
            )}
            <CardWithOuterTitle
              title={getString('pipeline.artifactsSelection.artifactDetails')}
              dataTooltipId="artifactSourceConfig_artifactSourceDetails"
              headerClassName={css.headerText}
              className={css.artifactSourceDetailsCard}
              key={artifactDetailsFormKey}
            >
              {artifactSelectionLastSteps}
            </CardWithOuterTitle>
          </>
        )}
      </Layout.Vertical>
    </FormikForm>
  )
}
