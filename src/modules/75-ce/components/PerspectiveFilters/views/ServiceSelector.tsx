/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import { sortBy } from 'lodash-es'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'
import type { ProviderType } from '../FilterPill'
import css from './views.module.scss'

interface ServiceSelectorProps {
  provider: ProviderType
  fieldValueList: QlceViewFieldIdentifierData[]
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ provider, fieldValueList, setService }) => {
  const serviceData = sortBy(
    fieldValueList && fieldValueList.filter(field => field.identifier === provider.id)[0].values,
    'fieldName'
  )
  return (
    <Container className={css.providerDropDown}>
      <ul className={css.providerList}>
        {serviceData
          ? serviceData.map(field => {
              const onClick: () => void = () => setService({ name: field?.fieldName || '', id: field?.fieldId || '' })
              return (
                <li key={field?.fieldId}>
                  <CustomMenuItem onClick={onClick} text={field?.fieldName || ''} />
                </li>
              )
            })
          : null}
      </ul>
    </Container>
  )
}

export default ServiceSelector
