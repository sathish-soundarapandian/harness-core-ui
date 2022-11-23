import React from 'react'
import { Container, MultiSelectDropDown, MultiSelectOption, SelectOption } from '@harness/uicore'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ADD_NEW_VALUE } from '@cv/constants'
import { useEnvironmentSelectOrCreate } from '../UseEnvironmentSelectOrCreate/EnvironmentSelectOrCreateHook'

export interface EnvironmentMultiSelectOrCreateProps {
  disabled?: boolean
  className?: string
  options: Array<SelectOption>
  item?: MultiSelectOption[]
  onSelect(value: MultiSelectOption[]): void
  onNewCreated(value: EnvironmentResponseDTO): void
  popOverClassName?: string
}

export function EnvironmentMultiSelectOrCreate({
  options,
  disabled,
  item,
  onSelect,
  onNewCreated,
  className,
  popOverClassName
}: EnvironmentMultiSelectOrCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { environmentOptions, openHarnessEnvironmentModal } = useEnvironmentSelectOrCreate({ options, onNewCreated })

  const onSelectChange = (val: MultiSelectOption[]): void => {
    if (val.find(it => it.value === ADD_NEW_VALUE)) {
      openHarnessEnvironmentModal()
    } else {
      onSelect(val)
    }
  }

  return (
    <Container onClick={e => e.stopPropagation()}>
      <MultiSelectDropDown
        placeholder={getString('cv.selectOrCreateEnv')}
        value={item}
        items={environmentOptions}
        className={className}
        disabled={disabled}
        onChange={onSelectChange}
        buttonTestId={'sourceFilter'}
        popoverClassName={popOverClassName}
      />
    </Container>
  )
}
