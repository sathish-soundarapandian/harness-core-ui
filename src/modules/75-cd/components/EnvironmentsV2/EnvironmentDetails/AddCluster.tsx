/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Checkbox,
  Color,
  Dialog,
  FontVariation,
  Icon,
  Layout,
  Text,
  TextInput
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import ClusterList from './ClusterList'
import clusters from './clusters.json'
import css from './AddCluster.module.scss'

const AddCluster = (props: any): React.ReactElement => {
  const [selectedClusters, setSelectedClusters] = React.useState<any>([])
  const { getString } = useStrings()
  return (
    <Dialog
      isOpen
      style={{
        width: 648,
        height: 551,
        borderLeft: 0,
        padding: 24,
        position: 'relative',
        overflow: 'auto'
      }}
      enforceFocus={false}
      usePortal
      canOutsideClickClose={false}
      onClose={props.onCancel}
      isCloseButtonShown={true}
    >
      <div className={css.addClusterDialog}>
        <Layout.Vertical spacing="xsmall" padding="medium">
          <Text font={{ variation: FontVariation.H4 }} color={Color.BLACK}>
            {getString('cd.selectGitopsCluster')}
          </Text>
        </Layout.Vertical>
        <Layout.Vertical>
          <TextInput placeholder="Search" leftIcon="search" />
          <Layout.Horizontal className={css.contentContainer} height={'339px'}>
            <div className={css.agentList}>
              <ClusterList setSelectedClusters={setSelectedClusters} selectedClusters={selectedClusters} />
              <div>
                <Checkbox
                  label="Select All"
                  onClick={ev => {
                    if (ev.currentTarget.checked) {
                      setSelectedClusters(clusters.content)
                    } else {
                      setSelectedClusters([])
                    }
                  }}
                />
                {selectedClusters.length ? (
                  <span>
                    ({selectedClusters.length}/{clusters.content.length})
                  </span>
                ) : (
                  <span>({clusters.content.length})</span>
                )}
              </div>
            </div>

            <div className={css.subChild}>
              <div className={css.gitOpsSelectedClusters}>
                <Icon name="gitops-clusters" />
                <Text color={Color.GREY_800} className={css.selectedClusters}>
                  {getString('cd.clustersSelected')}({selectedClusters.length})
                </Text>
              </div>
              <div className={css.separator}></div>
              <Layout.Vertical>
                {selectedClusters?.length ? (
                  <>
                    <Text className={css.selectedHeader} color={Color.GREY_800}>
                      Selected
                    </Text>
                    {selectedClusters.map((clstr: any) => {
                      return (
                        <Text
                          key={clstr.identifier}
                          style={{ fontSize: '12' }}
                          color={Color.GREY_800}
                          className={css.selectedIdenfitier}
                        >
                          {clstr.cluster.name}
                        </Text>
                      )
                    })}
                  </>
                ) : null}
              </Layout.Vertical>
            </div>
          </Layout.Horizontal>
        </Layout.Vertical>

        <Layout.Horizontal className={css.footerStyle}>
          <Button variation={ButtonVariation.PRIMARY} text="Add" />
          <Button text="Cancel" variation={ButtonVariation.TERTIARY} />
        </Layout.Horizontal>
      </div>
    </Dialog>
  )
}

export default AddCluster
