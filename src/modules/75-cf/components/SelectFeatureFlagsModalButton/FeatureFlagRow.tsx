/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Select, SelectOption } from '@harness/uicore'
import { ItemBriefInfo } from '@cf/components/ItemBriefInfo/ItemBriefInfo'
import { CFVariationColors } from '@cf/constants'
import type { Feature } from 'services/cf'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { ItemContainer } from '../ItemContainer/ItemContainer'

export interface FeatureRowProps {
  id: string
  feature: Feature
  checked: boolean
  disabled: boolean // Disable selection
  onChecked: (checked: boolean, feature: Feature, variationIdentifier: string) => void
}

export const FeatureFlagRow: React.FC<FeatureRowProps> = ({ feature, checked, disabled, onChecked, id }) => {
  const { getString } = useStrings()
  const [isChecked, setIsChecked] = useState(checked)
  const { showWarning } = useToaster()
  const [variationIdentifier, setVariationIdentifier] = useState<string>()
  const toggleCheck = (): void => {
    if (variationIdentifier) {
      setIsChecked(previous => {
        onChecked(!previous, feature, variationIdentifier)
        return !previous
      })
    } else {
      showWarning(getString('cf.shared.pleaseSelectVariation'))
    }
  }
  const variationSelectItems = feature.variations.map<SelectOption>((elem, index) => ({
    label: elem.name as string,
    value: elem.identifier as string,
    icon: { name: 'full-circle', style: { color: CFVariationColors[index] } }
  }))
  const onSelectChanged = (item: SelectOption): void => {
    setVariationIdentifier(item.value as string)
    setIsChecked(true)
    onChecked(true, feature, item.value as string)
  }

  return (
    <ItemContainer
      style={{
        flexGrow: 1,
        border: '1px solid rgba(40, 41, 61, 0.04)',
        marginRight: '1px',
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'inherit'
      }}
    >
      <Container flex style={{ alignItems: 'center', width: '25px', justifyContent: 'center' }}>
        <input
          data-testid={`${id}_input`}
          type="checkbox"
          checked={isChecked}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          disabled={disabled}
          onChange={disabled ? undefined : toggleCheck}
        />
      </Container>
      <ItemBriefInfo
        noAvatar
        disabled={disabled}
        name={feature.name}
        description={feature.description as string}
        style={{ boxShadow: 'none', flexGrow: 1, paddingLeft: 'var(--spacing-xsmall)', maxWidth: '370px' }}
        padding="none"
      />
      <Container width={175}>
        <Select
          data-testid={`${id}_select`}
          items={variationSelectItems}
          onChange={onSelectChanged}
          disabled={disabled}
        />
      </Container>
    </ItemContainer>
  )
}
