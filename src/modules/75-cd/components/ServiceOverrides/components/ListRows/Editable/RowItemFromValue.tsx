import React from 'react'
import { noop } from 'lodash-es'
import { FormInput } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import OverrideTypeInput from './OverrideTypeInput'

export default function RowItemFromValue({ value }: { value: StringKeys }): React.ReactElement {
  const { getString } = useStrings()

  if (value === 'environment') {
    return (
      <MultiTypeEnvironmentField
        name="environmentRef"
        label={''}
        placeholder={getString('common.entityPlaceholderText')}
        setRefValue={true}
        openAddNewModal={noop}
        isNewConnectorLabelVisible
        multiTypeProps={{
          defaultValueToReset: ''
        }}
      />
    )
  } else if (value === 'service') {
    return (
      <MultiTypeServiceField
        name="serviceRef"
        label={''}
        placeholder={getString('common.entityPlaceholderText')}
        setRefValue={true}
        openAddNewModal={noop}
        isNewConnectorLabelVisible
        multiTypeProps={{
          defaultValueToReset: ''
        }}
      />
    )
  } else if (value === 'infrastructureText') {
    return (
      <FormInput.Select
        name="infraIdentifier"
        label={''}
        placeholder={getString('common.entityPlaceholderText')}
        items={[
          { label: 'Infra 1', value: 'Infra_1' },
          { label: 'Infra 2', value: 'Infra_2' }
        ]}
      />
    )
  } else {
    return <OverrideTypeInput />
  }
}
