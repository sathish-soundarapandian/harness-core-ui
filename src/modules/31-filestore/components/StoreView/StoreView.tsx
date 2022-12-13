/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useContext } from 'react'
import { Container, PageSpinner } from '@harness/uicore'
import EmptyNodeView from '@filestore/components/EmptyNodeView/EmptyNodeView'
import { useStrings } from 'framework/strings'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FILE_VIEW_TAB, FileStoreNodeTypes } from '@filestore/interfaces/FileStore'
import NodesList from '@filestore/components/NodesList/NodesList'
import FileView from '@filestore/components/FileView/FileView'
import CurrentPathComponent from '@filestore/components/CurrentPathComponent/CurrentPathComponent'
import css from './StoreView.module.scss'

export default function StoreView(): React.ReactElement {
  const { getString } = useStrings()
  const { currentNode, loading, isModalView, activeTab, setActiveTab } = useContext(FileStoreContext)

  React.useEffect(() => {
    if (activeTab === FILE_VIEW_TAB.DETAILS) {
      return
    }
    setActiveTab(FILE_VIEW_TAB.DETAILS)
  }, [currentNode])

  if (loading) {
    return <PageSpinner />
  }

  if (currentNode?.type === FileStoreNodeTypes.FOLDER && !currentNode?.children?.length) {
    return (
      <Container style={{ width: '100%' }}>
        <EmptyNodeView title={getString('filestore.noFilesInFolderTitle')} />
      </Container>
    )
  }

  return (
    <Container className={css.storeView} height={!isModalView ? 'calc(100vh - 75px)' : 'calc(50vh - 70px)'}>
      <CurrentPathComponent />
      {currentNode?.type === FileStoreNodeTypes.FOLDER ? <NodesList /> : <FileView />}
    </Container>
  )
}
