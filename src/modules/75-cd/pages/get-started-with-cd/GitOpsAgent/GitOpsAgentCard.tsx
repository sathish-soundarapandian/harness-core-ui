/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { capitalize, defaultTo, isEmpty } from 'lodash-es'
import { Card, Text, Container, TagsPopover, Icon, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { V1Agent } from 'services/gitops'
import { AgentInfo } from './AgentInfo'
import ConnectionStatusBadge from './ConnectionStatusBadge/ConnectionStatusBadge'
import HealthStatusBadge from './HealthStatusBadge/HealthStatusBadge'
import css from './GitOpsAgentCard.module.scss'

interface GitOpsAgentCardProps {
  agent: V1Agent
  selectedAgent?: V1Agent
  setSelectedAgent: (agent: V1Agent) => void
}

export const GitOpsAgentCard: React.FC<GitOpsAgentCardProps> = props => {
  const { agent, selectedAgent, setSelectedAgent } = props
  const { getString } = useStrings()

  return (
    <Card
      className={cx(css.card, { [css.isSelected]: agent === selectedAgent })}
      onClick={() => setSelectedAgent(agent)}
    >
      <Container className={css.projectInfo}>
        <div className={css.mainTitle}>{<Icon name="harness" size={22} />}</div>

        <Text
          lineClamp={2}
          margin={{ top: 'medium', bottom: 'small' }}
          color={Color.GREY_800}
          data-testid={agent.identifier}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '32px',
            wordBreak: 'break-word'
          }}
        >
          {agent.name}
        </Text>
        <Text lineClamp={1} font="small" color={Color.GREY_600} margin={{ top: 'xsmall' }}>
          {getString('idLabel', { id: agent.identifier })}
        </Text>
        <Layout.Horizontal>
          {!isEmpty(agent.tags) && (
            <div className={css.tags}>
              <TagsPopover
                className={css.tagsPopover}
                iconProps={{ size: 14, color: Color.GREY_600 }}
                tags={defaultTo(agent.tags, {})}
              />
            </div>
          )}
          {!isEmpty(agent.description) && (
            <Container padding="medium">
              <Layout.Vertical>
                <Text className={css.descriptionTitle}>{getString('description')}</Text>
                <Text>{agent.description}</Text>
              </Layout.Vertical>
            </Container>
          )}
        </Layout.Horizontal>
        <AgentInfo agent={agent} />
        <div className={css.gitOpsStatusContainer} id="connectionStatus">
          <Layout.Horizontal>
            <div className={css.connectionStatus}>
              <Text font="xsmall" color={Color.GREY_500} padding={{ bottom: 'small' }}>
                {getString('cd.getStartedWithCD.connectionStatus')}
              </Text>

              <ConnectionStatusBadge status={agent.health?.connectionStatus} />
            </div>
            <div className={cx(css.healthStatus, css.healthStatusPadding)} id="healthStatus">
              <Text font="xsmall" color={Color.GREY_500} padding={{ bottom: 'small' }}>
                {getString('cd.getStartedWithCD.healthStatusLabel')}
              </Text>
              <>{<HealthStatusBadge status={capitalize(agent.health?.harnessGitopsAgent?.status)} />}</>
            </div>
          </Layout.Horizontal>
        </div>
      </Container>
    </Card>
  )
}

export default GitOpsAgentCard
