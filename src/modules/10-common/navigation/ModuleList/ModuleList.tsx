/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Drawer, Position } from '@blueprintjs/core'
import { Color, Container, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Link, useParams } from 'react-router-dom'
import { String, StringKeys } from 'framework/strings'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ModuleConfigurationScreen from '../ModuleConfigurationScreen/ModuleConfigurationScreen'
import css from './ModuleList.module.scss'

interface ModuleListProps {
  isOpen: boolean
  close: () => void
  usePortal?: boolean
}

interface ItemConfig {
  icon: IconName
  label: StringKeys
  link: string
  className: string
}

interface GroupConfig {
  label: StringKeys
  items: ItemConfig[]
}

interface ItemProps {
  data: ItemConfig
}

interface GroupProps {
  data: GroupConfig
}

const Item: React.FC<ItemProps> = ({ data }) => {
  return (
    <div className={css.itemContainer}>
      <Link to={data.link} className={css.itemLink}>
        <Text
          icon={data.icon}
          iconProps={{ size: 30, margin: { right: 'small' } }}
          color={Color.WHITE}
          background={Color.PRIMARY_9}
          padding={'small'}
          className={cx(css.itemLabel, data.className)}
          font={{ size: 'small', weight: 'semi-bold' }}
        >
          <String stringID={data.label} />
        </Text>
      </Link>
      <Icon name="tooltip-icon" padding={'small'} margin={{ left: 'small' }} size={12} className={css.clickable} />
    </div>
  )
}

const Group: React.FC<GroupProps> = ({ data }) => {
  return (
    <Container>
      <Text color={Color.PRIMARY_2} margin={{ bottom: 'large' }} font={{ size: 'small', weight: 'semi-bold' }}>
        <String stringID={data.label} />
      </Text>
      <Layout.Vertical spacing="medium">
        {data.items.map(item => (
          <Item key={item.label} data={item} />
        ))}
      </Layout.Vertical>
    </Container>
  )
}

const ModuleList: React.FC<ModuleListProps> = ({ isOpen, close, usePortal = true }) => {
  const { accountId } = useParams<AccountPathProps>()
  const [showModuleConfigScreen, setModuleConfigScreen] = useState(false)

  const listConfig: GroupConfig[] = [
    {
      label: 'common.moduleList.buildAndTest',
      items: [
        {
          icon: 'ci-main',
          label: 'common.purpose.ci.continuous',
          link: routes.toCI({ accountId }),
          className: css.ci
        }
      ]
    },
    {
      label: 'common.moduleList.deployChanges',
      items: [
        {
          icon: 'cd-main',
          label: 'common.purpose.cd.continuous',
          link: routes.toCD({ accountId }),
          className: css.cd
        }
      ]
    },
    {
      label: 'common.moduleList.manageImpact',
      items: [
        {
          icon: 'sto-color-filled',
          label: 'common.purpose.sto.continuous',
          link: routes.toSTO({ accountId }),
          className: css.sto
        },
        {
          icon: 'ff-solid',
          label: 'common.purpose.cf.continuous',
          link: routes.toCF({ accountId }),
          className: css.ff
        }
      ]
    },
    {
      label: 'common.moduleList.optimize',
      items: [
        {
          icon: 'ce-main',
          label: 'common.purpose.ce.continuous',
          link: routes.toCE({ accountId }),
          className: css.ccm
        },
        {
          icon: 'cv-main',
          label: 'common.purpose.cv.continuous',
          link: routes.toCV({ accountId }),
          className: css.srm
        }
      ]
    }
  ]

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={close}
        position={Position.LEFT}
        size={Drawer.SIZE_SMALL}
        className={css.modulesList}
        backdropClassName={css.backdrop}
        usePortal={usePortal}
      >
        <div className={css.modulesListContainer}>
          <Container flex={{ alignItems: 'center' }} margin={{ bottom: 'huge' }}>
            <Text font={{ size: 'large', weight: 'bold' }} color={Color.WHITE}>
              <String stringID="common.moduleList.title" />
            </Text>
            <Icon
              name="customize"
              size={20}
              className={cx(css.blue, css.clickable)}
              padding={'small'}
              onClick={() => setModuleConfigScreen(true)}
            />
          </Container>
          <Layout.Vertical spacing="xxxlarge">
            {listConfig.map(item => (
              <Group data={item} key={item.label} />
            ))}
          </Layout.Vertical>
        </div>
      </Drawer>
      {showModuleConfigScreen && (
        <ModuleConfigurationScreen
          onClose={() => {
            setModuleConfigScreen(false)
          }}
        />
      )}
    </>
  )
}

export default ModuleList
