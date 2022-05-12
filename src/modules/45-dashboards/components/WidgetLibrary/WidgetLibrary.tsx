/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Icon, ExpandingSearchInput, Card, Button } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { useGet, useMutate } from 'restful-react'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './WidgetLibrary.module.scss'

const MODULE_TYPES = {
  CE: 'CE',
  CD: 'CD',
  ALL: 'ALL'
}

export const WizardLibrary: React.FC<{ onClose: () => void }> = ({ onClose }): JSX.Element => {
  const { accountId, viewId } = useParams<AccountPathProps & { viewId: string }>()
  const [_library, _setLibrary] = React.useState<{ module: string; title: string; qid: string }[]>([])
  const [library, setLibrary] = React.useState<{ module: string; title: string; qid: string }[]>([])
  const [selectedLook, setSelectedLook] = React.useState('')
  const { data: widgetLibrary } = useGet({
    path: `insights/widgets`,
    queryParams: { accountId: accountId }
  })

  const { mutate: addWidget } = useMutate({
    verb: 'POST',
    path: 'insights/addWidget',
    queryParams: { accountId: accountId }
  })

  React.useEffect(() => {
    if (widgetLibrary) {
      setLibrary(widgetLibrary?.resource)
      _setLibrary(widgetLibrary?.resource)
    }
  }, [widgetLibrary])

  const addWidgetToDashboard = async () => {
    const { resource } = await addWidget({
      dashboard_id: viewId /* eslint-disable-line */,
      qid: selectedLook,
      title: library.find(x => x.qid === selectedLook)?.title
    })
    if (resource) {
      onClose()
    }
  }

  const filterData = (type: string) => {
    if (type === MODULE_TYPES.ALL) {
      setLibrary(_library)
      return
    }
    const filteredResults = _library.filter(x => x.module === type)
    setLibrary(filteredResults)
  }

  const onSearch = (searchData: string) => {
    if (searchData) {
      const filteredResults = _library.filter(x => x.title.toLowerCase().search(searchData) !== -1)

      setLibrary(filteredResults)
    } else {
      setLibrary(_library)
    }
  }
  return (
    <Layout.Vertical style={{ height: '100%' }} className={css.main}>
      <Layout.Horizontal style={{ justifyContent: 'space-between', height: '100%' }}>
        <Layout.Vertical style={{ width: '70%' }} padding="large">
          <Layout.Horizontal
            style={{
              alignItems: 'center',
              height: '45px',
              borderBottom: '1px solid var(--grey-300)',
              marginBottom: 'var(--spacing-medium)',
              justifyContent: 'space-between'
            }}
          >
            <Text
              color={Color.GREY_900}
              style={{
                fontSize: '16px',
                fontWeight: 500,
                paddingBottom: 'var(--spacing-xsmall)'
              }}
            >
              Widget Library
            </Text>
            <div className={css.expandedInput}>
              <ExpandingSearchInput
                autoFocus={false}
                placeholder="Search Widget"
                throttle={200}
                onChange={(text: string) => {
                  onSearch(text)
                }}
              />
            </div>
          </Layout.Horizontal>
          {library && library.length > 0 && (
            <Layout.Vertical>
              {library?.filter(x => x.module === MODULE_TYPES.CE)?.length > 0 && (
                <section className={css.moduleTitle}>
                  <Icon name={'ce-main'} size={25} /> CLOUD COSTS
                </section>
              )}
              {library
                ?.filter(x => x.module === MODULE_TYPES.CE)
                .map((widget: any) => {
                  return (
                    <Layout.Horizontal
                      className={css.widgets}
                      spacing="medium"
                      key={widget.qid}
                      onClick={() => setSelectedLook(widget.qid)}
                    >
                      <Card interactive={false} elevation={0} selected={selectedLook === widget.qid ? true : false}>
                        <Icon name={'doughnut-chart'} color={Color.GREEN_600} size={23} />
                      </Card>
                      <Text color={Color.BLACK_100}>{widget?.title}</Text>
                    </Layout.Horizontal>
                  )
                })}
              {library?.filter(x => x.module === MODULE_TYPES.CD)?.length > 0 && (
                <section className={css.moduleTitle}>
                  <Icon name={'cd-main'} size={25} /> DEPLOYMENTS
                </section>
              )}
              {library
                ?.filter(x => x.module === MODULE_TYPES.CD)
                .map((widget: any) => {
                  return (
                    <Layout.Horizontal
                      className={css.widgets}
                      spacing="medium"
                      key={widget.qid}
                      onClick={() => setSelectedLook(widget.qid)}
                    >
                      <Card interactive={false} elevation={0} selected={selectedLook === widget.qid ? true : false}>
                        <Icon name={'doughnut-chart'} color={Color.BLUE_600} size={23} />
                      </Card>
                      <Text color={Color.BLACK_100}>{widget?.title}</Text>
                    </Layout.Horizontal>
                  )
                })}
            </Layout.Vertical>
          )}

          <Layout.Horizontal className={css.footerActions}>
            <Button
              text="Add to Dashboard"
              intent="primary"
              disabled={!selectedLook}
              onClick={() => addWidgetToDashboard()}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical
          style={{
            width: '30%',
            backgroundColor: 'var(--blue-850)',
            color: 'white'
          }}
          padding="large"
          className={css.libraryContainer}
        >
          <Text
            color={Color.WHITE}
            style={{
              fontSize: '16px',
              fontWeight: 500,
              paddingBottom: 'var(--spacing-xsmall)'
            }}
          >
            <Icon name="list-detail-view" color={Color.WHITE} /> &nbsp;Library
          </Text>
          <Layout.Vertical
            spacing="large"
            style={{
              margin: 'var(--spacing-large) 0',
              borderBottom: '1px solid var(--grey-500)',
              paddingBottom: 'var(--spacing-large)'
            }}
          >
            <Text color={Color.WHITE} onClick={() => filterData(MODULE_TYPES.ALL)}>
              All Widgets ({_library?.length})
            </Text>
          </Layout.Vertical>

          <Layout.Vertical spacing="xxlarge">
            <Text color={Color.WHITE} onClick={() => filterData(MODULE_TYPES.CE)}>
              <Icon name="ce-main" color={Color.WHITE} size={18} />
              Cloud Cost ({_library?.filter(x => x.module === MODULE_TYPES.CE)?.length})
            </Text>
            <Text color={Color.WHITE} onClick={() => filterData(MODULE_TYPES.CD)}>
              <Icon name="cd-main" color={Color.WHITE} size={18} />
              Deployments ({_library?.filter(x => x.module === MODULE_TYPES.CD)?.length})
            </Text>
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
