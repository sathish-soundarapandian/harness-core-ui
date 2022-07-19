/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, IconName, CardSelect, Layout, Icon } from '@wings-software/uicore'
import { Color, FontVariation } from '@wings-software/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StoreType } from '@common/constants/GitSyncTypes'

export interface CardInterface {
  type: string
  title: string
  info: string
  icon: IconName
  size: number
  disabled?: boolean
}

function getCards(
  getString: UseStringsReturn['getString'],
  isDisabled: (current: StoreType) => boolean
): CardInterface[] {
  return [
    {
      type: StoreType.INLINE,
      title: getString('inline'),
      info: getString('common.git.inlineStoreLabel'),
      icon: 'repository',
      size: 16,
      disabled: isDisabled(StoreType.INLINE)
    },
    {
      type: StoreType.REMOTE,
      title: getString('remote'),
      info: getString('common.git.remoteStoreLabel'),
      icon: 'remote-setup',
      size: 20,
      disabled: isDisabled(StoreType.REMOTE)
    }
  ]
}

export interface InlineRemoteSelectProps {
  selected: StoreType
  onChange(item: CardInterface): void
  className?: string
  getCardDisabledStatus(current: StoreType, selected: StoreType): boolean
}

export function InlineRemoteSelect(props: InlineRemoteSelectProps): React.ReactElement {
  const { selected, getCardDisabledStatus = () => false, onChange, className } = props
  const { getString } = useStrings()

  const cards = getCards(getString, (current: StoreType) => getCardDisabledStatus(current, selected))
  const selectedCard = cards.find(card => card.type === selected)

  return (
    <CardSelect
      data={cards}
      cornerSelected
      className={className}
      renderItem={(item: CardInterface) => (
        <Layout.Horizontal flex spacing={'small'}>
          <Icon name={item.icon} size={item.size} color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_600} />
          <Container>
            <Text
              font={{ variation: FontVariation.FORM_TITLE }}
              color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.title}
            </Text>
            <Text>{item.info}</Text>
          </Container>
        </Layout.Horizontal>
      )}
      selected={selectedCard}
      onChange={onChange}
    />
  )
}
