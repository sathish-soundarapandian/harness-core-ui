/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { FC } from 'react'
import { useStrings } from 'framework/strings'
import type { JiraIssue } from 'services/cf'

export interface JiraIssueListProps {
  jiraIssues?: JiraIssue[]
}

const FlagJiraIssues: FC<JiraIssueListProps> = ({ jiraIssues = [] }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      <div>
        <Heading level={5} font={{ variation: FontVariation.H5 }}>
          {getString('cf.featureFlagDetail.jiraIssuesTitle')}
        </Heading>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
          {getString('cf.featureFlagDetail.jiraIssuesDescription')}
        </Text>
      </div>

      {jiraIssues.map(issue => (
        <a key={issue.issueKey} href={issue.issueURL} target="_blank" rel="noreferrer noopener">
          {issue.issueKey}
        </a>
      ))}
    </Layout.Vertical>
  )
}

export default FlagJiraIssues
