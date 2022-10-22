/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, CardSelect, Container, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { SelectOption } from '@wings-software/uicore'
import { DelegateSizeDetails, useGetDelegateSizes } from 'services/portal'

import { useStrings } from 'framework/strings'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { DelegateSize } from '@delegates/constants'

import css from './DelegateSizes.module.scss'

interface DelegateSizeProps {
  onSizeSelect: (sizeValue: string) => void
}

const delegateSizeUpto = {
  [DelegateSize.LAPTOP]: 25,
  [DelegateSize.SMALL]: 50,
  [DelegateSize.MEDIUM]: 100,
  [DelegateSize.LARGE]: 200
}

const filterDelegatesize = (delegateSizes: any, size: any) => {
  return delegateSizes.find((item: any) => item.size === size.value)
}

const formatDelegateSizeArr = (delegateSizes: any) => {
  if (!delegateSizes) {
    return []
  }
  return delegateSizes.map((item: any) => ({
    label: item.label,
    value: item.size
  }))
}

const getDefaultDelegateSize = (delegateSizes: DelegateSizeDetails[]) => {
  return delegateSizes
    ? delegateSizes.find((item: DelegateSizeDetails) => item.size === DelegateSize.LAPTOP)
    : undefined
}

const DelegateSizes: React.FC<DelegateSizeProps> = ({ onSizeSelect }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { data: delegateSizes } = useGetDelegateSizes({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const delegateSizeMappings: DelegateSizeDetails[] | undefined = delegateSizes?.resource
  const selectCardData = formatDelegateSizeArr(delegateSizeMappings)
  const defaultSize: DelegateSizeDetails | undefined = delegateSizeMappings
    ? getDefaultDelegateSize(delegateSizeMappings)
    : undefined
  const [selectedCard, setSelectedCard] = React.useState<SelectOption | undefined>()

  React.useEffect(() => {
    if (defaultSize) {
      const defaultCard: SelectOption = selectCardData.find((item: SelectOption) => item.value === defaultSize.size)
      setSelectedCard(defaultCard)
      onSizeSelect(defaultCard.value as string)
    }
  }, [defaultSize])

  const getTagClsName = (size: string) => {
    if (size === DelegateSize.SMALL) {
      return css.small
    } else if (size === DelegateSize.LAPTOP) {
      return css.extraSmall
    } else if (size === DelegateSize.MEDIUM) {
      return css.medium
    } else if (size === DelegateSize.LARGE) {
      return css.large
    }
    return ''
  }
  return (
    <Layout.Vertical className={css.delegateSizeField}>
      <label className={css.delegateSizeLabel}>{getString('delegate.delegateSize')}</label>
      <div className={css.formGroup}>
        <CardSelect
          cornerSelected={true}
          data={selectCardData}
          selected={selectCardData[selectCardData.findIndex((card: any) => card.value === selectedCard?.value)]}
          renderItem={item => {
            const cardData = filterDelegatesize(delegateSizeMappings, item)

            const tagClsName = getTagClsName(cardData.size)
            return (
              <Container className={`${css.cardWrapper}`}>
                <div className={`${tagClsName} ${css.sizeTag}`}>{cardData.label}</div>
                <Layout.Vertical className={css.textCenter}>
                  <div className={css.uptoText}>
                    {getString('delegates.delegateSizeUpTo', {
                      count: delegateSizeUpto[cardData.size]
                    })}
                  </div>
                  <Text className={css.replicaText}>
                    {getString('delegates.replicaText')}
                    {cardData.replicas}{' '}
                  </Text>
                </Layout.Vertical>

                <Container className={css.footer}>
                  <Layout.Vertical className={css.textCenter}>
                    <Text className={css.footerHeader}> {getString('delegate.totalMem').toLocaleUpperCase()}</Text>
                    <Text className={css.footerContent}>
                      {(Number(cardData.ram) / 1024).toFixed(1)}
                      {getString('delegates.totalMemUnit')}
                    </Text>
                  </Layout.Vertical>

                  <Layout.Vertical className={css.textCenter}>
                    <Text className={css.footerHeader}>{getString('delegate.totalCpu').toLocaleUpperCase()}</Text>
                    <Text className={css.footerContent}>{cardData.cpu}</Text>
                  </Layout.Vertical>
                </Container>
              </Container>
            )
          }}
          onChange={size => {
            /* istanbul ignore next */
            setSelectedCard(size)
            onSizeSelect(size.value as string)
          }}
          className={`grid ${css.delegateSizeWrapper}`}
        />
      </div>

      <Container className={css.workloadSeparator}>
        <Text color={Color.ORANGE_500}>{getString('delegate.productionWorkloads')}</Text>
      </Container>
    </Layout.Vertical>
  )
}

export default DelegateSizes
