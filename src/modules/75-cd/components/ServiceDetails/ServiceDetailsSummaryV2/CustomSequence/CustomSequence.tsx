/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  PageError,
  Text,
  useToaster
} from '@harness/uicore'
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { Drawer } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type {
  EnvAndEnvGroupCard,
  GetCustomSequenceQueryParams} from 'services/cd-ng';
import {
  saveCustomSequencePromise,
  useGetCustomSequence,
  useDefaultSequence
} from 'services/cd-ng'
import openTaskEmptyState from '../openTaskEmptyState.svg'
import { CustomSequenceList } from './CustomSequenceList'
import { HeaderContent } from './CustomSequenceHeader'
import style from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'
import css from './CustomSequence.module.scss'

interface CustomSequenceProps {
  drawerOpen: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  afterSaveActions: () => void
}

export default function CustomSequenceDrawer(props: CustomSequenceProps): JSX.Element {
  const { drawerOpen, setDrawerOpen, afterSaveActions } = props
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetCustomSequenceQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }

  const { data, loading, error, refetch } = useGetCustomSequence({
    queryParams,
    lazy: !drawerOpen
  })

  const {
    data: defaultSequence,
    error: defaultSeqError,
    loading: defaultSeqLoading,
    refetch: resetToDefaultSequence
  } = useDefaultSequence({ queryParams, lazy: true })

  const customSequenceData = React.useMemo(() => {
    const defaultList = defaultTo(defaultSequence?.data?.envAndEnvGroupCardList, [])
    if (defaultList.length) {
      return defaultList
    }
    return defaultTo(data?.data?.envAndEnvGroupCardList, [])
  }, [data, defaultSequence])

  const customSeqError = error || defaultSeqError
  const [updatedList, setUpdatedList] = useState<EnvAndEnvGroupCard[]>(customSequenceData)

  React.useEffect(() => {
    setUpdatedList(customSequenceData)
  }, [customSequenceData])

  const saveAction = async (): Promise<void> => {
    clear()
    const finalCustomList = updatedList.map(obj => ({ ...obj, new: false })) //always send new as false to BE
    try {
      const response = await saveCustomSequencePromise({
        body: { envAndEnvGroupCardList: finalCustomList },
        queryParams
      })

      if (response.status === 'SUCCESS') {
        showSuccess(getString('cd.customSequence.saveSuccessMsg'))
        afterSaveActions()
        setDrawerOpen(false)
      } else {
        showError(getString('cd.customSequence.saveFailedMsg'))
      }
    } catch (e: any) {
      // istanbul ignore next
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  return (
    <>
      <Drawer
        enforceFocus={false}
        size={'calc(100% - 800px)'}
        isOpen={drawerOpen}
        data-testid={'CustomSequenceDrawer'}
        canOutsideClickClose={true}
        onClose={
          /* istanbul ignore next */ () => {
            setDrawerOpen(false)
          }
        }
      >
        <Button
          minimal
          className={style.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            setDrawerOpen(false)
          }}
        />
        <Layout.Vertical className={css.customSequenceBgColor} height={'100vh'}>
          <Layout.Horizontal
            flex={{ justifyContent: 'space-between' }}
            className={css.headerStyle}
            padding={{ top: 'large', bottom: 'large', right: 'xxlarge' }}
          >
            <Layout.Vertical spacing="small">
              <Text font={{ variation: FontVariation.BLOCKQUOTE }}>{getString('cd.customSequence.envSequence')}</Text>
              <Text
                margin={{ right: 'medium', top: 'small' }}
                font={{ variation: FontVariation.BODY }}
                color={Color.GREY_600}
              >
                {getString('cd.customSequence.customSequenceDescription')}
              </Text>
            </Layout.Vertical>
            <RbacButton
              text={getString('save')}
              variation={ButtonVariation.PRIMARY}
              permission={{
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                resource: {
                  resourceType: ResourceType.SERVICE,
                  resourceIdentifier: serviceId
                },
                permission: PermissionIdentifier.EDIT_SERVICE
              }}
              disabled={!customSequenceData.length}
              onClick={async () => {
                await saveAction()
              }}
            />
          </Layout.Horizontal>
          {loading || defaultSeqLoading ? (
            <Container
              flex={{ justifyContent: 'center', alignItems: 'center' }}
              height={'calc(100vh - 120px'}
              data-test="CustomSequenceListTableLoading"
            >
              <Icon name="spinner" color={Color.GREY_500} size={30} />
            </Container>
          ) : customSeqError ? (
            <Container
              data-test="CustomSequenceListTableError"
              height={'calc(100vh - 120px'}
              flex={{ justifyContent: 'center' }}
            >
              <PageError onClick={() => refetch()} message={getErrorInfoFromErrorObject(customSeqError)} />
            </Container>
          ) : !customSequenceData.length ? (
            <Layout.Vertical flex={{ alignItems: 'center', justifyContent: 'center' }} height={'calc(100vh - 200px'}>
              <img
                src={openTaskEmptyState}
                alt={getString('pipeline.ServiceDetail.envCardEmptyStateMsg')}
                className={css.emptyStateStyle}
              />
              <Text font={{ variation: FontVariation.BODY }}>
                {getString('pipeline.ServiceDetail.envCardEmptyStateMsg')}
              </Text>
            </Layout.Vertical>
          ) : (
            <Container>
              <DragDropContext
                onDragEnd={
                  /* istanbul ignore next */ (result: DropResult) => {
                    if (!result.destination) {
                      return
                    }
                    const res = Array.from(updatedList)
                    const [removed] = res.splice(result.source.index, 1)
                    res.splice(result.destination.index, 0, removed)
                    setUpdatedList(res)
                  }
                }
              >
                <Droppable droppableId={`droppable-${serviceId}`}>
                  {provided => (
                    <Layout.Vertical
                      padding={{ top: 'large', left: 'xxxlarge', bottom: 'xxxlarge', right: 'xxxlarge' }}
                    >
                      <HeaderContent
                        setUpdatedList={setUpdatedList}
                        updatedList={updatedList}
                        originalList={customSequenceData}
                        resetToDefaultSequence={resetToDefaultSequence}
                      />
                      <div {...provided.droppableProps} ref={provided.innerRef} className={css.customListBody}>
                        {updatedList.map((val: EnvAndEnvGroupCard, index: number) => {
                          const listItemKey = `${val.identifier}_${val.envGroup ? 'EnvGroup' : 'Env'}_${index}`
                          return (
                            <CustomSequenceList
                              key={listItemKey}
                              index={index}
                              entityDetails={val}
                              listItemKey={listItemKey}
                            />
                          )
                        })}
                      </div>
                      {provided.placeholder}
                    </Layout.Vertical>
                  )}
                </Droppable>
              </DragDropContext>
            </Container>
          )}
        </Layout.Vertical>
      </Drawer>
    </>
  )
}
