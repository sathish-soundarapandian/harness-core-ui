import React from 'react'
import { defaultTo } from 'lodash-es'
import { SelectOption, FormInput, MultiTypeInputType, FormError, MultiTypeInput, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
// eslint-disable-next-line import/no-unresolved
//import { getTypeOfInput } from '../../../../AppAppDHealthSource.utils'
// eslint-disable-next-line aliased-module-imports
import { getTypeOfInput } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.utils'
// eslint-disable-next-line aliased-module-imports
import { setLogIndexes } from '@cv/pages/health-source/connectors/ElkHealthSource/ElkHealthSource.utils'
// eslint-disable-next-line aliased-module-imports

import styles from './MapQueriesToHarnessServiceLayout.module.scss'

export default function MultiTextOrSelectInput({
  options,
  connectorIdentifier,
  formikAppDynamicsValue,
  setFieldValue,
  isTemplate,
  expressions,
  allowedTypes,
  applicationError,
  appdMultiType: inputType,
  setAppdMultiType: setInputType,
  areOptionsLoading,
  handleSelectChange,
  logIndexes,
  label,
  placeholder,
  name
}: any): JSX.Element {
  React.useEffect(() => {
    if (
      getTypeOfInput(connectorIdentifier) !== MultiTypeInputType.FIXED &&
      getTypeOfInput(formikAppDynamicsValue) !== MultiTypeInputType.FIXED
    ) {
      setInputType(getTypeOfInput(formikAppDynamicsValue))
    }
  }, [formikAppDynamicsValue])

  return isTemplate ? (
    <>
      <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
        {label}
      </Text>
      <MultiTypeInput
        key={inputType}
        data-testid="logIndexesField"
        name={name}
        placeholder={label}
        selectProps={{
          items: options,
          inputProps: {
            placeholder
          }
        }}
        multitypeInputValue={inputType}
        allowableTypes={allowedTypes}
        value={setLogIndexes(formikAppDynamicsValue, options, inputType)}
        style={{ marginBottom: !applicationError ? '20px' : '' }}
        expressions={expressions}
        onChange={(item, _valueType, multiType) => {
          if (inputType !== multiType) {
            setInputType(multiType)
          }
          const selectedItem = item as string | SelectOption
          const selectedValue =
            typeof selectedItem === 'string' ? selectedItem : defaultTo(selectedItem?.label?.toString(), '')
          setFieldValue(name, selectedValue)
        }}
      />
      {applicationError && (
        <FormError name="appdApplication" className={styles.errorClass} errorMessage={applicationError} />
      )}
    </>
  ) : (
    <FormInput.Select
      label={label}
      name={name}
      selectProps={{ allowCreatingNewItems: true }}
      disabled={areOptionsLoading}
      placeholder={placeholder}
      items={options}
      onChange={handleSelectChange}
      value={logIndexes ? { label: logIndexes, value: logIndexes } : undefined}
    />
  )
}
