/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  FormInput,
  Icon,
  Label,
  Layout,
  MultiTypeInputType,
  Text,
  RUNTIME_INPUT_VALUE,
  AllowedTypes
} from '@harness/uicore'
import { connect, FormikProps } from 'formik'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, get, some, isEmpty, isNil, set } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type {
  DeploymentStageConfig,
  Infrastructure,
  PipelineInfrastructure,
  ServiceConfig,
  ServiceSpec,
  StageOverridesConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField, Separator } from '@common/components'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { MultiTypeCustomMap } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import Volumes from '@pipeline/components/Volumes/Volumes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getAllowedValuesFromTemplate,
  getConnectorRefWidth,
  shouldRenderRunTimeInputViewWithAllowedValues,
  useGitScope
} from '@pipeline/utils/CIUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { StringsMap } from 'stringTypes'
import {
  getCustomStepProps,
  getStepTypeByDeploymentType,
  infraDefinitionTypeMapping,
  StageType
} from '@pipeline/utils/stageHelpers'
import type { K8sDirectInfraYaml } from 'services/ci'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { Connectors } from '@connectors/constants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '../AbstractSteps/Step'

import { OsTypes, ArchTypes, CIBuildInfrastructureType } from '../../utils/constants'
import ServicesInputSetForm from './ServicesInputSetForm/ServicesInputSetForm'
import EnvironmentsInputSetForm from './EnvironmentsInputSetForm/EnvironmentsInputSetForm'
import { ExecutionWrapperInputSetForm } from './ExecutionWrapperInputSetForm'
import IACMInputSetForm from './IACMInputSetForm'
import type { ChildPipelineMetadataType } from './ChainedPipelineInputSetUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PipelineInputSetForm.module.scss'

const harnessImageConnectorRef = 'connectors.title.harnessImageConnectorRef'
const osLabel = 'pipeline.infraSpecifications.os'
const archLabel = 'pipeline.infraSpecifications.architecture'

function ServiceDependencyForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes
}: {
  template?: any
  allValues?: any
  values?: any
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: AllowedTypes
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      <Label>
        <Icon
          padding={{ right: 'small' }}
          name={factory.getStepIcon(allValues?.type || /* istanbul ignore next */ '')}
        />
        {getString('pipeline.serviceDependencyText')}: {getString('pipeline.stepLabel', allValues)}
      </Label>
      <div>
        <StepWidget<any>
          factory={factory}
          readonly={readonly}
          path={path}
          allowableTypes={allowableTypes}
          template={template}
          initialValues={values || {}}
          allValues={allValues || {}}
          type={(allValues?.type as StepType) || ''}
          onUpdate={onUpdate}
          stepViewType={viewType}
        />
      </div>
    </Layout.Vertical>
  )
}

export interface StageInputSetFormProps {
  deploymentStage?: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: FormikProps<any>
  readonly?: boolean
  viewType: StepViewType
  stageIdentifier: string
  executionIdentifier?: string
  allowableTypes: AllowedTypes
  stageType: StageType
  childPipelineMetadata?: ChildPipelineMetadataType
}

export function StageInputSetFormInternal({
  deploymentStageTemplate,
  deploymentStage,
  path,
  formik,
  readonly,
  viewType,
  stageIdentifier,
  executionIdentifier,
  allowableTypes,
  stageType,
  childPipelineMetadata
}: StageInputSetFormProps): React.ReactElement {
  const deploymentStageInputSet = get(formik?.values, path, {})
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isPropagating = deploymentStage?.serviceConfig?.useFromStage
  const gitScope = useGitScope()
  const params = useParams<ProjectPathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const scope = getScopeFromDTO(params)
  const containerSecurityContextFields = ['containerSecurityContext', 'runAsUser']
  const deploymentStageTemplateInfraKeys = Object.keys((deploymentStageTemplate.infrastructure as any)?.spec || {})
  const hasContainerSecurityContextFields = containerSecurityContextFields.some(field =>
    deploymentStageTemplateInfraKeys.includes(field)
  )
  const namePath = isEmpty(path) ? '' : `${path}.`
  const { CIE_HOSTED_VMS_WINDOWS, CDS_OrgAccountLevelServiceEnvEnvGroup, IACM_ENABLED } = useFeatureFlags()
  const iacmRequired = some(formik?.values?.stages, stages => stages?.stage?.type === StageType.IACM)

  const renderMultiTypeInputWithAllowedValues = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      placeholderKey,
      fieldPath,
      allowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
    }: {
      name: string
      tooltipId?: string
      labelKey: keyof StringsMap
      placeholderKey?: keyof StringsMap
      fieldPath: string
      allowedTypes?: AllowedTypes
    }) => {
      if (!name) {
        return
      }
      if (deploymentStageTemplate.infrastructure && fieldPath) {
        const items = getAllowedValuesFromTemplate(deploymentStageTemplate.infrastructure, fieldPath)
        return (
          <FormInput.MultiTypeInput
            name={name}
            label={getString(labelKey)}
            useValue
            selectItems={items}
            placeholder={placeholderKey ? getString(placeholderKey) : ''}
            multiTypeInputProps={{
              allowableTypes: allowedTypes,
              expressions,
              selectProps: { disabled: readonly, items }
            }}
            disabled={readonly}
            tooltipProps={{ dataTooltipId: tooltipId ?? '' }}
            style={{ width: 300 }}
          />
        )
      }
    },
    [deploymentStageTemplate.infrastructure]
  )

  const renderMultiTypeTextField = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      inputProps,
      fieldPath
    }: {
      name: string
      tooltipId: string
      labelKey: keyof StringsMap
      inputProps: MultiTypeTextProps['multiTextInputProps']
      fieldPath: string
    }) => {
      if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, deploymentStageTemplate.infrastructure)) {
        return renderMultiTypeInputWithAllowedValues({
          name,
          tooltipId,
          labelKey: labelKey,
          fieldPath
        })
      }
      return (
        <MultiTypeTextField
          name={name}
          label={
            <Text
              className={stepCss.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              tooltipProps={{
                dataTooltipId: tooltipId
              }}
            >
              {getString(labelKey)}
            </Text>
          }
          style={{ width: 300 }}
          multiTextInputProps={inputProps}
        />
      )
    },
    [deploymentStageTemplate.infrastructure]
  )

  const renderMultiTypeMapInputSet = React.useCallback(
    ({
      fieldName,
      stringKey,
      hasValuesAsRuntimeInput
    }: {
      fieldName: string
      stringKey: keyof StringsMap
      hasValuesAsRuntimeInput: boolean
    }): React.ReactElement => (
      <MultiTypeMapInputSet
        appearance={'minimal'}
        cardStyle={{ width: '50%' }}
        name={fieldName}
        valueMultiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: (
            <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
              {getString(stringKey)}
            </Text>
          ),
          disableTypeSelection: true,
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
        formik={formik}
        hasValuesAsRuntimeInput={hasValuesAsRuntimeInput}
      />
    ),
    []
  )

  const renderMultiTypeCheckboxInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId,
      defaultTrue
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
      defaultTrue?: boolean
    }): React.ReactElement => (
      <FormMultiTypeCheckboxField
        name={name}
        label={getString(labelKey)}
        defaultTrue={defaultTrue}
        multiTypeTextbox={{
          expressions,
          allowableTypes,
          disabled: readonly
        }}
        tooltipProps={{ dataTooltipId: tooltipId }}
        setToFalseWhenEmpty={true}
        disabled={readonly}
      />
    ),
    [expressions]
  )

  const renderMultiTypeListInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
    }): React.ReactElement => (
      <Container className={stepCss.bottomMargin3}>
        <MultiTypeListInputSet
          name={name}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          formik={formik}
          multiTypeFieldSelectorProps={{
            label: (
              <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: tooltipId }}>
                {getString(labelKey)}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
        />
      </Container>
    ),
    [expressions]
  )

  const renderVMInfra = React.useCallback((): JSX.Element | null => {
    const poolName = (deploymentStageTemplate.infrastructure as any).spec?.spec?.poolName
    // poolId deprecated
    const poolId = (deploymentStageTemplate.infrastructure as any).spec?.spec?.identifier
    return (
      <>
        {(poolName || poolId) && (
          <Container className={stepCss.bottomMargin3}>
            {renderMultiTypeTextField({
              name: `${namePath}infrastructure.spec.spec.${poolName ? 'poolName' : 'identifier'}`,
              tooltipId: 'poolName',
              labelKey: 'pipeline.buildInfra.poolName',
              inputProps: {
                multiTextInputProps: {
                  expressions,
                  allowableTypes: allowableTypes
                },
                disabled: readonly
              },
              fieldPath: poolName ? 'spec.spec.poolName' : 'spec.spec.identifier'
            })}
          </Container>
        )}
        {(deploymentStageTemplate.infrastructure as any).spec?.spec?.os ? (
          shouldRenderRunTimeInputViewWithAllowedValues('spec.spec.os', deploymentStageTemplate.infrastructure) ? (
            renderMultiTypeInputWithAllowedValues({
              name: `${namePath}infrastructure.spec.spec.os`,
              tooltipId: 'os',
              labelKey: osLabel,
              placeholderKey: osLabel,
              fieldPath: 'spec.spec.os',
              allowedTypes: [MultiTypeInputType.FIXED]
            })
          ) : (
            <Container className={stepCss.bottomMargin3}>
              <MultiTypeSelectField
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'os' }}
                    font={{ variation: FontVariation.FORM_LABEL }}
                    margin={{ bottom: 'xsmall' }}
                  >
                    {getString(osLabel)}
                  </Text>
                }
                name={`${namePath}infrastructure.spec.spec.os`}
                style={{ width: 300, paddingBottom: 'var(--spacing-small)' }}
                multiTypeInputProps={{
                  selectItems: [
                    { label: getString('delegate.cardData.linux.name'), value: OsTypes.Linux },
                    { label: getString('pipeline.infraSpecifications.osTypes.macos'), value: OsTypes.MacOS },
                    { label: getString('pipeline.infraSpecifications.osTypes.windows'), value: OsTypes.Windows }
                  ],
                  multiTypeInputProps: {
                    allowableTypes: [MultiTypeInputType.FIXED]
                  },
                  disabled: readonly
                }}
                useValue
              />
            </Container>
          )
        ) : null}
        {(deploymentStageTemplate.infrastructure as any).spec?.spec?.harnessImageConnectorRef ? (
          shouldRenderRunTimeInputViewWithAllowedValues(
            'spec.spec.harnessImageConnectorRef',
            deploymentStageTemplate.infrastructure
          ) ? (
            renderMultiTypeInputWithAllowedValues({
              name: `${namePath}infrastructure.spec.spec.harnessImageConnectorRef`,
              tooltipId: 'harnessImageConnectorRef',
              labelKey: harnessImageConnectorRef,
              placeholderKey: 'connectors.placeholder.harnessImageConnectorRef',
              fieldPath: 'spec.spec.harnessImageConnectorRef',
              allowedTypes: [MultiTypeInputType.FIXED]
            })
          ) : (
            <Container className={stepCss.bottomMargin3}>
              <FormMultiTypeConnectorField
                width={getConnectorRefWidth(viewType)}
                name={`${namePath}infrastructure.spec.spec.harnessImageConnectorRef`}
                label={
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString(harnessImageConnectorRef)}</Text>
                }
                placeholder={getString('connectors.placeholder.harnessImageConnectorRef')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                gitScope={gitScope}
                disabled={readonly}
                multiTypeProps={{
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                }}
                type={Connectors.DOCKER}
              />
            </Container>
          )
        ) : null}
      </>
    )
  }, [expressions])

  React.useEffect(() => {
    if (scope !== Scope.PROJECT) {
      if (
        deploymentStageTemplate?.serviceConfig?.serviceRef &&
        isEmpty(deploymentStageInputSet?.serviceConfig?.serviceRef)
      ) {
        formik?.setValues(set(formik?.values, `${path}.serviceConfig.serviceRef`, RUNTIME_INPUT_VALUE))
      }
      if (
        deploymentStageTemplate?.infrastructure?.environmentRef &&
        isEmpty(deploymentStageInputSet?.infrastructure?.environmentRef)
      ) {
        formik?.setValues(set(formik?.values, `${path}.infrastructure.environmentRef`, RUNTIME_INPUT_VALUE))
      }
    }
  }, [])

  const buildInfraSelectOptions = [
    { label: getString('delegate.cardData.linux.name'), value: OsTypes.Linux },
    {
      label: getString('pipeline.infraSpecifications.osTypes.macos'),
      value: OsTypes.MacOS
    }
  ]
  const buildArchSelectOptions = [
    {
      label: getString('pipeline.infraSpecifications.architectureTypes.amd64'),
      value: ArchTypes.Amd64
    },
    {
      label: getString('pipeline.infraSpecifications.architectureTypes.arm64'),
      value: ArchTypes.Arm64
    }
  ]

  if (CIE_HOSTED_VMS_WINDOWS) {
    buildInfraSelectOptions.push({
      label: getString('pipeline.infraSpecifications.osTypes.windows'),
      value: OsTypes.Windows
    })
  }

  return (
    <>
      {deploymentStageTemplate.serviceConfig && (
        <div id={`Stage.${stageIdentifier}.Service`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('service')}</div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate?.serviceConfig?.serviceRef && (
              /* istanbul ignore next */ <StepWidget<ServiceConfig>
                factory={factory}
                initialValues={deploymentStageInputSet?.serviceConfig || {}}
                template={deploymentStageTemplate?.serviceConfig || {}}
                type={StepType.DeployService}
                stepViewType={viewType}
                path={`${path}.serviceConfig`}
                allowableTypes={
                  scope === Scope.PROJECT
                    ? allowableTypes
                    : ((allowableTypes as MultiTypeInputType[]).filter(
                        item => item !== MultiTypeInputType.FIXED
                      ) as AllowedTypes)
                }
                readonly={readonly}
                customStepProps={{ stageIdentifier }}
              />
            )}
            {(!isNil(deploymentStage?.serviceConfig?.serviceDefinition?.type) || isPropagating) && (
              /* istanbul ignore next */ <StepWidget<ServiceSpec>
                factory={factory}
                initialValues={
                  isPropagating && deploymentStageInputSet
                    ? (deploymentStageInputSet?.serviceConfig?.stageOverrides as StageOverridesConfig)
                    : deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec || {}
                }
                allowableTypes={allowableTypes}
                template={
                  isPropagating && deploymentStageTemplate
                    ? deploymentStageTemplate?.serviceConfig?.stageOverrides
                    : deploymentStageTemplate?.serviceConfig?.serviceDefinition?.spec || {}
                }
                type={getStepTypeByDeploymentType(
                  defaultTo(deploymentStage?.serviceConfig?.serviceDefinition?.type, '')
                )}
                stepViewType={viewType}
                path={
                  isPropagating
                    ? `${path}.serviceConfig.stageOverrides`
                    : `${path}.serviceConfig.serviceDefinition.spec`
                }
                readonly={readonly}
                customStepProps={{
                  stageIdentifier,
                  allValues:
                    isPropagating && deploymentStageInputSet
                      ? deploymentStage?.serviceConfig?.stageOverrides
                      : deploymentStage?.serviceConfig?.serviceDefinition?.spec
                }}
                onUpdate={(data: any) => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.serviceDefinition?.spec) {
                    deploymentStageInputSet.serviceConfig.serviceDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.serviceConfig?.stageOverrides && isPropagating) {
                    deploymentStageInputSet.serviceConfig.stageOverrides = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      <ServicesInputSetForm
        deploymentStage={deploymentStage}
        deploymentStageTemplate={deploymentStageTemplate}
        allowableTypes={
          scope === Scope.PROJECT || CDS_OrgAccountLevelServiceEnvEnvGroup
            ? allowableTypes
            : ((allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.FIXED
              ) as AllowedTypes)
        }
        path={path}
        viewType={viewType}
        readonly={readonly}
        stageIdentifier={stageIdentifier}
        childPipelineMetadata={childPipelineMetadata}
      />

      <EnvironmentsInputSetForm
        deploymentStage={deploymentStage}
        deploymentStageTemplate={deploymentStageTemplate}
        allowableTypes={
          scope === Scope.PROJECT || CDS_OrgAccountLevelServiceEnvEnvGroup
            ? allowableTypes
            : ((allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.FIXED
              ) as AllowedTypes)
        }
        path={path}
        viewType={viewType}
        readonly={readonly}
        stageIdentifier={stageIdentifier}
      />

      {IACM_ENABLED && iacmRequired && (
        <IACMInputSetForm
          formik={formik}
          deploymentStage={deploymentStage}
          deploymentStageTemplate={deploymentStageTemplate}
          allowableTypes={
            scope === Scope.PROJECT
              ? allowableTypes
              : ((allowableTypes as MultiTypeInputType[])?.filter(
                  item => item !== MultiTypeInputType.FIXED
                ) as AllowedTypes)
          }
          path={path}
          viewType={viewType}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
        />
      )}

      {(deploymentStageTemplate.infrastructure || (deploymentStageTemplate as any).platform) && (
        <div id={`Stage.${stageIdentifier}.Infrastructure`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('infrastructureText')}</div>

          <div className={cx(css.nestedAccordions, css.infraSection)}>
            {(deploymentStageTemplate.infrastructure as any)?.type === CIBuildInfrastructureType.KubernetesDirect ? (
              <>
                {(deploymentStageTemplate.infrastructure as any).spec?.connectorRef ? (
                  shouldRenderRunTimeInputViewWithAllowedValues(
                    'spec.connectorRef',
                    deploymentStageTemplate.infrastructure
                  ) ? (
                    renderMultiTypeInputWithAllowedValues({
                      name: `${namePath}infrastructure.spec.connectorRef`,
                      tooltipId: 'connectorRef',
                      labelKey: 'connectors.title.k8sCluster',
                      placeholderKey: 'pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder',
                      fieldPath: 'spec.connectorRef'
                    })
                  ) : (
                    <Container className={stepCss.bottomMargin3}>
                      <FormMultiTypeConnectorField
                        width={getConnectorRefWidth(viewType)}
                        name={`${namePath}infrastructure.spec.connectorRef`}
                        label={
                          <Text font={{ variation: FontVariation.FORM_LABEL }}>
                            {getString('connectors.title.k8sCluster')}
                          </Text>
                        }
                        placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        gitScope={gitScope}
                        multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                        setRefValue
                      />
                    </Container>
                  )
                ) : null}
                {(deploymentStageTemplate.infrastructure as any)?.spec?.namespace && (
                  <Container className={stepCss.bottomMargin3}>
                    {renderMultiTypeTextField({
                      name: `${namePath}infrastructure.spec.namespace`,
                      tooltipId: 'namespace',
                      labelKey: 'pipelineSteps.build.infraSpecifications.namespace',
                      inputProps: {
                        multiTextInputProps: {
                          expressions,
                          allowableTypes: allowableTypes
                        },
                        disabled: readonly
                      },
                      fieldPath: 'spec.namespace'
                    })}
                  </Container>
                )}
                {(deploymentStageTemplate.infrastructure as any)?.spec?.os ? (
                  shouldRenderRunTimeInputViewWithAllowedValues(
                    'spec.spec.os',
                    deploymentStageTemplate.infrastructure
                  ) ? (
                    renderMultiTypeInputWithAllowedValues({
                      name: `${namePath}infrastructure.spec.os`,
                      tooltipId: 'os',
                      labelKey: osLabel,
                      placeholderKey: osLabel,
                      fieldPath: 'spec.os',
                      allowedTypes: [MultiTypeInputType.FIXED]
                    })
                  ) : (
                    <Container className={stepCss.bottomMargin3}>
                      <MultiTypeSelectField
                        label={
                          <Text
                            tooltipProps={{ dataTooltipId: 'os' }}
                            font={{ variation: FontVariation.FORM_LABEL }}
                            margin={{ bottom: 'xsmall' }}
                          >
                            {getString(osLabel)}
                          </Text>
                        }
                        name={`${namePath}infrastructure.spec.os`}
                        style={{ width: 300, paddingBottom: 'var(--spacing-small)' }}
                        multiTypeInputProps={{
                          selectItems: [
                            { label: getString('delegate.cardData.linux.name'), value: OsTypes.Linux },
                            { label: getString('pipeline.infraSpecifications.osTypes.windows'), value: OsTypes.Windows }
                          ],
                          multiTypeInputProps: {
                            allowableTypes: [MultiTypeInputType.FIXED]
                          },
                          disabled: readonly
                        }}
                        useValue
                      />
                    </Container>
                  )
                ) : null}
                {(deploymentStageTemplate.infrastructure as any)?.spec?.harnessImageConnectorRef ? (
                  shouldRenderRunTimeInputViewWithAllowedValues(
                    'spec.harnessImageConnectorRef',
                    deploymentStageTemplate.infrastructure
                  ) ? (
                    renderMultiTypeInputWithAllowedValues({
                      name: `${namePath}infrastructure.spec.harnessImageConnectorRef`,
                      tooltipId: 'harnessImageConnectorRef',
                      labelKey: harnessImageConnectorRef,
                      placeholderKey: 'connectors.placeholder.harnessImageConnectorRef',
                      fieldPath: 'spec.harnessImageConnectorRef',
                      allowedTypes: [MultiTypeInputType.FIXED]
                    })
                  ) : (
                    <Container className={stepCss.bottomMargin3}>
                      <FormConnectorReferenceField
                        width={getConnectorRefWidth(viewType)}
                        name={`${namePath}infrastructure.spec.harnessImageConnectorRef`}
                        label={
                          <Text font={{ variation: FontVariation.FORM_LABEL }}>
                            {getString(harnessImageConnectorRef)}
                          </Text>
                        }
                        placeholder={getString('connectors.placeholder.harnessImageConnectorRef')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        gitScope={gitScope}
                        disabled={readonly}
                        type={Connectors.DOCKER}
                      />
                    </Container>
                  )
                ) : null}
              </>
            ) : (deploymentStageTemplate.infrastructure as any)?.type === CIBuildInfrastructureType.VM ? (
              renderVMInfra()
            ) : null}
            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml)?.spec?.volumes && (
              <Container data-name="100width" className={stepCss.bottomMargin5}>
                <Volumes
                  name={`${namePath}infrastructure.spec.volumes`}
                  formik={formik as FormikProps<unknown>}
                  expressions={expressions}
                  disabled={readonly}
                  allowableTypes={[MultiTypeInputType.FIXED]}
                />
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.serviceAccountName && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.serviceAccountName`,
                  tooltipId: 'serviceAccountName',
                  labelKey: 'pipeline.infraSpecifications.serviceAccountName',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.serviceAccountName'
                })}
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.automountServiceAccountToken &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.automountServiceAccountToken`,
                labelKey: 'pipeline.buildInfra.automountServiceAccountToken',
                tooltipId: 'automountServiceAccountToken',
                defaultTrue: true
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.labels &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.labels`,
                stringKey: 'ci.labels',
                hasValuesAsRuntimeInput: true
              })}

            {(deploymentStageTemplate.infrastructure as any)?.spec?.annotations &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.annotations`,
                stringKey: 'common.annotations',
                hasValuesAsRuntimeInput: true
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.hostNames &&
              renderMultiTypeListInputSet({
                name: `${namePath}infrastructure.spec.hostNames`,
                labelKey: 'common.hostNames',
                tooltipId: 'hostNames'
              })}
            {hasContainerSecurityContextFields && (
              <>
                <Separator topSeparation={16} bottomSeparation={8} />
                <div className={cx(css.tabSubHeading, stepCss.topMargin5)} id="containerSecurityContext">
                  {getString('pipeline.buildInfra.containerSecurityContext')}
                </div>
              </>
            )}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.privileged &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.privileged`,
                labelKey: 'pipeline.buildInfra.privileged',
                tooltipId: 'privileged'
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext
              ?.allowPrivilegeEscalation &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.allowPrivilegeEscalation`,
                labelKey: 'pipeline.buildInfra.allowPrivilegeEscalation',
                tooltipId: 'allowPrivilegeEscalation'
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.capabilities?.add &&
              renderMultiTypeListInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.capabilities.add`,
                labelKey: 'pipeline.buildInfra.addCapabilities',
                tooltipId: 'addCapabilities'
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.capabilities?.drop &&
              renderMultiTypeListInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.capabilities.drop`,
                labelKey: 'pipeline.buildInfra.dropCapabilities',
                tooltipId: 'dropCapabilities'
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.runAsNonRoot &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.runAsNonRoot`,
                labelKey: 'pipeline.buildInfra.runAsNonRoot',
                tooltipId: 'runAsNonRoot'
              })}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.readOnlyRootFilesystem &&
              renderMultiTypeCheckboxInputSet({
                name: `${namePath}infrastructure.spec.containerSecurityContext.readOnlyRootFilesystem`,
                labelKey: 'pipeline.buildInfra.readOnlyRootFilesystem',
                tooltipId: 'readOnlyRootFilesystem'
              })}
            {((deploymentStageTemplate.infrastructure as any)?.spec?.runAsUser ||
              (deploymentStageTemplate.infrastructure as any)?.spec?.containerSecurityContext?.runAsUser) && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.containerSecurityContext.runAsUser`,
                  tooltipId: 'runAsUser',
                  labelKey: 'pipeline.stepCommonFields.runAsUser',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes,
                      placeholder: '1000'
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.containerSecurityContext.runAsUser'
                })}
              </Container>
            )}
            {hasContainerSecurityContextFields && <Separator topSeparation={16} bottomSeparation={16} />}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.priorityClassName && (
              <Container className={cx(stepCss.formGroup, stepCss.sm, stepCss.bottomMargin3)}>
                {renderMultiTypeTextField({
                  name: `${namePath}infrastructure.spec.priorityClassName`,
                  tooltipId: 'priorityClassName',
                  labelKey: 'pipeline.buildInfra.priorityClassName',
                  inputProps: {
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: allowableTypes
                    },
                    disabled: readonly
                  },
                  fieldPath: 'spec.priorityClassName'
                })}
              </Container>
            )}

            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml)?.spec?.nodeSelector &&
              renderMultiTypeMapInputSet({
                fieldName: `${namePath}infrastructure.spec.nodeSelector`,
                stringKey: 'pipeline.buildInfra.nodeSelector',
                hasValuesAsRuntimeInput: true
              })}
            {(deploymentStageTemplate.infrastructure as K8sDirectInfraYaml)?.spec?.tolerations && (
              <Container data-name="100width" className={cx(stepCss.formGroup, stepCss.bottomMargin3)}>
                <MultiTypeCustomMap
                  name={`${namePath}infrastructure.spec.tolerations`}
                  appearance={'minimal'}
                  cardStyle={{ width: '50%' }}
                  valueMultiTextInputProps={{
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  }}
                  formik={formik}
                  multiTypeFieldSelectorProps={{
                    label: (
                      <Text
                        font={{ variation: FontVariation.FORM_LABEL }}
                        margin={{ bottom: 'xsmall' }}
                        tooltipProps={{ dataTooltipId: 'tolerations' }}
                      >
                        {getString('pipeline.buildInfra.tolerations')}
                      </Text>
                    ),
                    allowedTypes: allowableTypes
                  }}
                  disabled={readonly}
                  multiTypeMapKeys={[
                    { label: getString('pipeline.buildInfra.effect'), value: 'effect' },
                    { label: getString('keyLabel'), value: 'key' },
                    { label: getString('common.operator'), value: 'operator' },
                    { label: getString('valueLabel'), value: 'value' }
                  ]}
                  excludeId={true}
                />
              </Container>
            )}
            {(deploymentStageTemplate.infrastructure as any)?.spec?.initTimeout && (
              <Container className={cx(stepCss.formGroup, stepCss.xlg, stepCss.bottomMargin3)}>
                {shouldRenderRunTimeInputViewWithAllowedValues(
                  'spec.initTimeout',
                  deploymentStageTemplate.infrastructure
                ) ? (
                  renderMultiTypeInputWithAllowedValues({
                    name: `${namePath}infrastructure.spec.initTimeout`,
                    tooltipId: 'timeout',
                    labelKey: 'pipeline.infraSpecifications.initTimeout',
                    fieldPath: 'spec.initTimeout'
                  })
                ) : (
                  <FormMultiTypeDurationField
                    label={
                      <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'timeout' }}>
                        {getString('pipeline.infraSpecifications.initTimeout')}
                      </Text>
                    }
                    name={`${namePath}infrastructure.spec.initTimeout`}
                    multiTypeDurationProps={{
                      expressions,
                      allowableTypes: allowableTypes
                    }}
                    disabled={readonly}
                  />
                )}
              </Container>
            )}
          </div>
          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure?.environmentRef && (
              /* istanbul ignore next */ <StepWidget<PipelineInfrastructure>
                factory={factory}
                initialValues={deploymentStageInputSet?.infrastructure || {}}
                template={deploymentStageTemplate?.infrastructure || {}}
                type={StepType.DeployEnvironment}
                stepViewType={viewType}
                allowableTypes={
                  scope === Scope.PROJECT
                    ? allowableTypes
                    : ((allowableTypes as MultiTypeInputType[]).filter(
                        item => item !== MultiTypeInputType.FIXED
                      ) as AllowedTypes)
                }
                path={`${path}.infrastructure`}
                readonly={readonly}
              />
            )}
            {deploymentStageTemplate.infrastructure?.infrastructureDefinition && (
              /* istanbul ignore next */ <StepWidget<Infrastructure>
                factory={factory}
                template={deploymentStageTemplate.infrastructure.infrastructureDefinition.spec}
                initialValues={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec || {}}
                allowableTypes={allowableTypes}
                allValues={
                  deploymentStage?.infrastructure?.infrastructureDefinition?.spec || /* istanbul ignore next */ {}
                }
                /* Use this only if you are using a single infrastructure. If you are using multiple infrastructures, \
              please refer to step widget under path - environment?.infrastructureDefinitions */
                type={
                  ((infraDefinitionTypeMapping[
                    deploymentStage?.infrastructure?.infrastructureDefinition?.type as string
                  ] || deploymentStage?.infrastructure?.infrastructureDefinition?.type) as StepType) ||
                  StepType.KubernetesDirect
                }
                path={`${path}.infrastructure.infrastructureDefinition.spec`}
                readonly={readonly}
                onUpdate={data => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.spec) {
                    deploymentStageInputSet.infrastructure.infrastructureDefinition.spec = data
                    formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                  }
                }}
                stepViewType={viewType}
                customStepProps={getCustomStepProps(
                  deploymentStage?.infrastructure?.infrastructureDefinition?.type || '',
                  getString
                )}
              />
            )}
            {(deploymentStageTemplate as any)?.platform?.os &&
              (shouldRenderRunTimeInputViewWithAllowedValues('os', (deploymentStageTemplate as any).platform) ? (
                renderMultiTypeInputWithAllowedValues({
                  name: `${namePath}platform.os`,
                  tooltipId: 'os',
                  labelKey: osLabel,
                  placeholderKey: osLabel,
                  fieldPath: 'os',
                  allowedTypes: [MultiTypeInputType.FIXED]
                })
              ) : (
                <Container className={stepCss.bottomMargin3}>
                  <MultiTypeSelectField
                    label={
                      <Text
                        tooltipProps={{ dataTooltipId: 'os' }}
                        font={{ variation: FontVariation.FORM_LABEL }}
                        margin={{ bottom: 'xsmall' }}
                      >
                        {getString(osLabel)}
                      </Text>
                    }
                    name={`${namePath}platform.os`}
                    style={{ width: 300, paddingBottom: 'var(--spacing-small)' }}
                    multiTypeInputProps={{
                      selectItems: buildInfraSelectOptions,
                      multiTypeInputProps: {
                        allowableTypes: [MultiTypeInputType.FIXED]
                      },
                      disabled: readonly
                    }}
                    useValue
                  />
                </Container>
              ))}
            {(deploymentStageTemplate as any)?.platform?.arch &&
              (shouldRenderRunTimeInputViewWithAllowedValues('arch', (deploymentStageTemplate as any).platform) ? (
                renderMultiTypeInputWithAllowedValues({
                  name: `${namePath}platform.arch`,
                  tooltipId: 'arch',
                  labelKey: archLabel,
                  placeholderKey: archLabel,
                  fieldPath: 'arch',
                  allowedTypes: [MultiTypeInputType.FIXED]
                })
              ) : (
                <Container className={stepCss.bottomMargin3}>
                  <MultiTypeSelectField
                    label={
                      <Text
                        tooltipProps={{ dataTooltipId: 'arch' }}
                        font={{ variation: FontVariation.FORM_LABEL }}
                        margin={{ bottom: 'xsmall' }}
                      >
                        {getString(archLabel)}
                      </Text>
                    }
                    name={`${namePath}platform.arch`}
                    style={{ width: 300, paddingBottom: 'var(--spacing-small)' }}
                    multiTypeInputProps={{
                      selectItems: buildArchSelectOptions,
                      multiTypeInputProps: {
                        allowableTypes: [MultiTypeInputType.FIXED]
                      },
                      disabled: readonly
                    }}
                    useValue
                  />
                </Container>
              ))}
          </div>
        </div>
      )}

      {deploymentStageTemplate.infrastructure?.infrastructureDefinition?.provisioner && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.infrastructure.infrastructureDefinition?.provisioner`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.inputheader}>{getString('pipeline.provisionerSteps')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.steps}
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.steps`}
                allValues={deploymentStage?.infrastructure?.infrastructureDefinition?.provisioner?.steps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
                customStepProps={{
                  stageIdentifier: stageIdentifier as string,
                  stageType,
                  selectedStage: deploymentStage
                }}
              />
            )}
            {deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={
                  deploymentStageTemplate.infrastructure.infrastructureDefinition?.provisioner?.rollbackSteps
                }
                path={`${path}.infrastructure.infrastructureDefinition.provisioner.rollbackSteps`}
                allValues={deploymentStage?.infrastructure?.infrastructureDefinition?.provisioner?.rollbackSteps}
                values={deploymentStageInputSet?.infrastructure?.infrastructureDefinition?.provisioner?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
                customStepProps={{
                  stageIdentifier: stageIdentifier as string,
                  stageType,
                  selectedStage: deploymentStage
                }}
              />
            )}
          </div>
        </div>
      )}
      {(deploymentStageTemplate as any).sharedPaths && (
        /* istanbul ignore next */ <div
          id={`Stage.${stageIdentifier}.SharedPaths`}
          className={cx(css.accordionSummary)}
        >
          <div className={css.nestedAccordions} style={{ width: '50%' }}>
            <MultiTypeListInputSet
              name={`${namePath}sharedPaths`}
              multiTextInputProps={{
                allowableTypes: allowableTypes,
                expressions
              }}
              multiTypeFieldSelectorProps={{
                label: (
                  <div className={css.inputheader} style={{ padding: 0 }}>
                    {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                  </div>
                ),
                allowedTypes: [MultiTypeInputType.FIXED]
              }}
              disabled={readonly}
            />
          </div>
        </div>
      )}
      {(deploymentStageTemplate as ServiceSpec).variables && (
        /* istanbul ignore next */ <div id={`Stage.${stageIdentifier}.Variables`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('common.variables')}</div>

          <div className={css.nestedAccordions}>WIP</div>
        </div>
      )}
      {(deploymentStageTemplate as any).serviceDependencies && (
        <div id={`Stage.${stageIdentifier}.ServiceDependencies`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('pipeline.serviceDependenciesText')}</div>

          <div className={css.nestedAccordions}>
            {(deploymentStageTemplate as any).serviceDependencies &&
              (deploymentStageTemplate as any).serviceDependencies.map(({ identifier }: any, index: number) => (
                <ServiceDependencyForm
                  template={(deploymentStageTemplate as any).serviceDependencies[index]}
                  path={`${path}.serviceDependencies[${index}]`}
                  allValues={(deploymentStage as any)?.serviceDependencies?.[index]}
                  values={deploymentStageInputSet?.serviceDependencies?.[index]}
                  readonly={readonly}
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                  key={identifier}
                  onUpdate={data => /* istanbul ignore next */ {
                    const originalServiceDependency = (deploymentStage as any)?.serviceDependencies?.[index]
                    let initialValues = deploymentStageInputSet?.serviceDependencies?.[index]

                    if (initialValues) {
                      if (!initialValues) {
                        initialValues = {
                          identifier: originalServiceDependency.identifier || '',
                          name: originalServiceDependency.name || '',
                          type: originalServiceDependency.type || ''
                        }
                      }

                      initialValues = {
                        ...data,
                        identifier: originalServiceDependency.identifier || '',
                        name: originalServiceDependency.name || '',
                        type: originalServiceDependency.type || ''
                      }

                      formik?.setValues(set(formik?.values, `${path}.serviceDependencies[${index}]`, initialValues))
                    }
                  }}
                />
              ))}
          </div>
        </div>
      )}
      {deploymentStageTemplate.execution && (
        <div id={`Stage.${stageIdentifier}.Execution`} className={cx(css.accordionSummary)}>
          <div className={css.inputheader}>{getString('executionText')}</div>

          <div className={css.nestedAccordions}>
            {deploymentStageTemplate.execution?.steps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.execution.steps}
                path={`${path}.execution.steps`}
                allValues={deploymentStage?.execution?.steps}
                values={deploymentStageInputSet?.execution?.steps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
                customStepProps={{
                  stageIdentifier: stageIdentifier as string,
                  stageType,
                  selectedStage: deploymentStage
                }}
              />
            )}
            {deploymentStageTemplate.execution?.rollbackSteps && (
              <ExecutionWrapperInputSetForm
                executionIdentifier={executionIdentifier}
                stepsTemplate={deploymentStageTemplate.execution.rollbackSteps}
                path={`${path}.execution.rollbackSteps`}
                allValues={deploymentStage?.execution?.rollbackSteps}
                values={deploymentStageInputSet?.execution?.rollbackSteps}
                formik={formik}
                readonly={readonly}
                viewType={viewType}
                allowableTypes={allowableTypes}
                customStepProps={{
                  stageIdentifier: stageIdentifier as string,
                  stageType,
                  selectedStage: deploymentStage
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
export const StageInputSetForm = connect(StageInputSetFormInternal)
