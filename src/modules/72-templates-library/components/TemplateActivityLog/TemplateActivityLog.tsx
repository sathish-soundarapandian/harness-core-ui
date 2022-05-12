/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef } from 'react'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { Button, Container, Heading, Icon, Layout, PageError, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { AuditEventDTO, AuditFilterProperties, getAuditEventListPromise } from 'services/audit'
import type { TemplateSummaryResponse } from 'services/template-ng'

import { useInfiniteScroll } from '@common/hooks/useInfiniteScroll'
import css from './TemplateActivityLog.module.scss'

export interface TemplateActivityLogProps {
  template: TemplateSummaryResponse
}

interface TemplateActivityProps {
  auditEvent: AuditEventDTO
  last: boolean
}

const HumanizedAction = ({ action }: { action: string }) => {
  /*
  Convert an action enum to human readable text string
  E.g. CREATE mapped to created, UPDATE to updated, etc
  */
  const { getString } = useStrings()
  let actionString = ''
  if (action === 'CREATE') {
    actionString = getString('templatesLibrary.created')
  } else if (action === 'UPDATE') {
    actionString = getString('templatesLibrary.updated')
  } else if (action === 'DELETE') {
    actionString = getString('templatesLibrary.deleted')
  } else if (action === 'DEFAULT') {
    actionString = getString('templatesLibrary.default')
  }
  return <Text>{actionString}</Text>
}

const TimelineIndicators = ({ last }: { last: boolean }) => {
  /*
  The icons on the left pane of timeline
  Any change in this component should be sync'd with the right side data too
  */
  return (
    <div>
      <Button iconProps={{ size: 10 }} withoutBoxShadow round className={css.timelineFirstIcon} icon="edit" />
      <div className={css.timelineSeparator}></div>
      <div className={css.dot} />
      <div className={cx(css.timelineSeparator, last ? css.timelineSeparatorLast : '')}></div>
      {last ? <Icon name="double-chevron-down" color={Color.GREY_250} className={css.lastIcon} /> : null}
    </div>
  )
}

const TemplateActivity = ({ auditEvent, last }: TemplateActivityProps) => {
  /* Rendering a single audit activity */
  const { action, authenticationInfo, resource, timestamp, auditEventData } = auditEvent
  const { labels } = authenticationInfo
  const { getString } = useStrings()

  return (
    <div className={css.activity}>
      <TimelineIndicators last={last} />
      <div>
        <Layout.Horizontal spacing="xsmall" margin={{ left: 'small', top: 'xsmall' }}>
          <Text intent="primary">{labels?.username || getString('common.userLabel')}</Text>
          <HumanizedAction action={action} />
          <Text intent="primary">{resource.labels?.versionLabel || ''}</Text>
        </Layout.Horizontal>

        <Text font={{ size: 'small' }} margin={{ left: 'medium' }}>
          <ReactTimeago date={timestamp} />
        </Text>

        <Container
          padding="small"
          margin={{ left: 'medium', top: 'medium' }}
          border={{ radius: 4, color: Color.PRIMARY_6 }}
        >
          <Text font={{ size: 'small' }} width={420} lineClamp={2}>
            {(auditEventData as any)?.comments || getString('templatesLibrary.sampleTemplateAuditComment')}
          </Text>
        </Container>
      </div>
    </div>
  )
}

export const TemplateActivityLog = (props: TemplateActivityLogProps) => {
  const {
    template: { accountId }
  } = props
  const { getString } = useStrings()

  /* Ref to attach to the last element to the list - for infinite scroll */
  const loadMoreRef = useRef(null)

  /* The request body for the activity logs POST call */
  const postCallRequestBody: AuditFilterProperties = useMemo(() => {
    return {
      filterType: 'Audit',
      scopes: [
        {
          accountIdentifier: props.template.accountId,
          orgIdentifier: props.template.orgIdentifier,
          projectIdentifier: props.template.projectIdentifier
        }
      ],
      resources: [
        {
          type: 'TEMPLATE',
          identifier: props.template.identifier || ''
        }
      ],
      modules: ['TEMPLATESERVICE']
    }
  }, [props])

  const {
    items: templateActivityLogs,
    error: templateActivityLogsFetchError,
    fetching: fetchingTemplateActivityLogs,
    attachRefToLastElement,
    offsetToFetch
  } = useInfiniteScroll({
    getItems: options => {
      return getAuditEventListPromise({
        queryParams: { accountIdentifier: accountId || '', pageIndex: options.offset, pageSize: options.limit },
        body: postCallRequestBody
      })
    },
    limit: 10,
    loadMoreRef
  })

  const isfetchingLogsFirstTime = useCallback(() => {
    return fetchingTemplateActivityLogs && offsetToFetch.current === 0
  }, [fetchingTemplateActivityLogs, offsetToFetch.current])

  const isfetchingLogsNextTime = useCallback(() => {
    return fetchingTemplateActivityLogs && offsetToFetch.current > 0
  }, [fetchingTemplateActivityLogs, offsetToFetch.current])

  const isError = useCallback(() => {
    return !fetchingTemplateActivityLogs && templateActivityLogsFetchError
  }, [fetchingTemplateActivityLogs, templateActivityLogsFetchError])

  const isEmptyContent = useCallback(() => {
    return !fetchingTemplateActivityLogs && !templateActivityLogsFetchError && isEmpty(templateActivityLogs)
  }, [fetchingTemplateActivityLogs, templateActivityLogsFetchError, templateActivityLogs])

  return (
    <Container height={'100%'} className={css.container}>
      <Layout.Vertical flex={{ align: 'center-center' }} height={'100%'}>
        {isError() && <PageError message={templateActivityLogsFetchError} />}
        {isfetchingLogsFirstTime() && <PageSpinner message={getString('templatesLibrary.fetchingActivityLogs')} />}
        {isEmptyContent() ? (
          <Heading level={2} font={{ weight: 'bold' }} color={Color.GREY_300}>
            {getString('templatesLibrary.noActivityLogs')}
          </Heading>
        ) : (
          <Container
            style={{ overflow: 'auto' }}
            width={'100%'}
            height={'100%'}
            padding={{ top: 'medium', bottom: 'medium', left: 'xxlarge' }}
          >
            <>
              {(templateActivityLogs as AuditEventDTO[])?.map((auditEvent, index) => (
                <div ref={attachRefToLastElement(index) ? loadMoreRef : undefined} key={auditEvent.auditId}>
                  <TemplateActivity auditEvent={auditEvent} last={index === templateActivityLogs.length - 1} />
                </div>
              ))}
              {isfetchingLogsNextTime() && (
                <Container padding={{ left: 'xxlarge' }}>
                  <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
                    {getString('templatesLibrary.fetchingActivityLogs')}
                  </Text>
                </Container>
              )}
            </>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
