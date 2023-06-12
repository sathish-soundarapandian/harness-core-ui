/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { Drawer, PopoverPosition, Position } from '@blueprintjs/core'
import cx from 'classnames'
const LazyReactMarkdown = lazy(() => import('react-markdown'))
import { useParams } from 'react-router-dom'
import { get, isEmpty } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { Infrastructure, RcaRequestBody, ResponseRemediation, rcaPromise, Error } from 'services/logs'
import { useStrings } from 'framework/strings'
import { pluralize } from '@common/utils/StringUtils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useLocalStorage } from '@common/hooks'
import { createFormDataFromObjectPayload } from '@common/constants/Utils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import {
  getCommandFromCurrentStep,
  getInfraTypeFromStageForCurrentStep,
  resolveCurrentStep
} from '@pipeline/utils/executionUtils'
import type { LogsContentProps } from '@pipeline/factories/ExecutionFactory/types'
import { getTaskFromExecutableResponse } from '../LogsContent/LogsState/createSections'

import css from './HarnessCopilot.module.scss'

interface HarnessCopilotProps {
  mode: LogsContentProps['mode']
}

enum AIAnalysisStatus {
  NotIniatied = 'NOT_INITIATED',
  Cancelled = 'CANCELLED',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Failure = 'FAILURE'
}

function ReactMarkdown({ children, className }: { children: string; className: string }): React.ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyReactMarkdown className={className}>{children}</LazyReactMarkdown>
    </Suspense>
  )
}

function HarnessCopilot(props: HarnessCopilotProps): React.ReactElement {
  const { mode } = props
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps & ModulePathParams>()
  const {
    pipelineStagesMap,
    selectedStageId,
    pipelineExecutionDetail,
    selectedStepId,
    queryParams,
    allNodeMap,
    logsToken,
    openAIRemediations,
    setOpenAIRemediations
  } = useExecutionContext()
  const [showTooltip, setShowTooltip] = useLocalStorage<boolean>('show_harness_ai_co-pilot_tooptip', true)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [remediations, setRemediations] = useState<ResponseRemediation[]>([])
  const [remediationsGeneratedAt, setRemediationsGeneratedAt] = useState<number>()
  const [error, setError] = useState<Error>()
  const [status, setStatus] = useState<AIAnalysisStatus>(AIAnalysisStatus.NotIniatied)
  const currentStepId = resolveCurrentStep(selectedStepId, queryParams)
  const selectedStep = allNodeMap[currentStepId]

  useEffect(() => {
    const { lastGeneratedAt, remediations: previouslyGeneratedRemediations } = openAIRemediations || {}
    if (lastGeneratedAt && previouslyGeneratedRemediations && !isEmpty(previouslyGeneratedRemediations)) {
      setRemediations(previouslyGeneratedRemediations)
      setStatus(AIAnalysisStatus.Success)
      setRemediationsGeneratedAt(lastGeneratedAt)
    }
  }, [openAIRemediations])

  const fetchAnalysis = useCallback((): void => {
    setStatus(AIAnalysisStatus.InProgress)
    const apiBodyPayload = getPostAPIBodyPayload()
    if (isEmpty(apiBodyPayload)) {
      setStatus(AIAnalysisStatus.Failure)
      return
    }
    if (!logsToken) {
      setStatus(AIAnalysisStatus.Failure)
      return
    }
    const currentTime = new Date().getTime()
    try {
      rcaPromise({
        queryParams: { 'X-Harness-Token': logsToken },
        requestOptions: {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        },
        body: createFormDataFromObjectPayload(apiBodyPayload)
      })
        .then((response: ResponseRemediation) => {
          if (get(response, 'error_msg')) {
            setError(response as Error)
            setStatus(AIAnalysisStatus.Failure)
          } else {
            const remediationFetched = [response]
            setRemediations(remediationFetched)
            setStatus(AIAnalysisStatus.Success)
            setRemediationsGeneratedAt(currentTime)
            setOpenAIRemediations?.({ lastGeneratedAt: currentTime, remediations: remediationFetched })
          }
        })
        .catch((err: Error) => {
          setError(err)
          setStatus(AIAnalysisStatus.Failure)
        })
    } catch (e) {
      setError(e as Error)
      setStatus(AIAnalysisStatus.Failure)
    }
  }, [logsToken])

  const getPostAPIBodyPayload = useCallback((): RcaRequestBody => {
    return {
      infra: getInfraTypeFromStageForCurrentStep({
        pipelineStagesMap,
        selectedStageId,
        pipelineExecutionDetail
      }) as Infrastructure['type'],
      command: getCommandFromCurrentStep({ step: selectedStep, pipelineStagesMap, selectedStageId }),
      step_type: get(selectedStep, 'stepType', ''),
      accountID: accountId,
      err_summary: get(selectedStep, 'failureInfo.message', ''),
      keys: get(getTaskFromExecutableResponse(selectedStep), 'logKeys', '""')
    }
  }, [pipelineStagesMap, selectedStageId, pipelineExecutionDetail, selectedStep, accountId])

  const renderCTA = useCallback((): JSX.Element => {
    const hasRemediations = Array.isArray(remediations) && remediations.length > 0
    const errorMssg = (error as Error)?.error_msg ?? getString('errorTitle')
    const footerColor = mode === 'console-view' ? Color.GREY_200 : Color.GREY_900

    switch (status) {
      case AIAnalysisStatus.NotIniatied:
        return (
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start' }}
            className={cx(css.pill, css.successPill)}
            spacing="medium"
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
              <Icon name="harness-copilot" size={25} />
              <Layout.Horizontal flex spacing="xsmall">
                <Text font={{ variation: FontVariation.BODY }}>{getString('pipeline.copilot.analyzeFailure')}</Text>
                <Text
                  font={{ variation: FontVariation.BODY }}
                  color={Color.AI_PURPLE_700}
                  onClick={fetchAnalysis}
                  tooltip={
                    <Container className={css.tooltipPadding}>
                      <Container flex={{ justifyContent: 'flex-end' }}>
                        <Icon
                          name="cross"
                          size={20}
                          onClick={() => setShowTooltip(false)}
                          data-testid="dismiss-tooltip-button"
                          className={css.closeBtn}
                        />
                      </Container>
                      <Layout.Vertical spacing="small" className={css.tooltipContent}>
                        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
                          <Icon name="harness-copilot" size={25} />
                          <Text className={css.label} font={{ variation: FontVariation.H5 }}>
                            {getString('pipeline.copilot.introduction')}
                          </Text>
                        </Layout.Horizontal>
                        <Text className={css.label} font={{ variation: FontVariation.SMALL }}>
                          {getString('pipeline.copilot.helpText')}
                        </Text>
                      </Layout.Vertical>
                    </Container>
                  }
                  tooltipProps={{
                    isOpen: showTooltip,
                    popoverClassName: css.tooltip,
                    usePortal: true,
                    position: PopoverPosition.TOP_RIGHT
                  }}
                  className={css.copilot}
                >
                  {getString('pipeline.copilot.askAICopilot')}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Layout.Horizontal>
        )
      case AIAnalysisStatus.InProgress:
        return (
          <Layout.Vertical flex>
            <Layout.Horizontal
              flex={{ justifyContent: 'flex-start' }}
              className={cx(css.pill, css.successPill)}
              spacing="medium"
            >
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                <Icon name="harness-copilot" size={25} />
                <Text font={{ variation: FontVariation.BODY }}>{getString('pipeline.copilot.analyzing')}</Text>
                <Icon name="loading" size={25} color={Color.AI_PURPLE_900} />
              </Layout.Horizontal>
              <Text
                font={{ variation: FontVariation.BODY }}
                onClick={() => setStatus(AIAnalysisStatus.NotIniatied)}
                className={css.statusActionBtn}
                color={Color.AI_PURPLE_700}
              >
                {getString('common.stop')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
              <Icon name="info" size={15} color={footerColor} />
              <Text color={footerColor} font={{ variation: FontVariation.SMALL }}>
                {getString('common.delay15Sec')}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        )
      case AIAnalysisStatus.Success:
        return (
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start' }}
            className={cx(css.pill, { [css.successPill]: hasRemediations }, { [css.failurePill]: !hasRemediations })}
            spacing="medium"
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
              <Icon name="harness-copilot" size={25} />
              {hasRemediations ? (
                <Text font={{ variation: FontVariation.BODY }}>
                  {getString('pipeline.copilot.foundPossibleRemediations').concat(pluralize(remediations.length))}
                </Text>
              ) : (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                  <Text font={{ variation: FontVariation.BODY }}>
                    {getString('pipeline.copilot.noRemediationFound')}
                  </Text>
                  <Icon name="danger-icon" size={20} />
                </Layout.Horizontal>
              )}
            </Layout.Horizontal>
            {hasRemediations ? (
              <Text
                font={{ variation: FontVariation.BODY }}
                onClick={() => setShowPanel(true)}
                className={css.statusActionBtn}
                color={Color.AI_PURPLE_700}
              >
                {getString('common.viewText')}
              </Text>
            ) : (
              <Text
                font={{ variation: FontVariation.BODY }}
                onClick={() => setStatus(AIAnalysisStatus.NotIniatied)}
                className={css.statusActionBtn}
                color={Color.AI_PURPLE_700}
              >
                {getString('close')}
              </Text>
            )}
          </Layout.Horizontal>
        )
      case AIAnalysisStatus.Failure:
        return (
          <Layout.Horizontal
            flex={{ justifyContent: 'flex-start' }}
            className={cx(css.pill, css.failurePill)}
            spacing="medium"
          >
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
              <Icon name="harness-copilot" size={25} />
              {errorMssg ? <Text font={{ variation: FontVariation.BODY }}>{errorMssg}</Text> : null}
              <Icon name="danger-icon" size={20} />
            </Layout.Horizontal>
            <Text
              font={{ variation: FontVariation.BODY }}
              onClick={fetchAnalysis}
              className={css.statusActionBtn}
              color={Color.AI_PURPLE_700}
            >
              {getString('retry')}
            </Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }, [status, showTooltip, remediations, error, logsToken])

  const renderRemediation = useCallback(
    (remediation: string): JSX.Element => {
      return (
        <Layout.Vertical spacing="xsmall">
          <Layout.Vertical
            className={css.remediation}
            padding={{ top: 'large', left: 'xlarge', right: 'xlarge' }}
            spacing="small"
          >
            <Text className={css.label} font={{ variation: FontVariation.H5 }}>
              {getString('pipeline.copilot.possibleSolutions')}
            </Text>
            <ReactMarkdown className={cx(css.markdown, css.overflow)}>{remediation}</ReactMarkdown>
          </Layout.Vertical>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
            {remediationsGeneratedAt ? (
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} className={css.flex2}>
                <Text color={Color.AI_PURPLE_600} font={{ variation: FontVariation.FORM_LABEL }}>{`${getString(
                  'common.generatedAt'
                )} ${moment(remediationsGeneratedAt).format('LLL')}`}</Text>
              </Layout.Horizontal>
            ) : null}
            <Container flex className={css.flex1}>
              <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('common.isHelpful')}</Text>
              <Container flex>
                <Button variation={ButtonVariation.ICON} icon="main-tick" iconProps={{ size: 15 }} />
                <Button variation={ButtonVariation.ICON} icon="small-cross" iconProps={{ size: 20 }} />
              </Container>
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical>
      )
    },
    [remediationsGeneratedAt]
  )

  return (
    <>
      {renderCTA()}
      <Drawer
        position={Position.RIGHT}
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        className={css.drawer}
        isCloseButtonShown={true}
      >
        <Layout.Vertical className={css.panel}>
          <Layout.Vertical padding={{ bottom: 'xlarge' }} spacing="medium">
            <Container>
              <Container flex={{ justifyContent: 'flex-end' }}>
                <Icon
                  name="cross"
                  size={25}
                  onClick={() => setShowPanel(false)}
                  data-testid="close-drawer-button"
                  className={css.closeBtn}
                />
              </Container>
              <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'flex-start' }}>
                <Icon name="harness-copilot" size={35} />
                <Text font={{ variation: FontVariation.H2 }}>{getString('pipeline.copilot.label')}</Text>
              </Layout.Horizontal>
            </Container>
            <Text>{getString('pipeline.copilot.assist')}</Text>
          </Layout.Vertical>
          <Layout.Vertical>
            {remediations.map((remediation: ResponseRemediation) => renderRemediation(remediation.rca))}
          </Layout.Vertical>
        </Layout.Vertical>
      </Drawer>
    </>
  )
}

export default HarnessCopilot
