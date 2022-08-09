/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'

import { CommonFieldIds, FIELD_TO_ICON_MAPPING } from '../constants'
import type { ProviderType } from '../FilterPill'
import css from './views.module.scss'

interface ProviderSelectorProps {
  fieldValueList: QlceViewFieldIdentifierData[]
  setProvider: React.Dispatch<React.SetStateAction<ProviderType | null>>
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ fieldValueList, setProvider, setService }) => {
  const defaultFields = fieldValueList.filter(field => field.identifier !== 'CUSTOM' && field.identifier !== 'COMMON')
  const commonFields = fieldValueList.filter(field => field.identifier === 'COMMON')

  const labelClick: () => void = () => {
    setProvider({
      id: 'LABEL',
      name: 'Label'
    })
    setService({
      id: 'labels.key',
      name: ''
    })
  }

  return (
    <Container className={css.providerDropDown}>
      <ul className={css.providerList}>
        {defaultFields.map(field => {
          const onClick: () => void = () => setProvider({ id: field.identifier, name: field.identifierName })
          return (
            <li key={field.identifier}>
              <CustomMenuItem
                iconName={FIELD_TO_ICON_MAPPING[field.identifier]}
                text={field.identifierName}
                onClick={onClick}
              />
            </li>
          )
        })}

        {commonFields.map(commonField =>
          commonField.values.map(field => {
            if (field && field.fieldId !== CommonFieldIds.None) {
              const onClick: () => void = () => {
                setProvider({
                  id: commonField.identifier,
                  name: commonField.identifierName
                })
                setService({
                  id: field.fieldId,
                  name: field.fieldName
                })
                // Set Provider as well as service
              }
              return (
                <li key={field.fieldId}>
                  <CustomMenuItem text={field.fieldName} onClick={field.fieldName === 'Label' ? labelClick : onClick} />
                </li>
              )
            }
          })
        )}
      </ul>
    </Container>
  )
}

export default ProviderSelector
