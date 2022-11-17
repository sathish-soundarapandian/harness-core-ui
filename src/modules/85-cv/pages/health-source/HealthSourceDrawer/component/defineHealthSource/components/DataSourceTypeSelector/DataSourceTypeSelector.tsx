import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { Container, GroupedThumbnailSelect, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getDataGroupSelectorItems } from './DataSourceTypeSelectorUtils'
import { ConnectorRefFieldName, DataSourceTypeFieldNames } from '../../DefineHealthSource.constant'
import type { DefineHealthSourceFormInterface } from '../../DefineHealthSource.types'

export default function PrometheusDataSourceTypeSelector({ isEdit }: { isEdit?: boolean }): JSX.Element {
  const { getString } = useStrings()

  const { setValues } = useFormikContext()

  const handleOnChange = useCallback(selectedValue => {
    setValues((values: DefineHealthSourceFormInterface) => {
      return { ...values, [DataSourceTypeFieldNames.DataSourceType]: selectedValue, [ConnectorRefFieldName]: null }
    })
  }, [])

  return (
    <Container margin={{ bottom: 'large' }} data-testid="dataSourceTypeSelector">
      <Text margin={{ top: 'small' }} font={{ variation: FontVariation.SMALL_BOLD }}>
        {getString('common.git.connectionType')}
      </Text>
      <Text margin={{ top: 'xsmall', bottom: 'medium' }} font={{ variation: FontVariation.SMALL }}>
        {getString('cv.healthSource.selectConnectionTypeInfo')}
      </Text>
      <GroupedThumbnailSelect
        name={DataSourceTypeFieldNames.DataSourceType}
        groups={getDataGroupSelectorItems(getString)}
        isReadonly={isEdit}
        onChange={handleOnChange}
      />
    </Container>
  )
}
