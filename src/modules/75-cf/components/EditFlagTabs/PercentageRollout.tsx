/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Layout, Text, Container, Select } from '@harness/uicore'
import { sumBy, clamp } from 'lodash-es'
import type { Distribution, WeightedVariation, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import { useBucketByItems } from '@cf/utils/CFUtils'
import { CFVariationColors } from '@cf/constants'
import { useTargetAttributes } from '@cf/hooks/useTargetAttributes'
import type { Option } from '@cf/utils/sortOptions'
import { sortOptions } from '@cf/utils/sortOptions'
import css from './TabTargeting.module.scss'

interface PercentageValues {
  id: string
  displayName: string
  value: number
  color: string
}

interface PercentageRolloutProps {
  editing: boolean
  bucketBy?: string
  variations: Variation[]
  weightedVariations: WeightedVariation[]
  onSetPercentageValues?(value: Distribution): void
  style?: React.CSSProperties
}

const PercentageRollout: React.FC<PercentageRolloutProps> = ({
  editing,
  bucketBy,
  weightedVariations,
  variations,
  onSetPercentageValues,
  style
}) => {
  const [bucketByValue, setBucketByValue] = useState<string>(bucketBy || 'identifier')

  const [percentageError, setPercentageError] = useState(false)
  const { getString } = useStrings()

  const variationsToPercentage = variations?.map((elem, i) => {
    const weightedVariation = weightedVariations.find(wvElem => wvElem.variation === elem.identifier)

    return {
      id: elem.identifier,
      displayName: elem.name || elem.value,
      value:
        weightedVariation?.weight || weightedVariation?.weight === 0
          ? weightedVariation?.weight
          : Math.floor(100 / (variations?.length ?? 1)),
      color: CFVariationColors[i % CFVariationColors.length]
    }
  })

  const [percentageValues, setPercentageValues] = useState<PercentageValues[]>(() => variationsToPercentage)

  const changeColorWidthSlider = (e: React.ChangeEvent<HTMLInputElement>, id: string): void => {
    if (percentageValues) {
      let updatedPercentages: PercentageValues[]
      const newValue = Math.floor(clamp(Number(e.target.value), 0, 100))
      if (percentageValues.length === 2) {
        updatedPercentages = percentageValues.map(elem => ({
          ...elem,
          value: elem.id === id ? newValue : 100 - newValue
        }))
      } else {
        updatedPercentages = percentageValues.map(elem => (elem.id === id ? { ...elem, value: newValue } : elem))
      }
      setPercentageError(sumBy(updatedPercentages, 'value') > 100)
      setPercentageValues(updatedPercentages)
    }
  }

  useEffect(() => {
    onSetPercentageValues?.({
      bucketBy: bucketByValue,
      variations: percentageValues.map(elem => ({
        variation: elem.id,
        weight: elem.value
      }))
    })
  }, [bucketByValue, percentageValues])

  const { bucketByItems, addBucketByItem } = useBucketByItems()
  const { targetAttributes } = useTargetAttributes()
  const bucketBySelectValue = useMemo(() => {
    return bucketByItems.find(item => item.value === bucketByValue)
  }, [bucketByItems, bucketByValue])
  const bucketByDisplayName = useMemo(() => {
    return bucketByItems.find(item => item.value === bucketByValue)?.label
  }, [bucketByItems, bucketByValue])

  const sortedBucketByItems = useMemo<Option[]>(() => sortOptions(bucketByItems), [bucketByItems])

  type InputEventType = { target: { value: string } }
  const onSelectEvent = (event: InputEventType): void => {
    const { value } = event.target
    setBucketByValue(value)
    addBucketByItem(value)
  }

  useEffect(() => {
    addBucketByItem(bucketBy as string)
  }, [bucketBy, addBucketByItem])

  useEffect(() => {
    if (targetAttributes.length) {
      targetAttributes.forEach(addBucketByItem)
    }
  }, [targetAttributes, addBucketByItem])

  return (
    <Container margin={{ left: editing ? 'small' : 'xsmall' }} style={style}>
      <Layout.Horizontal
        margin={{ bottom: 'small' }}
        style={{ alignItems: 'baseline', marginTop: editing ? 'var(--spacing-small)' : 0 }}
      >
        <Text margin={{ right: 'small' }} style={{ fontSize: '14px', lineHeight: '24px', whiteSpace: 'nowrap' }}>
          <span
            dangerouslySetInnerHTML={{
              __html: getString('cf.featureFlags.bucketBy', {
                targetField: editing ? undefined : bucketByDisplayName || bucketBy
              })
            }}
          />
        </Text>
        {editing && (
          <Select
            data-testid="bucket-by"
            name="bucketBy"
            value={bucketBySelectValue}
            items={sortedBucketByItems}
            onChange={({ value }) => {
              addBucketByItem(value as string)
              setBucketByValue(value as string)
            }}
            inputProps={{
              onBlur: onSelectEvent,
              onKeyUp: event => {
                if (event.keyCode === 13) {
                  onSelectEvent(event as unknown as InputEventType)
                }
              }
            }}
            allowCreatingNewItems
          />
        )}
      </Layout.Horizontal>
      <div
        style={{
          borderRadius: '10px',
          width: '300px',
          height: '11px',
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {percentageValues?.map(elem => (
          <span
            key={elem.id}
            data-testid={`${elem.id}-bar-percentage`}
            style={{
              width: `${elem.value}%`,
              backgroundColor: elem.color,
              display: 'inline-block',
              height: '11px'
            }}
          />
        ))}
      </div>
      <Container margin={{ top: 'medium' }}>
        {percentageValues?.length &&
          percentageValues?.map((elem, i) => (
            <Layout.Horizontal
              key={`${elem.id}-${i}`}
              data-testid={`${elem.id}-percentage`}
              margin={{ bottom: 'medium' }}
              style={{ alignItems: 'baseline' }}
            >
              <span
                className={css.circle}
                style={{
                  backgroundColor: percentageValues[i].color,
                  marginRight: '10px',
                  transform: 'translateY(1px)'
                }}
              ></span>
              <Text margin={{ right: 'medium' }} width={editing ? 198 : 237}>
                {elem.displayName}
              </Text>
              {editing ? (
                <Text>
                  <input
                    type="number"
                    data-testid={`${elem.id}-percentage-value`}
                    onChange={e => changeColorWidthSlider(e, elem.id)}
                    style={{ width: '50px', marginRight: 'var(--spacing-xsmall)' }}
                    value={elem.value}
                    min={0}
                    max={100}
                  />
                  %
                </Text>
              ) : (
                <Text>{elem.value}%</Text>
              )}
            </Layout.Horizontal>
          ))}
        {percentageError && <Text intent="danger">{getString('cf.featureFlags.bucketOverflow')}</Text>}
      </Container>
    </Container>
  )
}

export default PercentageRollout
