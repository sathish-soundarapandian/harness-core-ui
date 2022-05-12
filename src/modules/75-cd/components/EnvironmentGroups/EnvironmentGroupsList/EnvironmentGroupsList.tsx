/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'

import { Button, Container, getErrorInfoFromErrorObject, Layout, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { EnvironmentGroupResponse, useDeleteEnvironmentGroup } from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import {
  EditOrDeleteCell,
  EnvironmentGroupName,
  EnvironmentTypes,
  LastUpdatedBy,
  NoOfEnvironments
} from './EnvironmentGroupsListColumns'
import { EnvironmentGroupDetailsTab } from '../utils'

import css from '../EnvironmentGroups.module.scss'

export interface EnvironmentGroupsListProps {
  environmentGroups?: EnvironmentGroupResponse[]
  refetch: () => void
}

export default function EnvironmentGroupsList({ environmentGroups, refetch }: EnvironmentGroupsListProps) {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())

  const onEdit = (environmentGroupIdentifier: string) => {
    history.push(
      routes.toEnvironmentGroupDetails({
        orgIdentifier,
        projectIdentifier,
        accountId,
        module,
        environmentGroupIdentifier,
        sectionId: EnvironmentGroupDetailsTab.CONFIGURATION
      })
    )
  }

  const { mutate: deleteEnvironmentGroup } = useDeleteEnvironmentGroup({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const onDelete = async (identifier: string) => {
    try {
      await deleteEnvironmentGroup(identifier, { headers: { 'content-type': 'application/json' } })
      showSuccess(getString('common.environmentGroup.deleted', { identifier }))
      refetch()
    } catch (e: any) {
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  return (
    <>
      <EnvironmentGroupsListHeaders />
      {environmentGroups?.map(environmentGroup => {
        /* istanbul ignore next */ const {
          lastModifiedAt,
          envGroup: { name, identifier = '', tags, envResponse: environments } = {}
        } = environmentGroup
        return (
          <Container
            key={identifier}
            data-testid={identifier}
            width={'100%'}
            background={Color.WHITE}
            padding={{
              left: 'medium',
              top: 'medium',
              right: 'medium',
              bottom: expandedSets.has(identifier) ? 0 : 'medium'
            }}
            margin={{ bottom: 'small' }}
            className={cx(css.tableContainer, { [css.showPointer]: !expandedSets.has(identifier) })}
            onClick={() => {
              // istanbul ignore else
              if (!expandedSets.has(identifier)) {
                expandedSets.add(identifier)
                setExpandedSets(new Set(expandedSets))
              }
            }}
          >
            <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'space-between' }}>
              <Layout.Vertical width={'60%'}>
                <EnvironmentGroupName name={name} identifier={identifier} tags={tags} />
              </Layout.Vertical>

              <Layout.Horizontal width={'40%'} flex={{ justifyContent: 'space-between' }}>
                <Container width={'120px'}>
                  <LastUpdatedBy lastModifiedAt={lastModifiedAt} />
                </Container>

                <NoOfEnvironments length={defaultTo(environments, []).length} />

                <EditOrDeleteCell identifier={identifier} onEdit={onEdit} onDelete={onDelete} />
              </Layout.Horizontal>
            </Layout.Horizontal>

            {expandedSets.has(identifier) && (
              <Layout.Vertical>
                {!environments?.length && (
                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'medium' }}>
                    {getString('cd.noEnvironment.title')}
                  </Text>
                )}
                {environments?.map(environment => {
                  /* istanbul ignore next */ const {
                    lastModifiedAt: envLastModifiedAt,
                    environment: { name: envName, identifier: envIdentifier, tags: envTags, type: envType } = {}
                  } = environment

                  return (
                    <Layout.Horizontal
                      spacing="xsmall"
                      padding={{ top: 'medium' }}
                      key={envIdentifier}
                      data-testid={envIdentifier}
                    >
                      <Layout.Vertical padding={{ left: 'xxlarge' }} style={{ flexGrow: 1 }}>
                        <EnvironmentGroupName name={envName} identifier={envIdentifier} tags={envTags} />
                      </Layout.Vertical>

                      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} width={'10%'}>
                        <EnvironmentTypes type={envType} />
                      </Layout.Horizontal>
                      <Layout.Horizontal width={'40%'} flex={{ justifyContent: 'flex-start' }}>
                        <LastUpdatedBy lastModifiedAt={envLastModifiedAt} />
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                  )
                })}
                <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ top: 'medium' }}>
                  <Button
                    rightIcon="chevron-up"
                    font={{ weight: 'semi-bold', variation: FontVariation.BODY1, size: 'small' }}
                    color={Color.GREY_100}
                    minimal
                    onClick={event => {
                      event.stopPropagation()
                      // istanbul ignore else
                      if (expandedSets.has(identifier)) {
                        expandedSets.delete(identifier)
                        setExpandedSets(new Set(expandedSets))
                      }
                    }}
                  >
                    {getString('common.showLess')}
                  </Button>
                </Layout.Horizontal>
              </Layout.Vertical>
            )}
          </Container>
        )
      })}
    </>
  )
}

function EnvironmentGroupsListHeaders() {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal margin={{ top: 'large', bottom: 'medium' }}>
      <Text
        font={{ variation: FontVariation.TABLE_HEADERS }}
        style={{ flexGrow: 1 }}
        role="button"
        tabIndex={0}
        width={'50%'}
      >
        {getString('common.environmentGroup.label').toUpperCase()}
      </Text>
      <Text width={'10%'} font={{ variation: FontVariation.TABLE_HEADERS }}>
        {getString('typeLabel').toUpperCase()}
      </Text>
      <Text width={'40%'} font={{ variation: FontVariation.TABLE_HEADERS }} role="button" tabIndex={0}>
        {getString('lastUpdatedBy').toUpperCase()}
      </Text>
    </Layout.Horizontal>
  )
}
