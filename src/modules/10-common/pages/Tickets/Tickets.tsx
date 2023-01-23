/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Container, FormInput, Layout, PageError, PageSpinner, Text } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
// eslint-disable-next-line no-restricted-imports
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGetAccountNG } from 'services/cd-ng'
// eslint-disable-next-line no-restricted-imports
import type { JiraProjectSelectOption } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/types'
// eslint-disable-next-line no-restricted-imports
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeCheckboxField } from '@common/components'
// eslint-disable-next-line no-restricted-imports
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './Tickets.module.scss'

const Tickets: React.FC = () => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [projectOptions] = useState<JiraProjectSelectOption[]>([])

  const {
    loading,
    refetch: refetchAcct,
    error
  } = useGetAccountNG({ accountIdentifier: accountId, queryParams: { accountIdentifier: accountId } })

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <Container height={300}>
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetchAcct()} />
      </Container>
    )
  }

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.jira.tickets')}
      </Text>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.jira.connector')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormMultiTypeConnectorField
            name="connector"
            label={''}
            width={'100%'}
            className={css.connector}
            connectorLabelClass={css.connectorLabel}
            placeholder={getString('common.jira.selectConnector')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ expressions }}
            type="Jira"
            enableConfigureOptions={false}
            selected=""
            disabled={false}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
            onChange={() => {
              updateTicketSettings()
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.jira.defaultProjectName')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            selectItems={projectOptions}
            label={''}
            name="defaultProjectName"
            placeholder={getString('common.jira.selectProjectName')}
            disabled={false}
            isOptional={false}
            multiTypeInputProps={{
              onChange: () => {
                updateTicketSettings()
              }
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.jira.ticketComment')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            disabled={true}
            name={''}
            label={''}
            setToFalseWhenEmpty={true}
            onChange={() => {
              updateTicketSettings()
            }}
          />
        </div>
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.jira.ticketExemption')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormMultiTypeCheckboxField
            disabled={true}
            name={''}
            label={''}
            setToFalseWhenEmpty={true}
            onChange={() => {
              updateTicketSettings()
            }}
          />
        </div>
      </Layout.Horizontal>
    </Container>
  )

  function updateTicketSettings() {
    return
  }
}

export default Tickets
