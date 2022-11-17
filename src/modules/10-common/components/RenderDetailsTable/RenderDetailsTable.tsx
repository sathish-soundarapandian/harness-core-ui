/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container, Layout, Text, IconName, Icon, Tag, tagsType } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import css from './RenderDetailsTable.module.scss'

export interface ActivityDetailsRowInterface {
  label: string
  value: string | string[] | tagsType | number | React.ReactElement | null | undefined
  iconData?: {
    text: string
    icon: IconName
    color?: string
  }
  valueColor?: Color
}

interface RenderDetailsSectionProps {
  title: string | React.ReactElement
  data: Array<ActivityDetailsRowInterface>
  className?: string
}

const renderTags = (tags: tagsType): React.ReactElement => {
  return (
    <Container>
      {Object.keys(tags).map(key => {
        const value = tags[key]
        return (
          <Tag className={css.tag} key={key}>
            {value ? `${key}:${value}` : key}
          </Tag>
        )
      })}
    </Container>
  )
}

export const RenderDetailsTable: React.FC<RenderDetailsSectionProps> = props => {
  const { getString } = useStrings()

  return (
    <Container className={cx(css.detailsSection, props.className)}>
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_700} padding={{ bottom: '10px' }}>
        {props.title}
      </Text>

      {props.data.map((item, index) => {
        return item.value && (item.label === getString('tagsLabel') ? Object.keys(item.value).length : true) ? (
          <Layout.Vertical
            className={css.detailsSectionRowWrapper}
            spacing="xsmall"
            padding={{ top: 'medium', bottom: 'medium' }}
            key={`${item.value}${index}`}
          >
            <Text font={{ size: 'small' }}>{item.label}</Text>
            {item.label === getString('tagsLabel') && typeof item.value === 'object' ? (
              renderTags(item.value as tagsType)
            ) : (
              <Layout.Horizontal spacing="small" className={css.detailsSectionRow}>
                <Text inline color={item.valueColor || Color.BLACK}>
                  {item.value}
                </Text>
                {item.iconData?.icon ? (
                  <Layout.Horizontal spacing="small">
                    <Icon
                      inline={true}
                      name={item.iconData.icon}
                      size={14}
                      color={item.iconData.color}
                      title={item.iconData.text}
                    />
                    <Text inline>{item.iconData.text}</Text>
                  </Layout.Horizontal>
                ) : null}
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        ) : (
          <></>
        )
      })}
    </Container>
  )
}
