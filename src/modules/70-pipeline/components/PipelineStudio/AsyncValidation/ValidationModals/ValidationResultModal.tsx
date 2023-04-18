/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { Icon } from '@harness/icons'
import { Button, ButtonSize, ButtonVariation, ModalDialog, Tab, Tabs, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { isNil } from 'lodash-es'
import { PolicyManagementEvaluationView } from '@governance/PolicyManagementEvaluationView'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { Evaluation } from 'services/pm'
import type { TemplateValidationResponseDTO } from 'services/pipeline-ng'
import { RevalidateFooter } from './RevalidateFooter'
import {
  isStatusFailure,
  isStatusSuccess,
  useValidationErrorCount,
  ValidationStatus,
  ValidationArea,
  useValidationSummary,
  ValidationAreaStatus
} from '../ValidationUtils'
import css from '../ValidationBadge.module.scss'

interface ValidationAreaItemProps {
  onClick: () => void
  errorCount: number
  text: string
  status: ValidationAreaStatus
  area: ValidationArea
}

function ValidationAreaItem({ onClick, text, errorCount, status, area }: ValidationAreaItemProps): JSX.Element {
  const { getString } = useStrings()

  const { suffix, icon } = ((): {
    suffix: JSX.Element | null
    icon: JSX.Element | null
  } => {
    switch (status) {
      case 'success':
        return { suffix: null, icon: <Icon name="success-tick" size={16} /> }
      case 'failure':
        return {
          suffix: (
            <Button
              className={css.buttonLink}
              onClick={onClick}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              text={`(${getString('pipeline.validation.nIssues', { n: errorCount })})`}
            />
          ),
          icon: <Icon name="warning-sign" color={Color.RED_700} size={16} />
        }
      case 'pending':
        return {
          suffix: (
            <Text tag="span" color={Color.GREY_500} font={{ variation: FontVariation.BODY }}>
              {`(${getString('pipeline.validation.pending')})`}
            </Text>
          ),
          icon: <Icon name="status-pending" color={Color.GREY_400} size={18} />
        }
    }
  })()

  return (
    <div data-testid={`${area}_${status}`} className={css.validationAreaItem}>
      {icon}
      <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY }}>
        {text}
      </Text>
      {suffix}
    </div>
  )
}

interface ValidationSummaryProps {
  policyEval?: Evaluation
  templatesValidation?: TemplateValidationResponseDTO
  status: ValidationStatus | undefined
  onClick: (type: ValidationArea) => void
}

function ValidationSummary({ policyEval, templatesValidation, status, onClick }: ValidationSummaryProps): JSX.Element {
  const { getString } = useStrings()
  const { templatesErrorCount, policySetsErrorCount } = useValidationErrorCount({
    policyEval,
    templatesValidation,
    status
  })
  const summary = useValidationSummary({
    policyEval,
    templatesValidation,
    status
  })

  return (
    <div className={css.validationSummary}>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_700}>
        {getString('pipeline.validation.validationAreasTitle')}
      </Text>
      <ValidationAreaItem
        errorCount={templatesErrorCount}
        onClick={() => onClick('template')}
        status={summary.template.status}
        text={getString('pipeline.validation.templateUsage')}
        area={'template'}
      />
      <ValidationAreaItem
        errorCount={policySetsErrorCount}
        onClick={() => onClick('policy')}
        status={summary.policy.status}
        text={getString('pipeline.validation.policySetEvaluation')}
        area={'policy'}
      />
    </div>
  )
}

interface TemplateIssuesPanelProps {
  templatesValidation?: TemplateValidationResponseDTO
}

function TemplateIssuesPanel({ templatesValidation }: TemplateIssuesPanelProps): JSX.Element | null {
  if (!templatesValidation?.exceptionMessage) return null

  return (
    <div className={css.templateIssuesPanel}>
      <Icon name="warning-sign" size={24} color={Color.RED_700} />
      <Text font={{ variation: FontVariation.BODY }}>{templatesValidation.exceptionMessage}</Text>
    </div>
  )
}

interface ValidationTitleProps {
  icon: JSX.Element | null
  title: string | null
  endTs?: number
}

function ValidationTitle({ icon, title, endTs }: ValidationTitleProps): JSX.Element {
  return (
    <div className={css.title}>
      {icon}
      <div>
        <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
          {title}
        </Text>
        {!isNil(endTs) && Number.isFinite(endTs) && (
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
            <ReactTimeago date={endTs} live />
          </Text>
        )}
      </div>
    </div>
  )
}

interface ValidationResultModalProps {
  isOpen: boolean
  policyEval?: Evaluation
  templatesValidation?: TemplateValidationResponseDTO
  status: ValidationStatus | undefined
  endTs?: number
  onClose: () => void
  onRevalidate: () => Promise<void>
}

export function ValidationResultModal({
  isOpen,
  policyEval,
  status,
  endTs,
  templatesValidation,
  onClose,
  onRevalidate
}: ValidationResultModalProps): JSX.Element | null {
  const { accountId, module } = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = useState<ValidationArea | 'summary'>('summary')
  const { templatesErrorCount, policySetsErrorCount } = useValidationErrorCount({
    policyEval,
    templatesValidation,
    status
  })
  const isSuccess = isStatusSuccess(status)
  const isFailure = isStatusFailure(status)

  const {
    icon: titleIcon = null,
    title = null,
    width = 640
  } = (() => {
    if (isSuccess) {
      return {
        icon: <Icon name="success-tick" size={40} />,
        title: getString('pipeline.validation.pipelineValidated'),
        width: 640
      }
    }
    if (isFailure) {
      return {
        icon: <Icon name="warning-sign" color={Color.RED_700} size={40} />,
        title: getString('pipeline.validation.pipelineValidationFailed'),
        width: 900
      }
    }
    return {}
  })()

  const onValidationAreaClick = (area: ValidationArea): void => {
    setActiveTab(area)
  }

  return (
    <ModalDialog
      isOpen={isOpen}
      enforceFocus={false}
      width={width}
      onClose={onClose}
      title={<ValidationTitle endTs={endTs} icon={titleIcon} title={title} />}
      className={css.validationResultModal}
      canEscapeKeyClose
      canOutsideClickClose
      footer={<RevalidateFooter onClose={onClose} onRevalidate={onRevalidate} />}
      lazy
      usePortal
    >
      {isSuccess && (
        <ValidationSummary
          policyEval={policyEval}
          templatesValidation={templatesValidation}
          status={status}
          onClick={onValidationAreaClick}
        />
      )}
      {isFailure && (
        <Tabs
          id="validation-areas"
          selectedTabId={activeTab}
          onChange={newTab => {
            setActiveTab(newTab as typeof activeTab)
          }}
          renderAllTabPanels={false}
        >
          <Tab
            id={'summary'}
            title={getString('summary')}
            panel={
              <ValidationSummary
                policyEval={policyEval}
                templatesValidation={templatesValidation}
                status={status}
                onClick={onValidationAreaClick}
              />
            }
          />
          {templatesErrorCount > 0 && (
            <Tab
              id={'template'}
              title={getString('pipeline.validation.templateIssuesN', { n: templatesErrorCount })}
              panel={<TemplateIssuesPanel templatesValidation={templatesValidation} />}
            />
          )}
          {policySetsErrorCount > 0 && (
            <Tab
              id={'policy'}
              title={getString('pipeline.validation.policySetIssuesN', { n: policySetsErrorCount })}
              panel={
                <PolicyManagementEvaluationView
                  metadata={policyEval}
                  accountId={accountId}
                  module={module}
                  headingErrorMessage={getString('pipeline.policyEvaluations.failureHeadingEvaluationDetail')}
                  headingWarningMessage={getString('pipeline.policyEvaluations.warningHeadingEvaluationDetail')}
                  className={css.policySetIssuesPanel}
                />
              }
            />
          )}
        </Tabs>
      )}
    </ModalDialog>
  )
}
