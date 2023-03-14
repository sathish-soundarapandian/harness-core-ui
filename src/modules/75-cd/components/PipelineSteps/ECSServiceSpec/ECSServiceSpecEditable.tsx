/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { debounce, defaultTo, get, noop, set, unset } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import {
  Card,
  CardSelect,
  Container,
  Formik,
  FormInput,
  HarnessDocTooltip,
  Icon,
  Layout,
  Text,
  useConfirmationDialog,
  FormikForm,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'

import { useStrings, UseStringsReturn } from 'framework/strings'
import type {
  ManifestConfigWrapper,
  ServiceDefinition,
  ServiceSpec,
  StageElementConfig,
  ManifestConfig
} from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { CardInterface } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import { FeatureFlag } from '@common/featureFlags'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { getSelectedDeploymentType, getVariablesHeaderTooltipId } from '@pipeline/utils/stageHelpers'
import { getManifestsHeaderTooltipId, ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { getArtifactsHeaderTooltipId } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import ServiceV2ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ServiceV2ArtifactsSelection'
import { getConfigFilesHeaderTooltipId } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import ConfigFilesSelection from '@pipeline/components/ConfigFilesSelection/ConfigFilesSelection'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useServiceContext } from '@cd/context/ServiceContext'
import { isMultiArtifactSourceEnabled, setupMode } from '../PipelineStepsUtil'
import css from '../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

enum TaskDefinitionType {
  TASK_DEFINITION = 'TASK_DEFINITION',
  TASK_DEFINITION_ARN = 'TASK_DEFINITION_ARN'
}

interface TaskDefinitionARNType {
  ecsTaskDefinitionArn: string
}

function getTaskDefinitionTypeCards(getString: UseStringsReturn['getString']): CardInterface[] {
  return [
    {
      type: TaskDefinitionType.TASK_DEFINITION,
      title: getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition'),
      info: '',
      icon: 'harness',
      size: 16,
      disabled: false
    },
    {
      type: TaskDefinitionType.TASK_DEFINITION_ARN,
      title: getString('cd.serviceDashboard.taskDefinitionArn'),
      info: '',
      icon: 'remote-setup',
      size: 20,
      disabled: false
    }
  ]
}

interface ECSServiceSpecInitialValues extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface ECSServiceSpecEditableProps {
  initialValues: ECSServiceSpecInitialValues
  onUpdate?: (data: ServiceSpec) => void
  readonly?: boolean
  factory?: AbstractStepFactory
}

export const ECSServiceSpecEditable: React.FC<ECSServiceSpecEditableProps> = ({
  initialValues: { stageIndex = 0, setupModeType, deploymentType, isReadonlyServiceMode },
  factory,
  readonly
}) => {
  const {
    state: {
      templateServiceData,
      selectionState: { selectedStageId }
    },
    updateStage,
    getStageFromPipeline,
    allowableTypes
  } = usePipelineContext()
  const { getString } = useStrings()
  const { isServiceEntityPage } = useServiceContext()
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const { expressions } = useVariablesExpression()

  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const selectedDeploymentType =
    deploymentType ?? getSelectedDeploymentType(stage, getStageFromPipeline, isPropagating, templateServiceData)

  const taskDefinitionArnFieldPath = isPropagating
    ? 'stage.spec.serviceConfig.stageOverrides.ecsTaskDefinitionArn'
    : 'stage.spec.serviceConfig.serviceDefinition.spec.ecsTaskDefinitionArn'

  const manifestsFieldPath = isPropagating
    ? 'stage.spec.serviceConfig.stageOverrides.manifests'
    : 'stage.spec.serviceConfig.serviceDefinition.spec.manifests'

  const taskDefinitionManifestList = React.useMemo(() => {
    return (get(stage, manifestsFieldPath, []) as ManifestConfigWrapper[])?.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.EcsTaskDefinition
    )
  }, [stage, manifestsFieldPath])

  const isTaskDefinitionManifestPresent = taskDefinitionManifestList.length > 0

  const taskDefinitionARNFieldValue = get(stage, taskDefinitionArnFieldPath)

  const [selectedTaskDefinitionType, setSelectedTaskDefinitionType] = useState<TaskDefinitionType>(
    isTaskDefinitionManifestPresent || !get(stage, taskDefinitionArnFieldPath)
      ? TaskDefinitionType.TASK_DEFINITION
      : TaskDefinitionType.TASK_DEFINITION_ARN
  )

  const isPrimaryArtifactSources = isMultiArtifactSourceEnabled(
    !!isSvcEnvEnabled,
    stage?.stage as DeploymentStageElementConfig,
    isServiceEntityPage
  )
  const isNewService = isNewServiceEnvEntity(!!isSvcEnvEnabled, stage?.stage as DeploymentStageElementConfig)

  const listOfManifests: ManifestConfigWrapper[] = useMemo(() => {
    /* istanbul ignore next */
    /* istanbul ignore else */
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const taskDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.EcsTaskDefinition)
  }, [listOfManifests])

  const serviceDefinitionManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(currManifest => currManifest.manifest?.type === ManifestDataType.EcsServiceDefinition)
  }, [listOfManifests])

  const scallingPolicyManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.EcsScalingPolicyDefinition
    )
  }, [listOfManifests])

  const scalableTargetManifests: ManifestConfigWrapper[] = useMemo(() => {
    return listOfManifests.filter(
      currManifest => currManifest.manifest?.type === ManifestDataType.EcsScalableTargetDefinition
    )
  }, [listOfManifests])

  const getListOfManifestForManifestType = useCallback(
    (manifestType?: ManifestConfig['type']): ManifestConfigWrapper[] => {
      switch (manifestType) {
        case ManifestDataType.EcsTaskDefinition:
          return taskDefinitionManifests
        case ManifestDataType.EcsServiceDefinition:
          return serviceDefinitionManifests
        case ManifestDataType.EcsScalingPolicyDefinition:
          return scallingPolicyManifests
        case ManifestDataType.EcsScalableTargetDefinition:
          return scalableTargetManifests
        default:
          return listOfManifests
      }
    },
    [
      taskDefinitionManifests,
      serviceDefinitionManifests,
      scallingPolicyManifests,
      scalableTargetManifests,
      listOfManifests
    ]
  )

  const getFinalListOfManifest = useCallback(
    (manifestListForManifestType: ManifestConfigWrapper[], manifestType?: ManifestConfig['type']) => {
      switch (manifestType) {
        case ManifestDataType.EcsTaskDefinition:
          return [
            ...manifestListForManifestType,
            ...serviceDefinitionManifests,
            ...scallingPolicyManifests,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsServiceDefinition:
          return [
            ...taskDefinitionManifests,
            ...manifestListForManifestType,
            ...scallingPolicyManifests,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsScalingPolicyDefinition:
          return [
            ...taskDefinitionManifests,
            ...serviceDefinitionManifests,
            ...manifestListForManifestType,
            ...scalableTargetManifests
          ]
        case ManifestDataType.EcsScalableTargetDefinition:
          return [
            ...taskDefinitionManifests,
            ...serviceDefinitionManifests,
            ...scallingPolicyManifests,
            ...manifestListForManifestType
          ]
        default:
          return [...manifestListForManifestType]
      }
    },
    [taskDefinitionManifests, serviceDefinitionManifests, scallingPolicyManifests, scalableTargetManifests]
  )

  const updateStageData = useCallback(
    (updatedManifestList: ManifestConfigWrapper[]): void => {
      if (stage) {
        updateStage(
          produce(stage, draft => {
            set(draft, manifestsFieldPath, updatedManifestList)
          }).stage as StageElementConfig
        )
      }
    },
    [manifestsFieldPath, stage, updateStage]
  )

  const updateListOfManifests = useCallback(
    (manifestObj: ManifestConfigWrapper, manifestIndex: number): void => {
      const manifestType = manifestObj.manifest?.type
      const manifestListForManifestType = getListOfManifestForManifestType(manifestType)
      if (manifestListForManifestType.length > 0) {
        manifestListForManifestType.splice(manifestIndex, 1, manifestObj)
      } else {
        manifestListForManifestType.push(manifestObj)
      }
      const manifestListToUpdate = getFinalListOfManifest(manifestListForManifestType, manifestType)
      updateStageData(manifestListToUpdate)
    },
    [isPropagating, updateStageData]
  )

  const deleteTaskDefinition = React.useCallback(
    (index: number) => {
      taskDefinitionManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(taskDefinitionManifests, ManifestDataType.EcsTaskDefinition))
    },
    [taskDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteServiceDefinition = React.useCallback(
    (index: number) => {
      serviceDefinitionManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(serviceDefinitionManifests, ManifestDataType.EcsServiceDefinition))
    },
    [serviceDefinitionManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteScallingPolicy = React.useCallback(
    (index: number) => {
      scallingPolicyManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scallingPolicyManifests, ManifestDataType.EcsScalingPolicyDefinition))
    },
    [scallingPolicyManifests, updateStageData, getFinalListOfManifest]
  )

  const deleteScalableTarget = React.useCallback(
    (index: number) => {
      scalableTargetManifests.splice(index, 1)
      updateStageData(getFinalListOfManifest(scalableTargetManifests, ManifestDataType.EcsScalableTargetDefinition))
    },
    [scalableTargetManifests, updateStageData, getFinalListOfManifest]
  )

  const changeTaskDefinitionType = () => {
    if (selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION) {
      if (stage) {
        let finalManifestList = get(stage, manifestsFieldPath, []) as ManifestConfigWrapper[]
        const taskDefinitionManifestIds = taskDefinitionManifestList.map(
          currTaskDefManifest => currTaskDefManifest.manifest?.identifier
        )
        if (isTaskDefinitionManifestPresent) {
          finalManifestList = finalManifestList.flatMap(currTaskDefinitionManifest => {
            if (taskDefinitionManifestIds.includes(currTaskDefinitionManifest.manifest?.identifier)) {
              return []
            }
            return [currTaskDefinitionManifest]
          })
        }
        updateStage(
          produce(stage, draft => {
            set(draft, manifestsFieldPath, finalManifestList)
          }).stage as StageElementConfig
        )
      }
    } else {
      if (stage) {
        updateStage(
          produce(stage, draft => {
            unset(draft, taskDefinitionArnFieldPath)
          }).stage as StageElementConfig
        )
      }
    }
    setSelectedTaskDefinitionType(
      selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION
        ? TaskDefinitionType.TASK_DEFINITION_ARN
        : TaskDefinitionType.TASK_DEFINITION
    )
  }

  const onChangingTaskDefinitionWarningModalClose = (isConfirmed: boolean) => {
    if (isConfirmed) {
      changeTaskDefinitionType()
    }
  }

  const currentSelectedSectionName =
    selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION
      ? getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
      : getString('cd.serviceDashboard.taskDefinitionArn')
  const nextSectionToMoveName =
    selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION
      ? getString('cd.serviceDashboard.taskDefinitionArn')
      : getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')

  const { openDialog: showChangingTaskDefinitionTypeWarning } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: (
      <Container width={360}>
        {getString('cd.changeTaskDefinitionTypeWarning', {
          nextSection: nextSectionToMoveName,
          currentSection: currentSelectedSectionName
        })}
      </Container>
    ),
    titleText: getString('cd.changingTaskDefinitionTypeWarningTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    showCloseButton: false,
    onCloseDialog: onChangingTaskDefinitionWarningModalClose
  })

  const taskDefinitionTypeCards = getTaskDefinitionTypeCards(getString)
  const selectedTaskDefinitionCard = taskDefinitionTypeCards.find(card => card.type === selectedTaskDefinitionType)

  const onTaskDefinitionTypeChange = () => {
    if (isTaskDefinitionManifestPresent || taskDefinitionARNFieldValue) {
      showChangingTaskDefinitionTypeWarning()
    } else {
      changeTaskDefinitionType()
    }
  }

  const updateTaskDefinitionARNValue = debounce((updatedValue: string) => {
    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, taskDefinitionArnFieldPath, updatedValue)
        }).stage as StageElementConfig
      )
    }
  }, 500)

  const taskDefinitionTypeSelection = (
    <CardSelect
      data={taskDefinitionTypeCards}
      cornerSelected
      className={css.taskDefinitionTypeCardWrapper}
      renderItem={(item: CardInterface) => (
        <Layout.Horizontal flex spacing={'small'}>
          <Icon
            name={item.icon}
            size={item.size}
            color={selectedTaskDefinitionType === item.type ? Color.PRIMARY_7 : Color.GREY_600}
          />
          <Container>
            <Text
              font={{ variation: FontVariation.FORM_TITLE }}
              color={selectedTaskDefinitionType === item.type ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.title}
            </Text>
            <Text>{item.info}</Text>
          </Container>
        </Layout.Horizontal>
      )}
      selected={selectedTaskDefinitionCard}
      onChange={onTaskDefinitionTypeChange}
    />
  )

  return (
    <div className={css.serviceDefinition}>
      {!!selectedDeploymentType && (
        <>
          <Card className={css.sectionCard} data-testid={'task-definition-card'}>
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_taskDefinition`}
              data-testid={'task-definition-manifest-header-container'}
            >
              {getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_taskDefinition`}
                useStandAlone={true}
              />
            </div>
            <Container margin={{ top: 'medium', bottom: 'medium' }}>{taskDefinitionTypeSelection}</Container>
            {selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION && (
              <>
                <ManifestSelection
                  isPropagating={isPropagating}
                  deploymentType={selectedDeploymentType}
                  isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                  readonly={!!readonly}
                  initialManifestList={taskDefinitionManifests}
                  allowOnlyOneManifest={true}
                  addManifestBtnText={getString('common.addName', {
                    name: getString('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
                  })}
                  updateManifestList={updateListOfManifests}
                  preSelectedManifestType={ManifestDataType.EcsTaskDefinition}
                  availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
                  deleteManifest={deleteTaskDefinition}
                />
              </>
            )}

            {selectedTaskDefinitionType === TaskDefinitionType.TASK_DEFINITION_ARN && (
              <Container className={css.width50} data-testid={'task-definition-ARN-section'}>
                <Formik<TaskDefinitionARNType>
                  onSubmit={noop}
                  formName={'taskDefinitionArnForm'}
                  initialValues={{ ecsTaskDefinitionArn: taskDefinitionARNFieldValue }}
                >
                  {formik => {
                    return (
                      <FormikForm>
                        <Container className={css.fieldContainerWithCog}>
                          <FormInput.MultiTextInput
                            name="ecsTaskDefinitionArn"
                            label={getString('cd.serviceDashboard.taskDefinitionArn')}
                            placeholder={getString('cd.pipelineSteps.serviceTab.manifest.taskDefinitionARNPlaceholder')}
                            disabled={readonly}
                            onChange={value => {
                              updateTaskDefinitionARNValue(value as string)
                            }}
                            multiTextInputProps={{ expressions, allowableTypes }}
                          />
                          {getMultiTypeFromValue(formik.values.ecsTaskDefinitionArn) === MultiTypeInputType.RUNTIME && (
                            <div className={css.configureOptions}>
                              <ConfigureOptions
                                style={{ alignSelf: 'center', marginBottom: 5 }}
                                value={formik.values.ecsTaskDefinitionArn}
                                type="String"
                                variableName="ecsTaskDefinitionArn"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => {
                                  formik.setFieldValue('ecsTaskDefinitionArn', value)
                                  updateTaskDefinitionARNValue(value as string)
                                }}
                                isReadonly={readonly}
                                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                              />
                            </div>
                          )}
                        </Container>
                      </FormikForm>
                    )
                  }}
                </Formik>
              </Container>
            )}
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
            data-testid={'service-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_serviceDefinition`}
            >
              {getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_serviceDefinition`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={serviceDefinitionManifests}
              allowOnlyOneManifest={true}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsServiceDefinition}
              availableManifestTypes={[ManifestDataType.EcsServiceDefinition]}
              deleteManifest={deleteServiceDefinition}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')}
            data-testid={'scalable-target-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalableTarget`}
            >
              {getString('common.headerWithOptionalText', {
                header: getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalableTarget`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={scalableTargetManifests}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.scalableTarget')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsScalableTargetDefinition}
              availableManifestTypes={[ManifestDataType.EcsScalableTargetDefinition]}
              deleteManifest={deleteScalableTarget}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')}
            data-testid={'scaling-policy-definition-card'}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalingPolicy`}
            >
              {getString('common.headerWithOptionalText', {
                header: getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')
              })}
              <HarnessDocTooltip
                tooltipId={`${getManifestsHeaderTooltipId(selectedDeploymentType)}_scalingPolicy`}
                useStandAlone={true}
              />
            </div>
            <ManifestSelection
              isPropagating={isPropagating}
              deploymentType={selectedDeploymentType}
              isReadonlyServiceMode={isReadonlyServiceMode as boolean}
              readonly={!!readonly}
              initialManifestList={scallingPolicyManifests}
              addManifestBtnText={getString('common.addName', {
                name: getString('cd.pipelineSteps.serviceTab.manifest.scalingPolicy')
              })}
              updateManifestList={updateListOfManifests}
              preSelectedManifestType={ManifestDataType.EcsScalingPolicyDefinition}
              availableManifestTypes={[ManifestDataType.EcsScalingPolicyDefinition]}
              deleteManifest={deleteScallingPolicy}
            />
          </Card>

          <Card
            className={css.sectionCard}
            id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          >
            <div
              className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
              data-tooltip-id={getArtifactsHeaderTooltipId(selectedDeploymentType)}
            >
              {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              <HarnessDocTooltip tooltipId={getArtifactsHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
            </div>
            {isPrimaryArtifactSources ? (
              <ServiceV2ArtifactsSelection
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
              />
            ) : (
              <ArtifactsSelection
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                readonly={!!readonly}
              />
            )}
          </Card>
          {(isNewService || isServiceEntityPage) && ( //Config files are only available for creation or readonly mode for service V2
            <Card
              className={css.sectionCard}
              id={getString('pipelineSteps.configFiles')}
              data-testid={'configFiles-card'}
            >
              <div
                className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
                data-tooltip-id={getConfigFilesHeaderTooltipId(selectedDeploymentType)}
              >
                {getString('pipelineSteps.configFiles')}
                <HarnessDocTooltip
                  tooltipId={getConfigFilesHeaderTooltipId(selectedDeploymentType)}
                  useStandAlone={true}
                />
              </div>
              <ConfigFilesSelection
                isReadonlyServiceMode={isReadonlyServiceMode as boolean}
                isPropagating={isPropagating}
                deploymentType={selectedDeploymentType}
                readonly={!!readonly}
              />
            </Card>
          )}
        </>
      )}

      <div className={css.accordionTitle}>
        <div className={css.tabHeading} id="advanced">
          {getString('advancedTitle')}
        </div>
        <Card className={css.sectionCard} id={getString('common.variables')}>
          <div
            className={cx(css.tabSubHeading, css.listHeader, 'ng-tooltip-native')}
            data-tooltip-id={getVariablesHeaderTooltipId(selectedDeploymentType)}
          >
            {getString('common.variables')}
            <HarnessDocTooltip tooltipId={getVariablesHeaderTooltipId(selectedDeploymentType)} useStandAlone={true} />
          </div>
          <WorkflowVariables
            tabName={DeployTabs.SERVICE}
            formName={'addEditServiceCustomVariableForm'}
            factory={factory as any}
            isPropagating={isPropagating}
            readonly={!!readonly}
          />
        </Card>
      </div>
    </div>
  )
}
