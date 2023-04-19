/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { Field, FormikProps } from 'formik'
import { Container, Formik, FormikForm } from '@harness/uicore'
import { cloneDeep, defaultTo, get, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { addStepOrGroup } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StepCategory, useGetStepsV2 } from 'services/pipeline-ng'
import { createStepNodeFromTemplate } from '@pipeline/utils/templateUtils'
import { useMutateAsGet } from '@common/hooks'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getFlattenedStages } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import type { InfraProvisioningData, InfraProvisioningDataUI, InfraProvisioningProps } from './InfraProvisioning'
import { transformValuesFieldsConfig } from './InfraProvisioningFunctionConfigs'
import css from './InfraProvisioning.module.scss'

type InfraProvisioningEntityBaseProps = Pick<InfraProvisioningProps, 'onUpdate'> & {
  initialValues: Pick<InfraProvisioningProps['initialValues'], 'provisioner' | 'originalProvisioner'>
}

export default function InfraProvisioningEntityBase({
  initialValues,
  onUpdate
}: InfraProvisioningEntityBaseProps): JSX.Element {
  const {
    state: {
      pipelineView,
      selectionState: { selectedStageId = '' },
      templateTypes,
      templateIcons,
      pipeline,
      gitDetails,
      storeMetadata
    },
    updateStage,
    updatePipelineView,
    isReadonly,
    getStageFromPipeline
  } = usePipelineContext()
  const { getTemplate } = useTemplateSelector()
  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageId, ''))
  const [allChildTypes, setAllChildTypes] = React.useState<string[]>([])
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { accountId } = useParams<ProjectPathProps>()

  const { data: stepsData, loading: stepsDataLoading } = useMutateAsGet(useGetStepsV2, {
    queryParams: { accountId },
    body: {
      stepPalleteModuleInfos: getStepPaletteModuleInfosFromStage(
        selectedStage?.stage?.type,
        undefined,
        'Provisioner',
        getFlattenedStages(pipeline).stages
      )
    },
    lazy: !isEmpty(allChildTypes)
  })

  const getStepTypesFromCategories = (stepCategories: StepCategory[]): string[] => {
    const validStepTypes: string[] = []
    stepCategories.forEach(category => {
      if (category.stepCategories?.length) {
        validStepTypes.push(...getStepTypesFromCategories(category.stepCategories))
      } else if (category.stepsData?.length) {
        category.stepsData.forEach(stepData => {
          if (stepData.type) {
            validStepTypes.push(stepData.type)
          }
        })
      }
    })
    return validStepTypes
  }

  React.useEffect(() => {
    if (stepsData?.data?.stepCategories) {
      setAllChildTypes(getStepTypesFromCategories(stepsData.data.stepCategories))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsData?.data?.stepCategories])

  const addTemplate = async (event: ExecutionGraphAddStepEvent) => {
    try {
      const { template, isCopied } = await getTemplate({
        templateType: 'Step',
        filterProperties: {
          childTypes: allChildTypes
        },
        gitDetails,
        storeMetadata
      })
      const newStepData = { step: createStepNodeFromTemplate(template, isCopied) }
      const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId || ''))
      executionRef.current?.stepGroupUpdated?.(newStepData.step)
      if (pipelineStage && !get(pipelineStage?.stage, 'spec.environment.provisioner')) {
        set(pipelineStage, 'stage.spec.environment.provisioner', {
          steps: [],
          rollbackSteps: []
        })
      }
      const provisioner = get(pipelineStage?.stage, 'spec.environment.provisioner')
      // set empty arrays
      if (!event.isRollback && !provisioner.steps) {
        provisioner.steps = []
      }
      if (event.isRollback && !provisioner.rollbackSteps) {
        provisioner.rollbackSteps = []
      }

      addStepOrGroup(event.entity, provisioner, newStepData, event.isParallel, event.isRollback)
      if (pipelineStage?.stage) {
        await updateStage(pipelineStage?.stage)
      }
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: {
          type: DrawerTypes.ProvisionerStepConfig,
          data: {
            stepConfig: {
              node: newStepData.step,
              stepsMap: event.stepsMap,
              onUpdate: executionRef.current?.stepGroupUpdated,
              isStepGroup: false,
              addOrEdit: 'edit',
              hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
            }
          }
        }
      })
    } catch (_) {
      // Do nothing
    }
  }

  return (
    <>
      {stepsDataLoading ? (
        <Container>
          <Spinner />
        </Container>
      ) : (
        <Formik
          enableReinitialize
          initialValues={getInitialValuesInCorrectFormat<
            Pick<InfraProvisioningData, 'provisioner' | 'originalProvisioner'>,
            InfraProvisioningDataUI
          >(initialValues, transformValuesFieldsConfig)}
          formName="infraProvisionerEntityBase"
          onSubmit={(_values: InfraProvisioningDataUI) => {
            const schemaValues = getFormValuesInCorrectFormat<InfraProvisioningDataUI, InfraProvisioningData>(
              _values,
              transformValuesFieldsConfig
            )
            onUpdate?.(schemaValues)
          }}
        >
          {(formik: FormikProps<InfraProvisioningDataUI>) => {
            return (
              <FormikForm className={css.provisionerForm}>
                <div className={css.graphContainer}>
                  <Field name="provisioner">
                    {(_props: any) => {
                      return (
                        <ExecutionGraph
                          rollBackPropsStyle={{ top: '10px' }}
                          rollBackBannerStyle={{ top: '10px', backgroundColor: 'rgba(0,0,0,0)' }}
                          canvasButtonsLayout={'horizontal'}
                          allowAddGroup={true}
                          isReadonly={isReadonly}
                          hasRollback={true}
                          hasDependencies={false}
                          templateTypes={templateTypes}
                          templateIcons={templateIcons}
                          stage={formik.values.provisioner as any}
                          originalStage={formik.values.originalProvisioner as any}
                          ref={executionRef}
                          updateStage={stageData => {
                            formik.setFieldValue('provisioner', stageData)
                            onUpdate?.({
                              provisioner: stageData.stage?.spec?.execution || ({} as any),
                              provisionerEnabled: true
                            })
                          }}
                          // Check and update the correct stage path here
                          onAddStep={(event: ExecutionGraphAddStepEvent) => {
                            if (event.isTemplate) {
                              addTemplate(event)
                            } else {
                              updatePipelineView({
                                ...pipelineView,
                                isDrawerOpened: true,
                                drawerData: {
                                  type: DrawerTypes.AddProvisionerStep,
                                  data: {
                                    paletteData: {
                                      entity: event.entity,
                                      stepsMap: event.stepsMap,
                                      onUpdate: executionRef.current?.stepGroupUpdated,
                                      isRollback: event.isRollback,
                                      isParallelNodeClicked: event.isParallel,
                                      hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                                    }
                                  }
                                }
                              })
                            }
                            formik.submitForm()
                          }}
                          onEditStep={(event: ExecutionGraphEditStepEvent) => {
                            updatePipelineView({
                              ...pipelineView,
                              isDrawerOpened: true,
                              drawerData: {
                                type: DrawerTypes.ProvisionerStepConfig,
                                data: {
                                  stepConfig: {
                                    node: event.node as any,
                                    stepsMap: event.stepsMap,
                                    onUpdate: executionRef.current?.stepGroupUpdated,
                                    isStepGroup: event.isStepGroup,
                                    isUnderStepGroup: event.isUnderStepGroup,
                                    addOrEdit: event.addOrEdit,
                                    hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                                  }
                                }
                              }
                            })
                          }}
                        />
                      )
                    }}
                  </Field>
                </div>
              </FormikForm>
            )
          }}
        </Formik>
      )}
    </>
  )
}
