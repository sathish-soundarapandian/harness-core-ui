/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Container, Heading, Layout, PageSpinner, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useDashboardPrompt } from 'services/custom-dashboards'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import ExamplePrompt from './ExamplePrompt/ExamplePrompt'
import PromptInput from './PromptInput/PromptInput'
import css from './PromptForm.module.scss'

const prompt1 = `1. Single value visualization showing total cost for the past 30 days.\n2. Pie chart showing the top ten most expensive costs by project\n3. Grid visualization showing top trending products with a 10% variation`
const prompt2 = `A line chart showing costs for the past 30 days per day and forecasting cost 60 days per day`
const prompt3 = `1. Top 5 services with highest deployment Frequency\n2. Top projects with least MTTR`
const prompt4 = `Top 10 projects with most security vulnerabilities as per the OWASP 10 standards`
const prompt5 = `1. Feature Flag activations over the last 30 days\n2. Count of the total stale feature flags`
const prompt6 = `1. Build Metrics over time per repository\n2. Test Failures per project`

const PromptForm: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { mutate: sendPrompt, loading } = useDashboardPrompt({ queryParams: { accountId: accountId } })
  const [prompt, setPrompt] = React.useState<string>('')

  const handleExampleClicked = (examplePrompt: string): void => {
    setPrompt(examplePrompt)
    handleSubmitPrompt(examplePrompt)
  }

  const handleSubmitPrompt = async (submittedPrompt: string): Promise<void> => {
    try {
      const { dashboard_id } = await sendPrompt({ prompt: submittedPrompt })
      showSuccess(getString('dashboards.createModal.success'))
      history.push({
        pathname: routes.toViewCustomDashboard({
          viewId: dashboard_id,
          accountId: accountId,
          folderId: 'shared'
        })
      })
      setPrompt('')
    } catch (e) {
      showError(e?.data?.responseMessages || getString('dashboards.createModal.submitFail'))
    }
  }

  return (
    <Container className={css.container} padding={'medium'}>
      {loading && <PageSpinner />}
      <Layout.Vertical spacing={'medium'}>
        <Heading level={4} color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
          Edit a Dashboard
        </Heading>
        <Text font={{ variation: FontVariation.BODY }}>Tell us in a few words what do you want to add</Text>
        <PromptInput onSubmitPrompt={() => handleSubmitPrompt(prompt)} prompt={prompt} setPrompt={setPrompt} />
        <Text font={{ variation: FontVariation.BODY }}>or try these examples</Text>
        <Layout.Vertical spacing={'medium'}>
          <Layout.Horizontal spacing={'medium'}>
            <ExamplePrompt minHeight={155} prompt={prompt1} setPrompt={handleExampleClicked} />
            <ExamplePrompt minHeight={155} prompt={prompt2} setPrompt={handleExampleClicked} />
          </Layout.Horizontal>
          <Layout.Horizontal spacing={'medium'}>
            <ExamplePrompt minHeight={70} prompt={prompt3} setPrompt={handleExampleClicked} />
            <ExamplePrompt minHeight={70} prompt={prompt4} setPrompt={handleExampleClicked} />
          </Layout.Horizontal>
          <Layout.Horizontal spacing={'medium'}>
            <ExamplePrompt minHeight={90} prompt={prompt5} setPrompt={handleExampleClicked} />
            <ExamplePrompt minHeight={90} prompt={prompt6} setPrompt={handleExampleClicked} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

export default PromptForm
