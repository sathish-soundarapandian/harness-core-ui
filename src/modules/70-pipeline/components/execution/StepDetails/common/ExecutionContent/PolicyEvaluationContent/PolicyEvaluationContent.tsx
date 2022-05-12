/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'

import { Collapse, Color, Container, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'

import { useDeepCompareEffect } from '@common/hooks'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import EvaluationStatusLabel, { EvaluationStatus } from './EvaluationStatusLabel/EvaluationStatusLabel'
import { EvaluationCount } from './EvaluationCount/EvaluationCount'

import css from './PolicyEvaluationContent.module.scss'

interface EvaluationCounts {
  [EvaluationStatus.ERROR]: number
  [EvaluationStatus.WARNING]: number
  [EvaluationStatus.PASS]: number
}

export interface EvaluatedPolicy {
  name: string
  status: EvaluationStatus
  identifier?: string
  denyMessages?: []
  error?: string
}

export function PolicyEvaluationContent({ step }: { step: ExecutionNode }) {
  const { getString } = useStrings()
  const [evaluationCounts, setEvaluationCounts] = useState<EvaluationCounts>({
    error: 0,
    warning: 0,
    pass: 0
  })

  const policyStepEvaluationId = defaultTo(/* istanbul ignore next */ step?.outcomes?.output?.evaluationId, '')
  const policySetDetails = defaultTo(/* istanbul ignore next */ step?.outcomes?.output?.policySetDetails, {})
  const policySetIds = Object.keys(policySetDetails)

  useDeepCompareEffect(() => {
    const counts: EvaluationCounts = {
      error: 0,
      warning: 0,
      pass: 0
    }
    for (const policySetId in policySetDetails) {
      const policyDetails = defaultTo(policySetDetails[policySetId]?.policyDetails, [])
      for (const policyId in policyDetails) {
        const policy = policyDetails[policyId] as EvaluatedPolicy
        if (policy.status) {
          counts[policy.status] = defaultTo(counts[policy.status], 0) + 1
        }
      }
    }
    setEvaluationCounts(counts)
  }, [policySetDetails])

  if (isEmpty(policySetIds)) {
    return <Text margin={{ left: 'large' }}>{getString('common.policy.noPolicyEvalResult')}</Text>
  } else {
    return (
      <Container border={{ top: true }} padding="medium">
        <Layout.Horizontal>
          <Text margin={{ left: 'small', right: 'large' }}>{getString('pipeline.policyEvaluations.title')}</Text>
          <EvaluationCount status={EvaluationStatus.ERROR} count={evaluationCounts[EvaluationStatus.ERROR]} />
          <EvaluationCount status={EvaluationStatus.WARNING} count={evaluationCounts[EvaluationStatus.WARNING]} />
          <EvaluationCount status={EvaluationStatus.PASS} count={evaluationCounts[EvaluationStatus.PASS]} />
        </Layout.Horizontal>
        <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}>
          {policySetIds.map(id => {
            return (
              <PolicySetInfo
                key={id}
                policySet={policySetDetails[id]}
                policyStepEvaluationId={policyStepEvaluationId as string}
              />
            )
          })}
        </Layout.Vertical>
      </Container>
    )
  }
}

function PolicySetInfo({
  policySet,
  policyStepEvaluationId
}: {
  policySet: { [key: string]: any }
  policyStepEvaluationId: string
}) {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { module } = useModuleInfo()

  const { name, identifier, status, policyDetails: policies } = policySet

  if (isEmpty(policies)) {
    return <Text margin={{ left: 'large' }}>{getString('common.policy.noPolicyResult')}</Text>
  } else {
    const scope = identifier.includes('account.')
      ? getString('account')
      : identifier.includes('org.')
      ? getString('orgLabel')
      : getString('projectLabel')

    const policyIds = Object.keys(policies)

    return (
      <Container>
        <Collapse
          collapseClassName={css.collapse}
          iconProps={
            {
              color: Color.PRIMARY_7,
              padding: { right: 'small' }
            } as any
          }
          collapsedIcon={'main-chevron-down'}
          expandedIcon={'main-chevron-up'}
          heading={
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Text lineClamp={1} width={'300px'} padding={{ right: 'small' }}>
                <Link
                  to={routes.toGovernancePolicySetDetail({
                    accountId,
                    policySetIdentifier: defaultTo(identifier, ''),
                    ...(scope === getString('orgLabel') && { orgIdentifier }),
                    ...(scope === getString('projectLabel') && { module, orgIdentifier, projectIdentifier })
                  })}
                >
                  {getString('pipeline.policyEvaluations.policySetName', { name })}
                </Link>
              </Text>
              <Text width={'100px'} font={{ size: 'small' }}>
                {scope}
              </Text>
              <EvaluationStatusLabel status={status} />
            </Layout.Horizontal>
          }
        >
          <Container margin={{ top: 'large' }} border={{ top: true }}>
            {policyIds.map((id, index) => {
              return (
                <PolicyInfo
                  key={id}
                  policy={policies[id]}
                  numberInList={index + 1}
                  policyStepEvaluationId={policyStepEvaluationId}
                />
              )
            })}
          </Container>
        </Collapse>
      </Container>
    )
  }
}

export function PolicyInfo({
  policy,
  numberInList,
  policyStepEvaluationId
}: {
  policy: EvaluatedPolicy
  numberInList: number
  policyStepEvaluationId: string
}) {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { module } = useModuleInfo()

  const { name: policyName, identifier, status, denyMessages, error: errorMessage } = policy
  const statusColor =
    status === EvaluationStatus.PASS ? Color.SUCCESS : status === EvaluationStatus.ERROR ? Color.ERROR : Color.WARNING

  const scope = identifier?.includes('account.')
    ? getString('account')
    : identifier?.includes('org.')
    ? getString('orgLabel')
    : getString('projectLabel')

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }} padding={{ top: 'large' }}>
      <Layout.Vertical>
        <Text lineClamp={1} width={'400px'} padding={{ right: 'small' }}>
          <Link
            to={{
              pathname: routes.toGovernanceEvaluationDetail({
                accountId,
                ...(scope === getString('orgLabel') && { orgIdentifier }),
                ...(scope === getString('projectLabel') && { module, orgIdentifier, projectIdentifier }),
                evaluationId: policyStepEvaluationId
              })
            }}
          >
            {`Policy ${numberInList}: ${policyName}`}
          </Link>
        </Text>
        <Layout.Vertical>
          {!!denyMessages?.length && (
            <FailureInfo label={getString('details')}>
              {denyMessages.map((message: string, index: number) => (
                <Text key={index} color={statusColor}>
                  {denyMessages?.length > 1 ? '- ' : ''}
                  {message}
                </Text>
              ))}
            </FailureInfo>
          )}
          {errorMessage && (
            <FailureInfo label={getString('error')}>
              <Text key={errorMessage} color={statusColor} lineClamp={2}>
                {errorMessage}
              </Text>
            </FailureInfo>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <EvaluationStatusLabel status={status} />
    </Layout.Horizontal>
  )
}

function FailureInfo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Layout.Horizontal
      spacing="xsmall"
      padding={{ left: 'xxxlarge', top: 'small' }}
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      <Text color={Color.BLACK}>{label.toUpperCase()}</Text>
      <Container padding={{ left: 'small' }} width={300}>
        {children}
      </Container>
    </Layout.Horizontal>
  )
}
