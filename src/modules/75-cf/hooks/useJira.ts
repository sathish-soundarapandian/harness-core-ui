/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

export interface UseJiraPayload {
  urlJiraIssueKey: string
}
const useJira = (): UseJiraPayload => {
  const { search } = useLocation()
  const urlJiraIssueKey = useMemo<string>(() => new URLSearchParams(search).get('jiraIssueKey') || '', [search])

  return {
    urlJiraIssueKey
  }
}

export default useJira
