/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Icon, Layout, Tag, TagsPopover, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import React from 'react'
import type { ClusterFromGitops } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from './AddCluster.module.scss'

interface ClusterCardProps {
  cluster: ClusterFromGitops
  setSelectedClusters: (arr: ClusterFromGitops[]) => void
  selectedClusters: ClusterFromGitops[]
}

const ClusterCard = (props: ClusterCardProps): React.ReactElement => {
  const { cluster, selectedClusters } = props
  const { getString } = useStrings()
  const isClusterAlreadySelected = selectedClusters.find(
    (clstr: ClusterFromGitops) =>
      clstr.identifier === cluster.identifier && clstr.agentIdentifier === cluster.agentIdentifier
  )
  return (
    <div
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        e.stopPropagation()
        if (!isClusterAlreadySelected) {
          props.setSelectedClusters([...selectedClusters, cluster])
        } else {
          const clustrs = []
          for (const selClstr of selectedClusters) {
            if (cluster.identifier !== selClstr.identifier || cluster.agentIdentifier !== selClstr.agentIdentifier) {
              clustrs.push(selClstr)
            }
          }
          props.setSelectedClusters([...clustrs])
        }
      }}
      className={cx(css.gitopsClusterCard, {
        [css.selected]: isClusterAlreadySelected
      })}
      data-cy="cluster-card"
    >
      <div className={css.clusterCardRightSide}>
        <Icon name="gitops-clusters" />
        <Layout.Vertical
          flex={{ justifyContent: 'flex-start' }}
          spacing="small"
          margin={{ bottom: 'small' }}
          style={{ alignItems: 'unset' }}
        >
          <Layout.Horizontal margin={{ left: 'small' }} className={css.clusterTitle}>
            <Text data-id="cluster-id-label" lineClamp={1} color={Color.BLACK} className={css.clusterName} width={125}>
              {defaultTo(cluster.name, '')}
            </Text>
            {!isEmpty(cluster.tags) && cluster.tags ? (
              <TagsPopover
                className={css.tagsPopover}
                iconProps={{ size: 14, color: Color.GREY_600 }}
                tags={cluster.tags}
              />
            ) : null}
          </Layout.Horizontal>
          <Text
            data-id="cluster-id-text"
            lineClamp={1}
            font={{ variation: FontVariation.FORM_LABEL }}
            color={Color.GREY_400}
            className={css.clusterId}
            margin={{ left: 'small' }}
            width={150}
          >
            {getString('common.ID')}: {cluster.identifier}
          </Text>
          <Text
            data-id="cluster-agent-id-text"
            lineClamp={1}
            font={{ variation: FontVariation.FORM_LABEL }}
            color={Color.GREY_400}
            className={css.clusterId}
            margin={{ left: 'small' }}
            width={150}
          >
            {getString('cd.agentID')}: {cluster.agentIdentifier}
          </Text>
        </Layout.Vertical>
      </div>
      <Tag minimal className={css.tag}>
        {cluster.scopeLevel}
      </Tag>
    </div>
  )
}

export default ClusterCard
