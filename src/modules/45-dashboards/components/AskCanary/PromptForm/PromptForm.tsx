/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Container, useToaster } from '@harness/uicore'
import { useDashboardPrompt } from 'services/custom-dashboards'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import PromptInput from './PromptInput/PromptInput'

const PromptForm: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { mutate: sendPrompt } = useDashboardPrompt({ queryParams: { accountId: accountId } })

  const handleSubmitPrompt = async (prompt: string): Promise<void> => {
    try {
      const { dashboard_id } = await sendPrompt({ prompt })
      showSuccess(getString('dashboards.createModal.success'))
      history.push({
        pathname: routes.toViewCustomDashboard({
          viewId: dashboard_id,
          accountId: accountId,
          folderId: 'shared'
        })
      })
    } catch (e) {
      showError(e?.data?.responseMessages || getString('dashboards.createModal.submitFail'))
    }
  }

  return (
    <Container className={css.container}>
      <PromptInput onSubmitPrompt={handleSubmitPrompt} />
    </Container>
  )
}

export default PromptForm
