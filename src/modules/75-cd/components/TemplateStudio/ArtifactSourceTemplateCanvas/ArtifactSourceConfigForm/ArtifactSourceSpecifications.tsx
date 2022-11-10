/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
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
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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
  AzureArtifactsInitialValues
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useArtifactSelectionLastSteps } from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import type { ArtifactConfig, ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
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
  selectedConnectorLabel: string
  selectedConnectorTooltip: ConnectorInfoDTO['type']
}

type Params = { CUSTOM_ARTIFACT_NG?: boolean; NG_GOOGLE_ARTIFACT_REGISTRY?: boolean; GITHUB_PACKAGES?: boolean }

const getEnabledArtifactTypesList = ({ CUSTOM_ARTIFACT_NG, NG_GOOGLE_ARTIFACT_REGISTRY, GITHUB_PACKAGES }: Params) => {
  return Object.values(ENABLED_ARTIFACT_TYPES).filter((artifactType: ArtifactType) => {
    if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
      return !!CUSTOM_ARTIFACT_NG
    }

    if (artifactType === ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry) {
      return !!NG_GOOGLE_ARTIFACT_REGISTRY
    }

    if (artifactType === ENABLED_ARTIFACT_TYPES.GithubPackageRegistry) {
      return !!GITHUB_PACKAGES
    }

    return true
  })
}

function ArtifactSourceConnector(props: ArtifactSourceConnectorProps) {
  const {
    expressions,
    isReadonly,
    allowableTypes,
    formik,
    connectorType,
    selectedConnectorLabel,
    selectedConnectorTooltip
  } = props

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
        />
        {getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            value={formik.values.connectorId as unknown as string}
            type={connectorType}
            variableName="connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
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

  const [selectedArtifactType, setSelectedArtifactType] = React.useState<ArtifactType>(formValues?.artifactType)
  const { CUSTOM_ARTIFACT_NG, NG_GOOGLE_ARTIFACT_REGISTRY, GITHUB_PACKAGES } = useFeatureFlags()

  const enabledArtifactTypesList = useMemo(
    () =>
      getEnabledArtifactTypesList({
        CUSTOM_ARTIFACT_NG,
        NG_GOOGLE_ARTIFACT_REGISTRY,
        GITHUB_PACKAGES
      }),
    [CUSTOM_ARTIFACT_NG, NG_GOOGLE_ARTIFACT_REGISTRY, GITHUB_PACKAGES]
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
      AzureArtifactsInitialValues
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
  const artifactConnectorType = ArtifactToConnectorMap[selectedArtifactType]

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
                  selectedConnectorLabel={ArtifactConnectorLabelMap[selectedArtifactType]}
                  selectedConnectorTooltip={ArtifactToConnectorMap[selectedArtifactType]}
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
            >
              {artifactSelectionLastSteps}
            </CardWithOuterTitle>
          </>
        )}
      </Layout.Vertical>
    </FormikForm>
  )
}
