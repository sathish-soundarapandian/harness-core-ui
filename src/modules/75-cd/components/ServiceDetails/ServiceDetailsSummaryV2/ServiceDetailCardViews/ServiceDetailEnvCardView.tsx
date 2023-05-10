/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { capitalize, defaultTo, isEmpty, isUndefined } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { Card, Container, Icon, Text } from '@harness/uicore'
import { Popover, Position } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import { String, useStrings } from 'framework/strings'
import { useServiceContext } from '@cd/context/ServiceContext'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { NGServiceConfig } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { supportedDeploymentTypesForPostProdRollback } from '../PostProdRollback/PostProdRollbackUtil'
import { EnvCardComponentProps, getLatestTimeAndArtifact } from '../ServiceDetailUtils'
import ServiceDetailDriftTable from '../ServiceDetailDriftTable'
import PostProdRollbackDrawer from '../PostProdRollback/ServiceDetailPostProdRollback'

import css from '../ServiceDetailsSummaryV2.module.scss'

export function EnvCard({
  setSelectedEnv,
  setEnvId,
  setIsDetailsDialogOpen,
  setEnvFilter,
  env,
  selectedEnv
}: EnvCardComponentProps): JSX.Element | null {
  const { getString } = useStrings()
  const envName = env?.name
  const envId = env?.id
  const artifactDeploymentDetails = env?.artifactDeploymentDetails
  const { lastDeployedAt: latestTime, artifact: artifactName } = getLatestTimeAndArtifact(artifactDeploymentDetails)
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)

  //serviceType
  const { serviceResponse } = useServiceContext()
  const serviceDataParse = React.useMemo(
    () => yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, '')),
    [serviceResponse?.yaml]
  )
  const serviceType = serviceDataParse?.service?.serviceDefinition?.type

  // Allow rollback action or not
  const showRollbackAction =
    useFeatureFlag(FeatureFlag.POST_PROD_ROLLBACK) &&
    serviceType &&
    supportedDeploymentTypesForPostProdRollback.includes(serviceType)

  const deploymentText = env?.isRollback
    ? getString('cd.serviceDashboard.rollbacked')
    : env?.isRevert
    ? getString('cd.serviceDashboard.hotfixed')
    : ''

  const isDrift = env?.isDrift
  const isEnvGroup = env?.isEnvGroup

  const envGroupEnvIds = isEnvGroup
    ? (defaultTo(artifactDeploymentDetails?.map(envValue => envValue.envId)?.filter(Boolean), []) as string[])
    : []

  /* istanbul ignore next */
  if (isUndefined(envId)) {
    return null
  }
  return (
    <>
      <Card
        className={cx(css.envCards, css.cursor)}
        onClick={() => {
          if (selectedEnv?.envId === envId) {
            setSelectedEnv(undefined)
            setEnvId(undefined)
          } else {
            setSelectedEnv({ envId: envId, isEnvGroup: !!isEnvGroup })
            setEnvId(isEnvGroup ? envGroupEnvIds : envId)
          }
        }}
        selected={selectedEnv?.envId === envId}
      >
        {isEnvGroup && <String tagName="div" className={css.headerTile} stringID="cd.serviceDashboard.envGroupTitle" />}
        <div className={css.envCardTitle}>
          <Text
            font={{ variation: FontVariation.FORM_SUB_SECTION }}
            color={Color.GREY_600}
            lineClamp={1}
            tooltipProps={{ isDark: true }}
          >
            {!isEmpty(envName) ? envName : '--'}
          </Text>
        </div>
        <div>
          {env?.environmentTypes?.map((item, index) => (
            <Text
              key={index}
              className={cx(css.environmentType, {
                [css.production]: item === EnvironmentType.PRODUCTION
              })}
              font={{ size: 'small' }}
              margin={{ right: 'small' }}
            >
              {item
                ? getString(item === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')
                : '-'}
            </Text>
          ))}
        </div>
        {!!(latestTime && latestTime !== Number.MIN_SAFE_INTEGER) && (
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} className={css.lastDeployedText}>
            {deploymentText ? (
              <String
                useRichText
                stringID="cd.serviceDashboard.lastDeployedText"
                vars={{
                  status: deploymentText
                }}
              />
            ) : (
              getString('pipeline.lastDeployed')
            )}
            <ReactTimeago date={latestTime} />
          </Text>
        )}
        {env?.count && (
          <div className={css.instanceCountStyle}>
            <Icon name="instances" color={Color.GREY_600} />
            <Text
              onClick={e => {
                e.stopPropagation()
                setEnvFilter({
                  envId: env.id,
                  isEnvGroup: !!env.isEnvGroup,
                  envName: env.name,
                  isRollbackAllowed: showRollbackAction
                })
                setIsDetailsDialogOpen(true)
              }}
              color={Color.PRIMARY_7}
              font={{ variation: FontVariation.TINY_SEMI }}
            >
              {env.count} {capitalize(getString('pipeline.execution.instances'))}
            </Text>
          </div>
        )}
        <Container flex>
          <Popover
            interactionKind="hover"
            content={<ServiceDetailDriftTable data={defaultTo(artifactDeploymentDetails, [])} isArtifactView={false} />}
            disabled={!isDrift}
            popoverClassName={css.driftPopover}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { escapeWithReference: true } }}
          >
            <Container flex={{ alignItems: 'center' }}>
              {isDrift && <Icon name="execution-warning" color={Color.RED_700} />}
              <Text
                font={{ variation: FontVariation.CARD_TITLE, weight: 'semi-bold' }}
                color={isDrift ? Color.RED_700 : Color.GREY_800}
                lineClamp={1}
                margin={{ left: 'small' }}
                tooltipProps={{ isDark: true, disabled: isDrift }}
              >
                {artifactName || '-'}
              </Text>
            </Container>
          </Popover>
          {showRollbackAction ? (
            <Container className={css.rollbackActionIcon}>
              <Icon
                name="rollback-service"
                color={Color.GREY_700}
                size={14}
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                }}
              />
            </Container>
          ) : null}
        </Container>
      </Card>
      {drawerOpen && envId ? (
        <PostProdRollbackDrawer
          drawerOpen={drawerOpen}
          isEnvGroup={!!isEnvGroup}
          setDrawerOpen={setDrawerOpen}
          entityId={envId}
          entityName={envName}
        />
      ) : null}
    </>
  )
}
