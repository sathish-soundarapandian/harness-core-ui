/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import moment from 'moment'
import { defaultTo } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import { Checkbox, Collapse, Color, Container, Layout, Page, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { PolicySet } from 'services/pm'

import { DEFAULT_DATE_FORMAT } from '@common/utils/StringUtils'

import { MiniPoliciesRenderer } from './MiniPolicySetRenderer'
import { NewPolicySetButton } from '../NewPolicySetButton/NewPolicySetButton'
import { PolicySetType } from '../../PolicyStepTypes'

import css from './PolicySetListRenderer.module.scss'

export interface PolicySetListRendererProps {
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
  newPolicySetIds: string[]
  setNewPolicySetIds: (list: string[]) => void
  policySetList: PolicySet[]
  selectedTabId: PolicySetType
  showModal: () => void
}

export function PolicySetListRenderer({
  loading,
  error,
  refetch,
  newPolicySetIds,
  setNewPolicySetIds,
  policySetList,
  selectedTabId,
  showModal
}: PolicySetListRendererProps) {
  const { getString } = useStrings()

  return (
    <Page.Body
      loading={loading}
      error={/*istanbul ignore next*/ defaultTo((error?.data as Error)?.message, error?.message)}
      retryOnError={/* istanbul ignore next */ () => refetch()}
      noData={{
        when: () => !policySetList?.length,
        icon: 'nav-project',
        message: getString('common.policiesSets.noPolicySetResult'),
        button: <NewPolicySetButton onClick={showModal} />
      }}
      className={css.renderer}
    >
      {policySetList.map((policySet: PolicySet) => {
        const checked =
          newPolicySetIds.some(_id => {
            const parts = _id.split('.')
            if (parts[1] === undefined && selectedTabId === PolicySetType.PROJECT) {
              return parts[0] === policySet.identifier
            } else if (parts[0] === 'account' && selectedTabId === PolicySetType.ACCOUNT) {
              return parts[1] === policySet.identifier
            } else if (parts[0] === 'org' && selectedTabId === PolicySetType.ORG) {
              return parts[1] === policySet.identifier
            }
          }) ?? false

        const policySetId = policySet.project_id
          ? `${policySet.identifier}`
          : policySet.org_id
          ? `org.${policySet.identifier}`
          : `account.${policySet.identifier}`

        return (
          <Collapse
            key={policySetId}
            collapseClassName={css.policySetRows}
            heading={
              <Layout.Horizontal width={'100%'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Layout.Vertical padding={{ left: 'medium' }}>
                  <Checkbox
                    name="selectedPolicySets"
                    value={policySetId}
                    checked={checked}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      if ((e.target as any).checked) {
                        setNewPolicySetIds([...newPolicySetIds, policySetId])
                      } else {
                        setNewPolicySetIds(newPolicySetIds.filter(_id => _id !== policySetId))
                      }
                    }}
                  />
                </Layout.Vertical>
                <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK} padding="medium">
                  {policySet.name}
                </Text>
              </Layout.Horizontal>
            }
            collapsedIcon={'main-chevron-right'}
            expandedIcon={'main-chevron-down'}
          >
            <Layout.Horizontal border={{ top: true }} background={Color.GREY_50}>
              <Container padding={{ top: 'medium', bottom: 'medium' }} width={'50%'}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }} style={{ textTransform: 'capitalize' }}>
                  {getString('common.policy.label')}
                </Text>
                <MiniPoliciesRenderer policies={defaultTo(policySet.policies, [])} />
              </Container>
              <Container padding={{ top: 'medium', bottom: 'medium' }}>
                <Text font={{ size: 'normal' }} padding={{ bottom: 'small' }} style={{ textTransform: 'capitalize' }}>
                  {getString('common.lastModifiedTime')}
                </Text>
                <Text font={{ size: 'normal' }} color={Color.GREY_900}>
                  {moment.unix((policySet.updated as number) / 1000).format(DEFAULT_DATE_FORMAT)}
                </Text>
              </Container>
            </Layout.Horizontal>
          </Collapse>
        )
      })}
    </Page.Body>
  )
}
