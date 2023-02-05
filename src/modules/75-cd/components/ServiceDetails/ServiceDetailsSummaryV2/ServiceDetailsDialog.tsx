/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Dialog, ExpandingSearchInput, ExpandingSearchInputHandle } from '@harness/uicore'
import React, { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'

import ServiceDetailInstanceView, { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'
import ServiceDetailsEnvTable from './ServiceDetailsEnvTable'
import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsDialogProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  envFilter?: string
}

export default function ServiceDetailsDialog(props: ServiceDetailsDialogProps): React.ReactElement {
  const { isOpen, setIsOpen, envFilter } = props
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const isSearchApplied = useRef<boolean>(!isEmpty(searchTerm))
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [rowClickFilter, setRowClickFilter] = useState<ServiceDetailInstanceViewProps>({
    artifact: '',
    envId: '',
    environmentType: 'PreProduction',
    envName: ''
  })

  const onSearch = useCallback((val: string) => /* istanbul ignore next */ {
    setSearchTerm(val.trim())
    isSearchApplied.current = !isEmpty(val.trim())
  }, [])

  const resetSearch = (): void => /* istanbul ignore next */ {
    searchRef.current.clear()
  }

  return (
    <Dialog
      className={cx('padded-dialog', css.dialogBase)}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        setRowClickFilter({ artifact: '', envId: '', environmentType: 'PreProduction', envName: '' })
      }}
      enforceFocus={false}
    >
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
          <ServiceDetailsEnvTable
            envFilter={envFilter}
            searchTerm={searchTerm}
            resetSearch={resetSearch}
            setRowClickFilter={setRowClickFilter}
          />
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
