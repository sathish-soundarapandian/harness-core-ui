/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import {
  Button,
  ButtonVariation,
  Checkbox,
  Color,
  Dialog,
  FontVariation,
  Icon,
  Layout,
  PageSpinner,
  Text,
  TextInput,
  useToaster
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Cluster, useCreateClusters, useGetClusterListFromSource } from 'services/cd-ng'

import ClusterList from './ClusterList'
import css from './AddCluster.module.scss'

const getUnlinkedClusters = (clusters: any, linkedClusters: any[]): any[] => {
  if (!linkedClusters || !clusters) {
    return []
  }
  const unlinkedClusters = []
  for (const clstr of clusters) {
    const clstrObj = linkedClusters.find(obj => obj.clusterRef === clstr.identifier)
    if (!clstrObj) {
      unlinkedClusters.push(clstr)
    }
  }
  return unlinkedClusters
}

const AddCluster = (props: any): React.ReactElement => {
  const [selectedClusters, setSelectedClusters] = React.useState<any>([])
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [submitting, setSubmitting] = React.useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { data, loading, error, refetch } = useGetClusterListFromSource({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: 0,
      size: 50
    }
  })

  const unlinkedClusters = getUnlinkedClusters(data?.data?.content, props?.linkedClusters)

  const { mutate: createCluster } = useCreateClusters({
    queryParams: { accountIdentifier: accountId }
  })

  const onSubmit = (): void => {
    if (selectedClusters && selectedClusters.length) {
      setSubmitting(true)
      const payload = {
        envRef: props.envRef,
        clusters: selectedClusters.map((clstr: any) => ({
          identifier: clstr.identifier,
          name: clstr?.name
        })),
        orgIdentifier,
        projectIdentifier,
        accountId
      }

      createCluster(payload, { queryParams: { accountIdentifier: accountId } })
        .then(() => {
          showSuccess('Successfully linked')
          props?.onHide()
          setSubmitting(false)
          props?.refetch()
        })
        .catch(err => {
          showError(err?.message)
          setSubmitting(false)
        })
    } else {
      alert('select clusters')
    }
  }

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
      onClose={props.onHide}
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
            <div className={css.clusterList}>
              {loading || submitting ? <PageSpinner /> : null}
              {!loading ? (
                <ClusterList
                  setSelectedClusters={setSelectedClusters}
                  selectedClusters={selectedClusters}
                  clusters={unlinkedClusters}
                  loading={loading}
                  error={error}
                  refetch={refetch}
                />
              ) : null}
              <Layout.Horizontal color={Color.GREY_700} className={css.listFooter}>
                <Checkbox
                  label="Select All"
                  onClick={ev => {
                    if (ev.currentTarget.checked) {
                      setSelectedClusters(unlinkedClusters)
                    } else {
                      setSelectedClusters([])
                    }
                  }}
                  className={css.checkBox}
                />
                {selectedClusters.length ? (
                  <span className={css.unlinkedCount}>
                    ({selectedClusters.length}/{unlinkedClusters?.length})
                  </span>
                ) : (
                  <span className={css.unlinkedCount}>({unlinkedClusters.length})</span>
                )}
              </Layout.Horizontal>
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
                    {selectedClusters.map((clstr: Cluster, index: number) => {
                      if (index < 10) {
                        return (
                          <Text
                            key={clstr.identifier}
                            style={{ fontSize: '12' }}
                            color={Color.GREY_800}
                            className={css.selectedIdenfitier}
                          >
                            {clstr?.identifier}
                          </Text>
                        )
                      }
                    })}
                    {selectedClusters.length > 10 ? <div>...</div> : null}
                  </>
                ) : null}
              </Layout.Vertical>
            </div>
          </Layout.Horizontal>
        </Layout.Vertical>

        <Layout.Horizontal className={css.footerStyle}>
          <Button variation={ButtonVariation.PRIMARY} text="Add" onClick={onSubmit} />
          <Button text="Cancel" variation={ButtonVariation.TERTIARY} onClick={props.onHide} />
        </Layout.Horizontal>
      </div>
    </Dialog>
  )
}

export default AddCluster
