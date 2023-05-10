/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty, isUndefined } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { Card, Container, Icon, Layout, Text } from '@harness/uicore'
import { Popover, Position } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/strings'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { ArtifactCardProps, getLatestTimeAndArtifact } from '../ServiceDetailUtils'
import ServiceDetailDriftTable from '../ServiceDetailDriftTable'

import css from '../ServiceDetailsSummaryV2.module.scss'

export function ArtifactCard({
  setArtifactName,
  setSelectedArtifact,
  setIsDetailsDialogOpen,
  setEnvFilter,
  setArtifactFilter,
  artifact,
  selectedArtifact,
  setArtifactFilterApplied
}: ArtifactCardProps): JSX.Element | null {
  const artifactName = artifact?.artifact
  const { getString } = useStrings()
  const envList = defaultTo(artifact?.environmentGroupInstanceDetails.environmentGroupInstanceDetails, [])

  if (isUndefined(artifactName) && !envList.length) {
    return null
  }

  return (
    <Card
      className={cx(css.artifactCards, css.cursor)}
      onClick={() => {
        if (selectedArtifact === artifactName) {
          setSelectedArtifact(undefined)
          setArtifactName(undefined)
        } else {
          setSelectedArtifact(artifactName)
          setArtifactName(artifactName)
        }
      }}
      selected={selectedArtifact === artifactName}
    >
      <Text
        font={{ variation: FontVariation.H5 }}
        color={Color.GREY_600}
        lineClamp={1}
        className={css.hoverUnderline}
        tooltipProps={{ isDark: true }}
        onClick={
          /* istanbul ignore next */ e => {
            e.stopPropagation()
            setArtifactFilter(artifactName)
            setEnvFilter({ envId: undefined, isEnvGroup: false })
            setArtifactFilterApplied?.(true)
            setIsDetailsDialogOpen(true)
          }
        }
      >
        {!isEmpty(artifactName) ? artifactName : '--'}
      </Text>
      <div className={css.artifactViewEnvList}>
        {envList.map((envInfo, idx) => {
          const { lastDeployedAt: latestTime } = getLatestTimeAndArtifact(envInfo?.artifactDeploymentDetails)
          const isDrift = envInfo?.isDrift
          const isEnvGroup = envInfo?.isEnvGroup
          return (
            <Layout.Horizontal key={`${envInfo.id}_${idx}`} className={css.artifactViewEnvDetail}>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Popover
                  interactionKind="hover"
                  content={
                    <ServiceDetailDriftTable
                      data={defaultTo(envInfo.artifactDeploymentDetails, [])}
                      isArtifactView={true}
                      artifactName={artifactName}
                    />
                  }
                  disabled={!isDrift}
                  popoverClassName={css.driftPopover}
                  position={Position.TOP}
                  modifiers={{ preventOverflow: { escapeWithReference: true } }}
                >
                  <Container flex>
                    <Text
                      font={{ variation: FontVariation.BODY2 }}
                      color={isDrift ? Color.RED_700 : Color.GREY_600}
                      lineClamp={1}
                      padding={{ right: 'small' }}
                      tooltipProps={{ isDark: true, disabled: isDrift }}
                      className={css.hoverUnderline}
                      onClick={
                        /* istanbul ignore next */ e => {
                          e.stopPropagation()
                          setEnvFilter({ envId: envInfo.id, isEnvGroup: !!envInfo.isEnvGroup })
                          setArtifactFilter(artifactName)
                          setArtifactFilterApplied?.(true)
                          setIsDetailsDialogOpen(true)
                        }
                      }
                    >
                      {!isEmpty(envInfo.name) ? envInfo.name : '--'}
                    </Text>
                    {isDrift && <Icon name="execution-warning" color={Color.RED_700} padding={{ right: 'small' }} />}
                  </Container>
                </Popover>
                <Container flex>
                  {envInfo?.environmentTypes?.map((item, index) => (
                    <Text
                      key={index}
                      className={cx(css.environmentType, {
                        [css.production]: item === EnvironmentType.PRODUCTION
                      })}
                      font={{ size: 'small' }}
                      height={16}
                      margin={{ right: 'small' }}
                    >
                      {item
                        ? getString(
                            item === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType'
                          )
                        : '-'}
                    </Text>
                  ))}
                </Container>
                {isEnvGroup && (
                  <Text
                    font={{ variation: FontVariation.TINY_SEMI }}
                    color={Color.PRIMARY_9}
                    width={45}
                    height={18}
                    border={{ radius: 2, color: '#CDF4FE' }}
                    id="groupLabel"
                    background={Color.PRIMARY_1}
                    flex={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    {getString('pipeline.verification.tableHeaders.group')}
                  </Text>
                )}
              </Layout.Horizontal>
              {!!(latestTime && latestTime !== Number.MIN_SAFE_INTEGER) && (
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
                  <ReactTimeago date={latestTime} />
                </Text>
              )}
            </Layout.Horizontal>
          )
        })}
      </div>
    </Card>
  )
}
