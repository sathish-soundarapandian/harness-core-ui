/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Dialog,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Layout
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'

import ServiceDetailInstanceView, { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'
import PostProdRollbackDrawer from './PostProdRollback/ServiceDetailPostProdRollback'
import ServiceDetailsEnvTable from './ServiceDetailsEnvTable'
import ServiceDetailsArtifactTable from './ServiceDetailsArtifactTable'
import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsDialogProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  isEnvView: boolean
  envFilter?: {
    envId?: string
    isEnvGroup: boolean
    envName?: string
    isRollbackAllowed?: boolean
  }
  artifactFilter?: string
  artifactFilterApplied?: boolean
}

export default function ServiceDetailsDialog(props: ServiceDetailsDialogProps): React.ReactElement {
  const { isOpen, setIsOpen, envFilter, artifactFilter, isEnvView, artifactFilterApplied } = props
  const { getString } = useStrings()
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isSearchApplied = useRef<boolean>(!isEmpty(searchTerm))
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [rowClickFilter, setRowClickFilter] = useState<ServiceDetailInstanceViewProps>({
    artifact: '',
    envId: '',
    environmentType: 'PreProduction',
    envName: ''
  })

  const onSearch = useCallback(
    /* istanbul ignore next */ (val: string) => {
      setSearchTerm(val.trim())
      isSearchApplied.current = !isEmpty(val.trim())
    },
    []
  )

  const resetSearch = /* istanbul ignore next */ (): void => {
    searchRef.current.clear()
  }

  const resetDialogState = useCallback(() => {
    setRowClickFilter({
      artifact: '',
      envId: '',
      environmentType: 'PreProduction',
      envName: ''
    })
    setSearchTerm('')
  }, [])

  const rollbackAllowed = envFilter?.isRollbackAllowed
  if (drawerOpen && envFilter?.envId && rollbackAllowed) {
    return (
      <PostProdRollbackDrawer
        drawerOpen={drawerOpen}
        isEnvGroup={!!envFilter?.isEnvGroup}
        setDrawerOpen={setDrawerOpen}
        entityId={envFilter?.envId}
        entityName={envFilter?.envName}
      />
    )
  }

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        resetDialogState()
      }}
      enforceFocus={false}
    >
      <div className={css.dialogWrap}>
        <Container className={css.detailSummaryView}>
          <Layout.Horizontal className={cx(css.searchWithRollbackBtn, { [css.noRollbackBtn]: !rollbackAllowed })}>
            <ExpandingSearchInput
              placeholder={getString('search')}
              throttle={200}
              onChange={onSearch}
              className={css.searchIconStyle}
              alwaysExpanded
              ref={searchRef}
            />
            {rollbackAllowed ? (
              <Button
                variation={ButtonVariation.SECONDARY}
                size={ButtonSize.MEDIUM}
                text={getString('rollbackLabel')}
                icon="rollback-service"
                onClick={() => {
                  setDrawerOpen(true)
                  setIsOpen(false)
                }}
                iconProps={{ size: 13, color: Color.PRIMARY_7 }}
              />
            ) : null}
          </Layout.Horizontal>
          {isEnvView ? (
            <ServiceDetailsEnvTable
              envFilter={envFilter}
              searchTerm={searchTerm}
              resetSearch={resetSearch}
              setRowClickFilter={setRowClickFilter}
            />
          ) : (
            <ServiceDetailsArtifactTable
              artifactFilter={artifactFilter}
              envFilter={envFilter}
              searchTerm={searchTerm}
              resetSearch={resetSearch}
              setRowClickFilter={setRowClickFilter}
              artifactFilterApplied={artifactFilterApplied}
            />
          )}
        </Container>
        <ServiceDetailInstanceView
          artifact={rowClickFilter.artifact}
          envName={rowClickFilter.envName}
          envId={rowClickFilter.envId}
          environmentType={rowClickFilter.environmentType}
          infraName={rowClickFilter.infraName}
          clusterIdentifier={rowClickFilter.clusterIdentifier}
          infraIdentifier={rowClickFilter.infraIdentifier}
        />
      </div>
    </Dialog>
  )
}
