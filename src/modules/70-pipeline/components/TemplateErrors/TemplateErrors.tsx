/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { YamlSchemaErrorDTO, NodeErrorInfo } from 'services/pipeline-ng'
import type { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import stepFactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stageTypeToIconMap } from '@pipeline/utils/constants'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import PipelineErrorCard from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineErrors/PipelineErrorCard'
import css from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineErrors/PipelineErrors.module.scss'

type gotoViewWithDetails = () => void

export interface PropsInterface {
  errors: YamlSchemaErrorDTO[]
  gotoViewWithDetails: gotoViewWithDetails
  onClose: () => void
  template?: NGTemplateInfoConfig
}

interface StageErrorsType {
  stageErrors: YamlSchemaErrorDTO[]
  errorsByStep: Record<string, YamlSchemaErrorDTO[]>
  stepIds: string[]
}

interface StepErrorsType {
  errorsByStep: Record<string, YamlSchemaErrorDTO[]>
  ids: string[]
}

/* Note: SelectedTemplate refers to the type of template at the time of creation. */
const isSelectedTemplateError = (item: YamlSchemaErrorDTO): boolean => !item.stageInfo && !item.stepInfo
const isStageErrorInSelectedTemplate = (item: YamlSchemaErrorDTO): boolean => !!item.stageInfo && !item.stepInfo
const isStepErrorInSelectedTemplate = (item: YamlSchemaErrorDTO): boolean => !!item.stageInfo && !!item.stepInfo

const getNameFromItem = (item: NodeErrorInfo = {}): string | undefined => item.name || item.identifier || item.fqn
const getIdentifierFromItem = (item?: NodeErrorInfo): string => item?.identifier || ''

const addToErrorsByStage = (errorsByStage: Record<string, YamlSchemaErrorDTO[]>, item: YamlSchemaErrorDTO) => {
  const identifier = getIdentifierFromItem(item.stageInfo)
  return [...(errorsByStage[identifier] || []), item]
}

const addToErrorsByStep = (errorsByStep: Record<string, YamlSchemaErrorDTO[]>, item: YamlSchemaErrorDTO) => {
  const identifier = getIdentifierFromItem(item.stepInfo)
  return [...(errorsByStep[identifier] || []), item]
}

const getSelectedStageTemplateAdaptedErrors = (schemaErrors: YamlSchemaErrorDTO[]) =>
  schemaErrors.reduce(
    (
      accum: {
        stepIds: string[]
        errorsByStep: Record<string, YamlSchemaErrorDTO[]>
        stageErrors: Array<YamlSchemaErrorDTO>
      },
      item: YamlSchemaErrorDTO
    ) => {
      const errorsByStep = accum.errorsByStep
      if (isSelectedTemplateError(item)) {
        accum.stageErrors.push(item)
      } else if (item.stepInfo) {
        const identifier = getIdentifierFromItem(item.stepInfo)
        if (errorsByStep[identifier]) {
          errorsByStep[identifier] = addToErrorsByStep(errorsByStep, item)
        } else {
          errorsByStep[identifier] = [item]
          accum.stepIds.push(identifier)
        }
      }

      return accum
    },
    { stepIds: [], errorsByStep: {}, stageErrors: [] }
  )

const getSelectedStageTemplateAdaptedErrorsForStep = (
  stepIds: string[],
  errorsByTemplate: Record<string, YamlSchemaErrorDTO[]>
): Record<string, StepErrorsType> => {
  const updatedErrorsByStageStep: Record<string, StepErrorsType> = {}

  stepIds.forEach((stepId: string) => {
    updatedErrorsByStageStep[stepId] = errorsByTemplate[stepId]?.reduce(
      (accum: StepErrorsType, item: YamlSchemaErrorDTO) => {
        const { errorsByStep, ids } = accum
        if (!item.stageInfo && !!item.stepInfo) {
          const identifier = getIdentifierFromItem(item.stepInfo)
          if (errorsByStep[identifier]) {
            // push to existing object
            errorsByStep[identifier] = addToErrorsByStep(errorsByStep, item)
          } else {
            errorsByStep[identifier] = [item]
            ids.push(identifier)
          }
        }
        return accum
      },
      { errorsByStep: {}, ids: [] }
    )
  })

  return updatedErrorsByStageStep
}

const getSelectedTemplateAdaptedErrors = (schemaErrors: YamlSchemaErrorDTO[]) =>
  schemaErrors.reduce(
    (
      accum: {
        stageIds: string[]
        errorsByStage: Record<string, YamlSchemaErrorDTO[]>
        selectedTemplateErrors: Array<YamlSchemaErrorDTO>
      },
      item: YamlSchemaErrorDTO
    ) => {
      const errorsByStage = accum.errorsByStage
      if (isSelectedTemplateError(item)) {
        accum.selectedTemplateErrors.push(item)
      } else if (item.stageInfo) {
        const identifier = getIdentifierFromItem(item.stageInfo)
        if (errorsByStage[identifier]) {
          errorsByStage[identifier] = addToErrorsByStage(errorsByStage, item)
        } else {
          errorsByStage[identifier] = [item]
          accum.stageIds.push(identifier)
        }
      }
      return accum
    },
    { stageIds: [], errorsByStage: {}, selectedTemplateErrors: [] }
  )

const getPipelineTemplateAdaptedErrorsForStageStep = (
  stageIds: string[],
  errorsByStage: Record<string, YamlSchemaErrorDTO[]>
): Record<string, StageErrorsType> => {
  const updatedErrorsByStageStep: Record<string, StageErrorsType> = {}

  stageIds.forEach((stageId: string) => {
    updatedErrorsByStageStep[stageId] = errorsByStage[stageId]?.reduce(
      (accum: StageErrorsType, item: YamlSchemaErrorDTO) => {
        const { stageErrors, errorsByStep, stepIds } = accum

        if (isStageErrorInSelectedTemplate(item)) {
          stageErrors.push(item)
        } else if (isStepErrorInSelectedTemplate(item)) {
          const identifier = getIdentifierFromItem(item.stepInfo)
          if (errorsByStep[identifier]) {
            // push to existing object
            errorsByStep[identifier] = addToErrorsByStep(errorsByStep, item)
          } else {
            errorsByStep[identifier] = [item]
            stepIds.push(identifier)
          }
        }
        return accum
      },
      { stageErrors: [], errorsByStep: {}, stepIds: [] }
    )
  })
  return updatedErrorsByStageStep
}

function StageErrorCard({
  errors,
  gotoViewWithDetails
}: {
  errors: YamlSchemaErrorDTO[]
  gotoViewWithDetails: gotoViewWithDetails
}): React.ReactElement | null {
  const { getString } = useStrings()
  if (errors.length === 0) {
    return null
  }
  return (
    <PipelineErrorCard
      errors={errors.map(err => err?.message).filter(e => e) as string[]}
      icon={stageTypeToIconMap[errors[0].stageInfo?.type || '']}
      onClick={gotoViewWithDetails}
      buttonText={getString('pipeline.errorFramework.fixStage')}
    />
  )
}

function StepErrorCard({
  stepIds,
  errorsByStep,
  gotoViewWithDetails
}: {
  stepIds: string[]
  errorsByStep: Record<string, YamlSchemaErrorDTO[]>
  gotoViewWithDetails: gotoViewWithDetails
}): React.ReactElement | null {
  const { getString } = useStrings()
  if (stepIds.length === 0) {
    return null
  }
  const renderStepError = (stepId: string): React.ReactElement => {
    const stepErrors = errorsByStep[stepId] || []
    const stepName = getNameFromItem(stepErrors[0]?.stepInfo)
    const stepTitle = `${getString('pipeline.execution.stepTitlePrefix')} ${stepName}`
    return (
      <PipelineErrorCard
        key={stepId || stepName}
        title={stepTitle}
        errors={stepErrors.map(err => err.message).filter(e => e) as string[]}
        icon={stepFactory.getStepIcon(get(stepErrors[0], 'stepInfo.type', ''))}
        onClick={gotoViewWithDetails}
        buttonText={getString('pipeline.errorFramework.fixStep')}
      />
    )
  }
  return <>{stepIds.map(renderStepError)}</>
}

function StepErrors({
  errors,
  gotoViewWithDetails
}: {
  errors: StepErrorsType
  gotoViewWithDetails: gotoViewWithDetails
}): React.ReactElement {
  const { ids, errorsByStep } = errors
  return <StepErrorCard gotoViewWithDetails={gotoViewWithDetails} errorsByStep={errorsByStep} stepIds={ids} />
}

function StageErrors({
  errors,
  gotoViewWithDetails
}: {
  gotoViewWithDetails: gotoViewWithDetails
  errors: StageErrorsType
}): React.ReactElement {
  const { stepIds, errorsByStep, stageErrors } = errors
  const { getString } = useStrings()
  const stageInfo = stageErrors?.length ? stageErrors[0].stageInfo : errorsByStep?.[stepIds[0]]?.[0]?.stageInfo
  const stageName = stageInfo ? getNameFromItem(stageInfo) : ''

  return (
    <>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.execution.stageTitlePrefix')} {stageName}
      </Text>
      <StageErrorCard gotoViewWithDetails={gotoViewWithDetails} errors={stageErrors} />
      <StepErrorCard gotoViewWithDetails={gotoViewWithDetails} errorsByStep={errorsByStep} stepIds={stepIds} />
    </>
  )
}

function SelectedTemplateErrors({
  errors,
  gotoViewWithDetails,
  template
}: {
  errors: YamlSchemaErrorDTO[]
  gotoViewWithDetails: gotoViewWithDetails
  template?: NGTemplateInfoConfig
}): React.ReactElement | null {
  const { getString } = useStrings()
  if (errors.length === 0) {
    return null
  }

  return (
    <>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} margin={{ bottom: 'medium' }}>
        {template?.type === 'Pipeline' && getString('common.pipeline')}
      </Text>
      <PipelineErrorCard
        errors={errors.map(e => e.message).filter(e => e) as string[]}
        icon={
          template?.type === 'Pipeline'
            ? 'pipeline'
            : template?.type === 'Stage'
            ? stageTypeToIconMap[template?.spec?.type]
            : stepFactory.getStepIcon(template?.spec?.type)
        }
        onClick={gotoViewWithDetails}
        buttonText={getString('pipeline.errorFramework.fixErrors')}
      />
    </>
  )
}

const getFieldsLabel = (
  selectedTemplateErrors: Array<YamlSchemaErrorDTO>,
  stageIds: string[],
  updatedErrorsByStageStep: Record<string, StageErrorsType>,
  getString: (str: keyof StringsMap, vars?: Record<string, any> | undefined) => string
) => {
  let str = ''

  const hasSelectedTemplateErrors = selectedTemplateErrors.length
  // if only pipeline errors
  if (hasSelectedTemplateErrors && stageIds.length === 0) {
    str = getString('pipeline.errorFramework.header12')
  } else {
    const hasStageErrors = stageIds.some((stageId: string) => updatedErrorsByStageStep[stageId].stageErrors.length)
    const hasStepErrors = stageIds.some(
      (stageId: string) => Object.keys(updatedErrorsByStageStep[stageId]?.errorsByStep || {}).length
    )
    const errorInSingleStage = stageIds.length === 1
    if (hasSelectedTemplateErrors) {
      let stringToAppend = ''
      if (hasStageErrors && hasStepErrors) {
        stringToAppend = errorInSingleStage
          ? getString('pipeline.errorFramework.header1')
          : getString('pipeline.errorFramework.header2')
      } else if (hasStageErrors) {
        stringToAppend = errorInSingleStage
          ? getString('pipeline.errorFramework.header3')
          : getString('pipeline.errorFramework.header4')
      } else {
        stringToAppend = getString('pipeline.errorFramework.header5')
      }
      str = getString('pipeline.errorFramework.header6', { stringToAppend })
    } else {
      if (hasStageErrors && hasStepErrors) {
        str = errorInSingleStage
          ? getString('pipeline.errorFramework.header7')
          : getString('pipeline.errorFramework.header8')
      } else if (hasStageErrors) {
        str = errorInSingleStage
          ? getString('pipeline.errorFramework.header9')
          : getString('pipeline.errorFramework.header10')
      } else {
        str = getString('pipeline.errorFramework.header11')
      }
    }
  }
  return str || getString('pipeline.errorFramework.header12')
}

const errorHeadingForSelectedTemplate = (errorHeadingText: string): React.ReactElement => {
  return (
    <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'normal' }} margin={{ bottom: 'medium' }}>
      {errorHeadingText}
    </Text>
  )
}

function TemplateErrorContent({
  stageIds,
  stepIds,
  selectedTemplateErrors,
  gotoViewWithDetails,
  updatedErrorsByStageStep,
  stageErrors,
  updatedErrorsByStep,
  template
}: {
  stageIds: string[]
  stepIds: string[]
  selectedTemplateErrors: Array<YamlSchemaErrorDTO>
  gotoViewWithDetails: gotoViewWithDetails
  updatedErrorsByStageStep: Record<string, StageErrorsType>
  stageErrors: YamlSchemaErrorDTO[]
  updatedErrorsByStep: Record<string, StepErrorsType>
  template?: NGTemplateInfoConfig
}): React.ReactElement {
  const { getString } = useStrings()
  const templateType = template?.type

  switch (templateType) {
    case 'Stage':
    case 'StepGroup':
      return (
        <div className={css.pipelineErrorList}>
          {templateType === 'Stage'
            ? errorHeadingForSelectedTemplate(
                `${getString('pipeline.execution.stageTitlePrefix')} ${template?.identifier}`
              )
            : errorHeadingForSelectedTemplate(
                `${getString('pipeline.execution.stepGroupTitlePrefix')} ${template?.identifier}`
              )}
          <SelectedTemplateErrors gotoViewWithDetails={gotoViewWithDetails} errors={stageErrors} template={template} />
          {stepIds.map((stepId: string) => {
            return (
              <StepErrors key={stepId} gotoViewWithDetails={gotoViewWithDetails} errors={updatedErrorsByStep[stepId]} />
            )
          })}
        </div>
      )
    default:
      return (
        <div className={css.pipelineErrorList}>
          {templateType === 'Step' &&
            errorHeadingForSelectedTemplate(
              `${getString('pipeline.execution.stepTitlePrefix')} ${template?.identifier}`
            )}
          <SelectedTemplateErrors
            errors={selectedTemplateErrors}
            gotoViewWithDetails={gotoViewWithDetails}
            template={template}
          />
          {stageIds.map((stageId: string) => {
            return (
              <StageErrors
                key={stageId}
                gotoViewWithDetails={gotoViewWithDetails}
                errors={updatedErrorsByStageStep[stageId]}
              />
            )
          })}
        </div>
      )
  }
}

function TemplateErrors({
  errors: schemaErrors,
  gotoViewWithDetails,
  onClose,
  template
}: PropsInterface): React.ReactElement | null {
  const { getString } = useStrings()
  if (!schemaErrors || !schemaErrors.length) {
    return null
  }

  //Handling this for pipeline, step, artifact templates.
  const { stageIds, errorsByStage, selectedTemplateErrors } = getSelectedTemplateAdaptedErrors(schemaErrors)

  //Handling stage/step errors which might be there inside pipeline template
  const updatedErrorsByStageStep = getPipelineTemplateAdaptedErrorsForStageStep(stageIds, errorsByStage)

  //Handling this for stage, step group templates
  const { errorsByStep, stageErrors, stepIds } = getSelectedStageTemplateAdaptedErrors(schemaErrors)

  //Handling step errors which might be there inside stage template
  const updatedErrorsByStep = getSelectedStageTemplateAdaptedErrorsForStep(stepIds, errorsByStep)

  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      onClose={onClose}
      title={
        <Text
          font={{ size: 'medium', weight: 'bold' }}
          color={Color.BLACK}
          icon="warning-icon"
          iconProps={{ size: 20, padding: { right: 'small' } }}
        >
          {getString('pipeline.errorFramework.templateErrorsTitle', {
            fields: getFieldsLabel(selectedTemplateErrors, stageIds, updatedErrorsByStageStep, getString)
          })}
        </Text>
      }
      isCloseButtonShown
      className={cx(css.errorDialog, Classes.DIALOG)}
    >
      <TemplateErrorContent
        stageIds={stageIds}
        stageErrors={stageErrors}
        stepIds={stepIds}
        selectedTemplateErrors={selectedTemplateErrors}
        gotoViewWithDetails={gotoViewWithDetails}
        updatedErrorsByStageStep={updatedErrorsByStageStep}
        updatedErrorsByStep={updatedErrorsByStep}
        template={template}
      />
    </Dialog>
  )
}

export default TemplateErrors
