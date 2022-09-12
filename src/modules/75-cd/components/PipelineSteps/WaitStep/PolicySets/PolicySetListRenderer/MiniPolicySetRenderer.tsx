/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import cx from 'classnames'

import { Button, Color, Layout, Text } from '@harness/uicore'
import { LinkedPolicy, useGetPolicySet } from 'services/pm'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'

import { PolicySetType } from '../../PolicyStepTypes'

import css from './PolicySetListRenderer.module.scss'

interface MiniPolicySetRendererProps {
  policySetId: string
  deletePolicySet: (policySetId: string) => void
}

export function MiniPolicySetRenderer({ policySetId, deletePolicySet }: MiniPolicySetRendererProps) {
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()

  const policySetType = policySetId.includes('account.')
    ? PolicySetType.ACCOUNT
    : policySetId.includes('org.')
    ? PolicySetType.ORG
    : PolicySetType.PROJECT

  const {
    data: policySet,
    loading,
    error
  } = useGetPolicySet({
    queryParams: {
      accountIdentifier,
      ...((policySetType === PolicySetType.ORG || policySetType === PolicySetType.PROJECT) && { orgIdentifier }),
      ...(policySetType === PolicySetType.PROJECT && { projectIdentifier })
    },
    policyset: policySetId
  })

  const onDelete = () => {
    deletePolicySet(policySetId)
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} margin={{ bottom: 'small' }}>
      <Layout.Horizontal
        className={css.policySetHolder}
        height={'36px'}
        width={'500px'}
        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
        padding={{
          right: 'medium',
          left: 'medium'
        }}
        margin={{
          right: 'xsmall'
        }}
      >
        {loading ? (
          <Spinner size={Spinner.SIZE_SMALL} />
        ) : error ? (
          <Text lineClamp={1} color={Color.RED_800}>
            {getRBACErrorMessage(error as RBACError)}
          </Text>
        ) : policySet ? (
          <>
            <Text lineClamp={1} color={Color.BLACK}>
              {policySet.name}
            </Text>
            <Layout.Horizontal flex={{ justifyContent: 'flex-end', alignItems: 'center' }}>
              <MiniPoliciesRenderer policies={defaultTo(policySet.policies, [])} alignRight />
              <Text font={'small'} width={48}>
                {policySetType}
              </Text>
            </Layout.Horizontal>
          </>
        ) : null}
      </Layout.Horizontal>
      <Button icon="main-trash" onClick={onDelete} minimal />
    </Layout.Horizontal>
  )
}

interface MiniPoliciesRendererProps {
  policies: LinkedPolicy[]
  alignRight?: boolean
}

export function MiniPoliciesRenderer({ policies, alignRight }: MiniPoliciesRendererProps) {
  const length = policies.length
  // istanbul ignore else
  if (length === 0) {
    return null
  }
  const policyNames = policies.map(policy => policy.name)

  return (
    <Layout.Horizontal
      flex={{ justifyContent: alignRight ? 'flex-end' : 'flex-start', alignItems: 'center' }}
      margin={{ right: 'small' }}
    >
      {policyNames.slice(0, 2).map(policy => (
        <Text
          className={cx(css.styledPolicy, {
            [css.big]: length === 1
          })}
          key={policy}
          lineClamp={1}
        >
          {policy}
        </Text>
      ))}
      {length > 2 && (
        <Text
          className={css.styledPolicy}
          background={Color.GREY_100}
          alwaysShowTooltip
          tooltip={
            <Layout.Vertical padding="medium">
              {policyNames.splice(2).map(policy => (
                <Text
                  lineClamp={1}
                  color={Color.BLACK}
                  margin={length > 3 && { top: 'small', bottom: 'small' }}
                  style={{ maxWidth: '400px' }}
                  key={policy}
                >
                  {policy}
                </Text>
              ))}
            </Layout.Vertical>
          }
        >
          {`+${length - 2}`}
        </Text>
      )}
    </Layout.Horizontal>
  )
}
