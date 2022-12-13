/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import {
  Accordion,
  Button,
  ButtonVariation,
  Card,
  Container,
  Formik,
  FormikForm,
  FormInput,
  HarnessDocTooltip,
  Text,
  useConfirmationDialog
} from '@harness/uicore'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { Color, Intent } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'
import { get, isEmpty, omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  CustomVariableEditableExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import { NameId, NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import {
  DeployTabs,
  isNewServiceEnvEntity
} from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { StringNGVariable, TemplateLinkConfig } from 'services/cd-ng'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import {
  createTemplate,
  getTemplateNameWithLabel,
  getTemplateRefVersionLabelObject
} from '@pipeline/utils/templateUtils'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import { deleteStageInfo, hasStageData, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { errorCheck } from '@common/utils/formikHelpers'
import type { TemplateSummaryResponse } from 'services/template-ng'
import SelectDeploymentType from '../../DeployServiceSpecifications/SelectDeploymentType'
import type { EditStageFormikType, EditStageViewProps } from '../EditStageViewInterface'
import css from './EditStageView.module.scss'
import stageCss from '../../DeployStageSetupShell/DeployStage.module.scss'

export const EditStageView: React.FC<EditStageViewProps> = ({
  data,
  template,
  onSubmit,
  context,
  onChange,
  isReadonly,
  children,
  updateDeploymentType
}): JSX.Element => {
  const { getString } = useStrings()
  const newStageData: Item[] = [
    {
      label: getString('service'),
      value: 'service',
      icon: 'service',
      disabled: false
    },
    {
      label: getString('multipleService'),
      value: 'multiple-service',
      icon: 'multi-service',
      disabled: true
    },
    {
      label: getString('functions'),
      value: 'functions',
      icon: 'functions',
      disabled: true
    },
    {
      label: getString('otherWorkloads'),
      value: 'other-workloads',
      icon: 'other-workload',
      disabled: true
    }
  ]

  const {
    state: {
      selectionState: { selectedStageId },
      pipeline: { stages = [] }
    },
    stepsFactory,
    getStageFromPipeline,
    contextType,
    allowableTypes,
    updateStage
  } = usePipelineContext()
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const allNGVariables = (data?.stage?.variables || []) as AllNGVariables[]
  const { errorMap } = useValidationErrors()
  const { subscribeForm, unSubscribeForm, submitFormsForTab } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const isSvcEnvEntityEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const getDeploymentType = (): ServiceDeploymentType => {
    return get(data, 'stage.spec.deploymentType')
  }
  const getLinkedDeploymentTemplateConfig = () => {
    return get(data, 'stage.spec.customDeploymentRef')
  }
  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>(
    getDeploymentType()
  )

  const [linkedDeploymentTemplateConfig, setLinkedDeploymentTemplateConfig] = useState<TemplateLinkConfig | undefined>(
    getLinkedDeploymentTemplateConfig()
  )
  const selectedDeploymentTemplateRef = useRef<TemplateSummaryResponse | undefined>()
  const fromTemplateSelectorRef = useRef(false)

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const { getTemplate } = useTemplateSelector()

  const onUseDeploymentTemplate = (deploymentTemplate: TemplateSummaryResponse): void => {
    setSelectedDeploymentType(ServiceDeploymentType.CustomDeployment)
    const stageData = produce(stage, draft => {
      if (draft) {
        deleteStageInfo(draft?.stage)
        set(draft, 'stage.spec.deploymentType', ServiceDeploymentType.CustomDeployment)
        set(draft, 'stage.spec.customDeploymentRef', getTemplateRefVersionLabelObject(deploymentTemplate))
      }
    })
    if (stageData?.stage) {
      updateStage(stageData.stage)
    }
  }

  const handleAddOrUpdateTemplate = async (): Promise<void> => {
    try {
      const { template: deploymentTemplate } = await getTemplate({
        templateType: TemplateType.CustomDeployment,
        allowedUsages: [TemplateUsage.USE]
      })

      setLinkedDeploymentTemplateConfig(getTemplateRefVersionLabelObject(deploymentTemplate))
      onUseDeploymentTemplate(deploymentTemplate)
    } catch (_) {
      // user cancelled template selection - we keep the existing template
    }
  }

  const getDeploymentTemplate = async (): Promise<void> => {
    if (fromTemplateSelectorRef.current && selectedDeploymentTemplateRef.current) {
      setLinkedDeploymentTemplateConfig(getTemplateRefVersionLabelObject(selectedDeploymentTemplateRef.current))
      onUseDeploymentTemplate(selectedDeploymentTemplateRef.current)
      return
    }

    try {
      const { template: deploymentTemplate } = await getTemplate({
        selectedTemplate: selectedDeploymentTemplateRef.current,
        templateType: TemplateType.CustomDeployment,
        allowedUsages: [TemplateUsage.USE],
        showChangeTemplateDialog: false,
        hideTemplatesView: true,
        disableUseTemplateIfUnchanged: false
      })

      setLinkedDeploymentTemplateConfig(getTemplateRefVersionLabelObject(deploymentTemplate))
      onUseDeploymentTemplate(deploymentTemplate)
    } catch (_) {
      // user cancelled template selection
    }
  }

  React.useEffect(() => {
    /* istanbul ignore else */
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.OVERVIEW)
    }
  }, [errorMap])

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.OVERVIEW, form: formikRef })
  }, [])

  const handleSubmit = (values: EditStageFormikType): void => {
    /* istanbul ignore else */
    if (data?.stage) {
      if (template) {
        onSubmit?.({ stage: createTemplate(values, template) }, values.identifier)
      } else {
        data.stage.identifier = values.identifier
        data.stage.name = values.name
        if (!isEmpty(values.deploymentType)) {
          set(data, 'stage.spec.deploymentType', values.deploymentType)
          if (values.deploymentType === ServiceDeploymentType.CustomDeployment && linkedDeploymentTemplateConfig) {
            set(data, 'stage.spec.customDeploymentRef', {
              templateRef: linkedDeploymentTemplateConfig.templateRef,
              versionLabel: linkedDeploymentTemplateConfig.versionLabel
            })
          }
        }
        if (values.description) {
          data.stage.description = values.description
        }
        /* istanbul ignore else */
        if (values.tags) {
          data.stage.tags = values.tags
        }
        if (values.gitOpsEnabled) {
          set(data, 'stage.spec.gitOpsEnabled', values.gitOpsEnabled)
        }
        onSubmit?.(data, values.identifier)
      }
    }
  }
  const { openDialog: openStageDataDeleteWarningDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.stageDataDeleteWarningText'),
    titleText: getString('pipeline.stageDataDeleteWarningTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        const newDeploymentType = (formikRef.current?.values as EditStageFormikType)
          ?.deploymentType as ServiceDeploymentType
        if (newDeploymentType === ServiceDeploymentType.CustomDeployment) {
          getDeploymentTemplate()
        } else {
          setSelectedDeploymentType(newDeploymentType)
          updateDeploymentType && updateDeploymentType(newDeploymentType, true)
        }
      } else {
        formikRef.current?.setFieldValue('deploymentType', selectedDeploymentType)
      }
    }
  })

  const handleDeploymentTypeChange = (deploymentType: ServiceDeploymentType): void => {
    if (deploymentType === selectedDeploymentType) return

    formikRef.current?.setFieldValue('deploymentType', deploymentType)

    if (hasStageData(data?.stage)) {
      openStageDataDeleteWarningDialog()
    } else {
      if (deploymentType === ServiceDeploymentType.CustomDeployment) {
        getDeploymentTemplate()
      } else {
        setLinkedDeploymentTemplateConfig(undefined)
        setSelectedDeploymentType(deploymentType)
        updateDeploymentType && updateDeploymentType(deploymentType)
      }
    }
  }

  const onDeploymentTemplateSelect = (
    deploymentTemplate: TemplateSummaryResponse,
    fromTemplateSelector: boolean
  ): void => {
    selectedDeploymentTemplateRef.current = deploymentTemplate
    fromTemplateSelectorRef.current = fromTemplateSelector

    if (selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
      getDeploymentTemplate()
    } else {
      handleDeploymentTypeChange(ServiceDeploymentType.CustomDeployment)
    }
  }

  const shouldRenderDeploymentType = (): boolean => {
    if (context) {
      return !!(
        isNewServiceEnvEntity(isSvcEnvEntityEnabled, data?.stage as DeploymentStageElementConfig) &&
        !isEmpty(selectedDeploymentType)
      )
    }
    return !!isNewServiceEnvEntity(isSvcEnvEntityEnabled, data?.stage as DeploymentStageElementConfig)
  }

  const isStageCreationDisabled = (): boolean => {
    return !template && shouldRenderDeploymentType() && isEmpty(selectedDeploymentType)
  }

  return (
    <div className={stageCss.deployStage}>
      <DeployServiceErrors domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div
        className={context ? cx(stageCss.contentSection, stageCss.paddedSection) : css.contentSection}
        ref={scrollRef}
      >
        {context ? (
          <div className={stageCss.tabHeading} id="stageOverview">
            {getString('stageOverview')}
          </div>
        ) : (
          <Text icon="cd-main" iconProps={{ size: 16 }} className={css.addStageHeading}>
            {getString('pipelineSteps.build.create.aboutYourStage')}
          </Text>
        )}
        <Container>
          <Formik<EditStageFormikType>
            initialValues={{
              identifier: data?.stage?.identifier || '',
              name: data?.stage?.name || '',
              description: data?.stage?.description,
              tags: data?.stage?.tags || {},
              serviceType: newStageData[0].value,
              deploymentType: selectedDeploymentType,
              gitOpsEnabled: data?.stage?.spec?.gitOpsEnabled
            }}
            formName="cdEditStage"
            onSubmit={handleSubmit}
            validate={values => {
              const errors: { name?: string } = {}
              if (isDuplicateStageId(values.identifier || '', stages, !!context)) {
                errors.name = getString('validation.identifierDuplicate')
              }
              if (context && data) {
                onChange?.(omit(values, 'serviceType', 'deploymentType'))
              }
              return errors
            }}
            validationSchema={Yup.object().shape(getNameAndIdentifierSchema(getString, contextType))}
          >
            {formikProps => {
              window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.OVERVIEW }))
              formikRef.current = formikProps as FormikProps<unknown> | null
              const removeMarginClass = !(errorCheck('name', formikProps) || get(formikProps, `errors.identifier`)) && {
                className: css.zeroMargin
              }
              return (
                <FormikForm>
                  {isContextTypeNotStageTemplate(contextType) && (
                    <>
                      {context ? (
                        <div>
                          <Card className={stageCss.sectionCard}>
                            <NameIdDescriptionTags
                              formikProps={formikProps}
                              identifierProps={{
                                inputLabel: getString('stageNameLabel'),
                                isIdentifierEditable: !context,
                                inputGroupProps: {
                                  disabled: isReadonly,
                                  ...removeMarginClass
                                }
                              }}
                              descriptionProps={{ disabled: isReadonly }}
                              tagsProps={{ disabled: isReadonly }}
                              className={css.nameIdDescriptionTags}
                            />
                          </Card>
                        </div>
                      ) : template ? (
                        <NameId
                          identifierProps={{
                            inputLabel: getString('stageNameLabel'),
                            isIdentifierEditable: !context && !isReadonly,
                            inputGroupProps: { disabled: isReadonly }
                          }}
                        />
                      ) : (
                        <NameIdDescriptionTags
                          formikProps={formikProps}
                          identifierProps={{
                            inputLabel: getString('stageNameLabel'),
                            isIdentifierEditable: !context && !isReadonly,
                            inputGroupProps: {
                              disabled: isReadonly,
                              ...removeMarginClass
                            }
                          }}
                          descriptionProps={{ disabled: isReadonly }}
                          tagsProps={{ disabled: isReadonly }}
                          className={css.nameIdDescriptionTags}
                        />
                      )}
                    </>
                  )}

                  {template && (
                    <Text
                      icon={'template-library'}
                      margin={{ top: 'medium', bottom: 'medium' }}
                      font={{ size: 'small' }}
                      iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                      color={Color.BLACK}
                      lineClamp={1}
                    >
                      {`Using Template: ${getTemplateNameWithLabel(template)}`}
                    </Text>
                  )}

                  {shouldRenderDeploymentType() && !template && (
                    <>
                      <div className={cx({ [css.deploymentType]: !isEmpty(context) })}>
                        <SelectDeploymentType
                          viewContext={context}
                          selectedDeploymentType={selectedDeploymentType}
                          isReadonly={isReadonly}
                          handleDeploymentTypeChange={handleDeploymentTypeChange}
                          shouldShowGitops={false}
                          templateLinkConfig={linkedDeploymentTemplateConfig}
                          onDeploymentTemplateSelect={onDeploymentTemplateSelect}
                          addOrUpdateTemplate={handleAddOrUpdateTemplate}
                          templateBarOverrideClassName={cx(
                            { [css.templateBarOverride]: !context },
                            { [css.halfWidthBar]: !!context }
                          )}
                        />
                      </div>
                      {selectedDeploymentType === ServiceDeploymentType['Kubernetes'] && (
                        <FormInput.CheckBox
                          name="gitOpsEnabled"
                          label={getString('common.gitOps')}
                          className={css.gitOpsCheck}
                        />
                      )}
                    </>
                  )}

                  {!context && (
                    <Button
                      margin={{ top: 'medium' }}
                      type="submit"
                      disabled={isStageCreationDisabled()}
                      variation={ButtonVariation.PRIMARY}
                      text={getString('pipelineSteps.build.create.setupStage')}
                    />
                  )}
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
        {context && (
          <>
            <Accordion activeId={allNGVariables.length > 0 ? 'advanced' : ''} className={stageCss.accordion}>
              <Accordion.Panel
                id="advanced"
                addDomId={true}
                summary={<div className={stageCss.tabHeading}>{getString('common.advanced')}</div>}
                details={
                  <Card className={stageCss.sectionCard} id="variables">
                    <div
                      className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
                      data-tooltip-id="overviewStageVariables"
                    >
                      {getString('pipeline.stageVariables')}
                      <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                    </div>
                    <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                      factory={stepsFactory}
                      initialValues={{
                        variables: allNGVariables,
                        canAddVariable: true
                      }}
                      readonly={isReadonly}
                      type={StepType.CustomVariable}
                      stepViewType={StepViewType.StageVariable}
                      allowableTypes={allowableTypes}
                      onUpdate={({ variables }: CustomVariablesData) => {
                        onChange?.({ ...(data?.stage as DeploymentStageElementConfig), variables })
                      }}
                      customStepProps={{
                        tabName: DeployTabs.OVERVIEW,
                        formName: 'addEditStageCustomVariableForm',
                        yamlProperties:
                          getStageFromPipeline(
                            data?.stage?.identifier || '',
                            variablesPipeline
                          )?.stage?.stage?.variables?.map?.(
                            variable => metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                          ) || [],
                        enableValidation: true
                      }}
                    />
                  </Card>
                }
              />
            </Accordion>
            <Container margin={{ top: 'xxlarge' }}>{children}</Container>
          </>
        )}
      </div>
    </div>
  )
}
