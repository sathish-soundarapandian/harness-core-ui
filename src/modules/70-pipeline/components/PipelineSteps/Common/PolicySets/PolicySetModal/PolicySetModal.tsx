/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEqual } from 'lodash-es'
import type { FormikProps } from 'formik'

import type {
  IconName} from '@harness/uicore';
import {
  Button,
  Layout,
  Container,
  Pagination,
  useToaster,
  Tabs,
  Text,
  ExpandingSearchInput
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'

import { useModalHook } from '@harness/use-modal'
import type { IDialogProps} from '@blueprintjs/core';
import { Dialog, Tab } from '@blueprintjs/core'

import type { StringKeys } from 'framework/strings';
import { useStrings } from 'framework/strings'
import type { GetPolicySetQueryParams, PolicySet} from 'services/pm';
import { useGetPolicySetList } from 'services/pm'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { PolicyManagementPolicySetWizard } from '@governance/GovernanceApp'

import type { RBACError } from '@rbac/utils/useRBACError/useRBACError';
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PolicySetListRenderer } from '../PolicySetListRenderer/PolicySetListRenderer'
import { NewPolicySetButton } from '../NewPolicySetButton/NewPolicySetButton'
import { PolicySetType } from '../utils'

import css from './PolicySetModal.module.scss'

export interface PolicySetModalProps<T> {
  name: string
  formikProps?: FormikProps<T>
  policySetIds: string[]
  closeModal: (action?: string) => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  canOutsideClickClose: true,
  style: {
    width: 1080,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'auto'
  }
}

export function PolicySetModal<T>({
  name,
  formikProps,
  policySetIds,
  closeModal
}: PolicySetModalProps<T>): JSX.Element {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const [selectedTabId, setSelectedTabId] = useState(PolicySetType.ACCOUNT)
  const [policySetList, setPolicySetList] = useState<PolicySet[]>([])
  const [newPolicySetIds, setNewPolicySetIds] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(40)
  const [counts, setCounts] = useState({
    [PolicySetType.ACCOUNT]: 0,
    [PolicySetType.ORG]: 0,
    [PolicySetType.PROJECT]: 0
  })
  const [searchTerm, setsearchTerm] = useState<string>('')

  const {
    accountId: accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    module
  } = useParams<ProjectPathProps & ModulePathParams>()
  const [queryParams, setQueryParams] = useState<GetPolicySetQueryParams>({
    accountIdentifier,
    ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
    ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier, module })
  })

  useEffect(() => {
    // istanbul ignore else
    if (Array.isArray(policySetIds) && policySetIds.length > 0) {
      setNewPolicySetIds(policySetIds)
    }
  }, [])

  useEffect(() => {
    setCounts({
      [PolicySetType.ACCOUNT]: newPolicySetIds.filter(id => id.includes('account.')).length,
      [PolicySetType.ORG]: newPolicySetIds.filter(id => id.includes('org.')).length,
      [PolicySetType.PROJECT]: newPolicySetIds.filter(id => !id.includes('account.') && !id.includes('org.')).length
    })
  }, [newPolicySetIds])

  useEffect(() => {
    // Set request query params to contain the org and project depending on the scope selected
    setQueryParams({
      accountIdentifier,
      ...((selectedTabId === PolicySetType.ORG || selectedTabId === PolicySetType.PROJECT) && { orgIdentifier }),
      ...(selectedTabId === PolicySetType.PROJECT && { projectIdentifier, module })
    })
  }, [selectedTabId])

  const reqQueryParams = useMemo(
    () => ({
      ...queryParams,
      page: String(pageIndex),
      per_page: pageSize.toString(),
      searchTerm: searchTerm
    }),
    [pageIndex, pageSize, queryParams, searchTerm]
  )

  const {
    data: policySets,
    loading,
    error,
    refetch,
    response: policySetResponse
  } = useGetPolicySetList({
    queryParams: {
      ...reqQueryParams,
      type: defaultTo((formikProps?.values as any)?.spec?.type?.toLowerCase(), 'custom'),
      action: 'onstep'
    },
    debounce: 300
  })

  const pageCount = useMemo(
    () => parseInt(defaultTo(/* istanbul ignore next */ policySetResponse?.headers?.get('x-total-pages'), '1')),
    [policySetResponse]
  )

  const itemCount = useMemo(
    () => parseInt(defaultTo(/* istanbul ignore next */ policySetResponse?.headers?.get('x-total-items'), '0')),
    [policySetResponse]
  )

  useEffect(() => {
    // istanbul ignore else
    if (error) {
      showError(getRBACErrorMessage(error as RBACError))
    }
    // istanbul ignore else
    if (!policySets && !error) {
      refetch()
    }
    // istanbul ignore else
    if (!isEqual(policySets, policySetList)) {
      setPolicySetList(defaultTo(policySets, []))
    }
  }, [error, policySets, refetch])

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps} onClose={hideModal}>
        <PolicyManagementPolicySetWizard hideModal={hideModal} refetch={refetch} queryParams={queryParams} />
        <Button
          minimal
          className={css.closeIcon}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            refetch()
            hideModal()
          }}
        />
      </Dialog>
    )
  }, [queryParams])

  const handleTabChange = (nextTab: PolicySetType): void => {
    setSelectedTabId(nextTab)
    setPageIndex(0)
  }

  // This component renders the title for the tabs in the modal
  function TabTitle({
    icon,
    type,
    count,
    identifier
  }: {
    icon: IconName
    type: StringKeys
    count: number
    identifier?: string
  }): JSX.Element {
    return (
      <Container>
        <Text font={{ size: 'normal' }} icon={icon}>
          {getString(type)}
          {identifier ? `\xA0[${identifier}]` : ''}
          {count > 0 && (
            <Text
              itemType="span"
              icon={'main-tick'}
              iconProps={{
                color: Color.WHITE,
                size: 10
              }}
              className={css.selectedCount}
              background={Color.PRIMARY_7}
              color={Color.WHITE}
              margin={{ left: 'small' }}
              padding={{ right: 'small', left: 'small' }}
            >
              {count}
            </Text>
          )}
        </Text>
      </Container>
    )
  }

  // This component renders the tab panel in the modal
  function TabPanel(): JSX.Element {
    return (
      <>
        <ExpandingSearchInput
          alwaysExpanded
          placeholder={getString('common.searchPlaceholder')}
          onChange={text => {
            setsearchTerm(text.trim())
          }}
          width={'100%'}
          autoFocus={false}
          defaultValue={searchTerm}
          throttle={300}
        />
        <PolicySetListRenderer
          newPolicySetIds={newPolicySetIds}
          setNewPolicySetIds={setNewPolicySetIds}
          policySetList={policySetList}
          loading={loading}
          error={error}
          refetch={refetch}
          selectedTabId={selectedTabId}
          showModal={showModal}
        />
        <Pagination
          itemCount={itemCount}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20, 40]}
          onPageSizeChange={size => setPageSize(size)}
          pageIndex={pageIndex}
          gotoPage={index => setPageIndex(index)}
          hidePageNumbers
        />
        <hr className={css.separator} />
        <Container margin={{ top: 'large' }}>
          <Layout.Horizontal spacing="medium">
            <Button
              text="Apply"
              intent="primary"
              onClick={() => {
                formikProps?.setFieldValue(name, newPolicySetIds)
                closeModal(getString('common.apply'))
              }}
            />
            <Button text="Cancel" onClick={() => closeModal()} />
          </Layout.Horizontal>
        </Container>
      </>
    )
  }

  return (
    <>
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => closeModal()}
        className={css.policySetModal}
        title={
          <Layout.Horizontal
            spacing="xsmall"
            padding={{ top: 'xlarge', left: 'medium', right: 'large' }}
            flex={{ justifyContent: 'space-between' }}
          >
            <Text font={{ variation: FontVariation.H3 }}>{getString('common.policiesSets.selectPolicySet')}</Text>
            <NewPolicySetButton onClick={showModal} />
          </Layout.Horizontal>
        }
      >
        <Container padding={{ top: 'medium', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }} width={'800px'}>
          <Tabs id="policySetModal" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
            <Tab
              id={PolicySetType.ACCOUNT}
              title={<TabTitle icon="layers" type={'account'} count={counts[PolicySetType.ACCOUNT]} />}
              panel={<TabPanel />}
              data-testid="account"
            />
            <Tab
              id={PolicySetType.ORG}
              title={
                <TabTitle
                  icon="diagram-tree"
                  type={'orgLabel'}
                  count={counts[PolicySetType.ORG]}
                  identifier={orgIdentifier}
                />
              }
              panel={<TabPanel />}
              data-testid="orgLabel"
            />
            <Tab
              id={PolicySetType.PROJECT}
              title={
                <TabTitle
                  icon="cube"
                  type={'projectLabel'}
                  count={counts[PolicySetType.PROJECT]}
                  identifier={projectIdentifier}
                />
              }
              panel={<TabPanel />}
              data-testid="projectLabel"
            />
          </Tabs>
        </Container>
      </Dialog>
    </>
  )
}
