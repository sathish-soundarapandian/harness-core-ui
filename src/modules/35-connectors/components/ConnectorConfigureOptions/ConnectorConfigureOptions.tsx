/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import {
  FormConnectorFieldProps,
  FormConnectorReferenceField
} from '../ConnectorReferenceField/FormConnectorReferenceField'

export interface ConnectorConfigureOptionsProps extends ConfigureOptionsProps {
  connectorReferenceFieldProps: Omit<FormConnectorFieldProps, 'width' | 'name' | 'isMultiSelect' | 'placeholder'>
}

export const ConnectorConfigureOptions: FC<ConnectorConfigureOptionsProps> = props => {
  const { connectorReferenceFieldProps, ...configureOptionsProps } = props
  const { getString } = useStrings()

  const renderConnectorReferenceField: ConfigureOptionsProps['getAllowedValuesCustomComponent'] = () => {
    return (
      <FormConnectorReferenceField
        {...connectorReferenceFieldProps}
        width={430}
        name="allowedValues"
        placeholder={getString('connectors.selectConnectors')}
        isMultiSelect={true}
      />
    )
  }

  return <ConfigureOptions {...configureOptionsProps} getAllowedValuesCustomComponent={renderConnectorReferenceField} />
}
