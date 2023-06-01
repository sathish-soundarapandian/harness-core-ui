/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { Container, Dialog, ExpandingSearchInput, ExpandingSearchInputHandle, OverlaySpinner } from '@harness/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'

import ServiceDetailInstanceView, { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'
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
  }
  artifactFilter?: string
  artifactFilterApplied?: boolean
}

export default function ServiceDetailsDialog(props: ServiceDetailsDialogProps): React.ReactElement {
  const { isOpen, setIsOpen, envFilter, artifactFilter, isEnvView, artifactFilterApplied } = props
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const isSearchApplied = useRef<boolean>(!isEmpty(searchTerm))
  const [rollbacking, setRollbacking] = useState<boolean>(false)
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [rowClickFilter, setRowClickFilter] = useState<ServiceDetailInstanceViewProps>({
    artifact: '',
    envId: '',
    environmentType: 'PreProduction',
    envName: '',
    isEnvView
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
      envName: '',
      isEnvView
    })
    setSearchTerm('')
  }, [])

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        resetDialogState()
      }}
      enforceFocus={false}
      canEscapeKeyClose={!rollbacking}
      canOutsideClickClose={!rollbacking}
    >
      <OverlaySpinner show={rollbacking}>
        <div className={css.dialogWrap}>
          <Container className={css.detailSummaryView}>
            <ExpandingSearchInput
              placeholder={getString('search')}
              throttle={200}
              onChange={onSearch}
              className={css.searchIconStyle}
              alwaysExpanded
              ref={searchRef}
            />
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
            isEnvView={isEnvView}
            closeDailog={() => {
              setIsOpen(false)
              resetDialogState()
            }}
            setRollbacking={setRollbacking}
          />
        </div>
      </OverlaySpinner>
    </Dialog>
  )
}
