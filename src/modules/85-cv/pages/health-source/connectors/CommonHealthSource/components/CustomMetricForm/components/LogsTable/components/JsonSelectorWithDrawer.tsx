import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import {
  AllowedTypes,
  Container,
  Layout,
  MultiTypeInputType,
  NoDataCard,
  RUNTIME_INPUT_VALUE,
  Text
} from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import JsonSelector from '@cv/components/JsonSelector/JsonSelector'
import type { JsonRawSelectedPathType } from '@cv/components/JsonSelector/JsonSelectorType'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import {
  logsTableDefaultConfigs,
  FIELD_ENUM
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import JsonSelectorButton from './LogsTableComponent/components/JsonSelectorButton'
import JsonDrawerMultiType from './LogsTableComponent/components/JsonDrawerMultiType'
import type { LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'
import { useCommonHealthSource } from '../../CommonHealthSourceContext/useCommonHealthSource'
import { getMultiTypeRecordInitialValue } from './JsonSelectorWithDrawer.utils'
import css from './JsonSelectorWithDrawer.module.scss'

interface JsonSelectorWithDrawerProps {
  fieldMappings?: FieldMapping[]
  jsonData?: Record<string, any>
  disableFields?: boolean
  allowedTypes?: AllowedTypes
}

export default function JsonSelectorWithDrawer(props: JsonSelectorWithDrawerProps): JSX.Element | null {
  const { getString } = useStrings()

  const { isTemplate, sourceData } = useContext(SetupSourceTabsContext)

  const { values, setFieldValue, setValues } = useFormikContext<CommonCustomMetricFormikInterface>()

  const { isQueryRuntimeOrExpression } = useCommonHealthSource()

  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  const { fieldMappings, disableFields, jsonData } = props

  const filteredFieldsMapping = fieldMappings?.filter(field => field.type === FIELD_ENUM.JSON_SELECTOR)

  const isDisabled = disableFields

  const [multiTypeRecord, setMultiTypeRecord] = useState<LogFieldsMultiTypeState | null>(
    (): LogFieldsMultiTypeState | null => {
      return getMultiTypeRecordInitialValue({
        filteredFieldsMapping,
        isTemplate,
        formValues: values
      })
    }
  )

  useEffect(() => {
    if (
      (isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression) &&
      isTemplate &&
      multiTypeRecord &&
      filteredFieldsMapping
    ) {
      const updatedMultiTypeRecord: LogFieldsMultiTypeState = {} as LogFieldsMultiTypeState
      const updatedFormikValues: Record<keyof CommonCustomMetricFormikInterface, any> = {} as Record<
        keyof CommonCustomMetricFormikInterface,
        any
      >

      filteredFieldsMapping.forEach(field => {
        if (multiTypeRecord[field.identifier] === MultiTypeInputType.FIXED) {
          updatedMultiTypeRecord[field.identifier] = MultiTypeInputType.RUNTIME
          updatedFormikValues[field.identifier] = RUNTIME_INPUT_VALUE
        }
      })

      if (!isEmpty(updatedMultiTypeRecord)) {
        setMultiTypeRecord(c => ({ ...c, ...updatedMultiTypeRecord }))

        setValues(currentValues => {
          return { ...currentValues, ...updatedFormikValues }
        })
      }
    }
  }, [filteredFieldsMapping, isConnectorRuntimeOrExpression, isQueryRuntimeOrExpression, isTemplate, values])

  const handleTemplateTypeUpdate = (
    fieldName: keyof CommonCustomMetricFormikInterface,
    updatedType: MultiTypeInputType
  ): void => {
    if (isTemplate && multiTypeRecord) {
      const updatedMultiTypeRecord = {
        [fieldName]: updatedType
      } as LogFieldsMultiTypeState

      setMultiTypeRecord(c => {
        return { ...c, ...updatedMultiTypeRecord }
      })
    }
  }

  const {
    showDrawer: showHealthSourceDrawer,
    hideDrawer: hideHealthSourceDrawer,
    setDrawerHeaderProps
  } = useDrawer({
    createHeader: (headerProps: { titleLable: string }) => {
      const headerText = `${getString(
        'cv.monitoringSources.commonHealthSource.logsTable.jsonSelectorDrawerTitlePrefix'
      )} ${headerProps.titleLable || ''}`

      return <Text font={{ variation: FontVariation.FORM_TITLE }}>{headerText}</Text>
    },
    createDrawerContent: drawerProps => {
      return (
        <Container padding="medium" height="100%">
          {!isEmpty(jsonData) ? (
            <JsonSelector
              json={jsonData || {}}
              showSelectButton
              onPathSelect={(pathSelected: JsonRawSelectedPathType) => {
                drawerProps?.formikFieldUpdateFn(pathSelected.key)
                hideHealthSourceDrawer()
              }}
            />
          ) : (
            <Container className={css.noRecords}>
              <NoDataCard
                icon="warning-sign"
                message={getString('cv.monitoringSources.commonHealthSource.logsTable.noSampleAvailable')}
              />
            </Container>
          )}
        </Container>
      )
    },
    drawerOptions: logsTableDefaultConfigs,
    className: css.logsTableJsonDrawer
  })

  const openDrawer = (fieldName: string, label: string): void => {
    const formikFieldUpdateFn = setFieldValue.bind(null, fieldName)
    setDrawerHeaderProps?.({
      titleLable: label
    })
    showHealthSourceDrawer({
      formikFieldUpdateFn
    })
  }

  if (!filteredFieldsMapping || !Array.isArray(fieldMappings)) {
    return null
  }

  return (
    <>
      {filteredFieldsMapping.map(field => {
        return (
          <Layout.Vertical key={field.identifier} spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
            <Text style={{ fontSize: 13, fontWeight: 'normal' }}>{field.label}</Text>
            {isTemplate ? (
              <JsonDrawerMultiType
                label={field.label}
                name={field.identifier}
                displayText={(values[field.identifier] as string) || field.label}
                onClick={() => openDrawer(field.identifier, field.label)}
                value={values[field.identifier] as string}
                key={multiTypeRecord?.[field.identifier] as string}
                disabled={isDisabled}
                className={css.jsonSelectorButton}
                multiType={multiTypeRecord?.[field.identifier] as MultiTypeInputType}
                setMultiType={handleTemplateTypeUpdate}
              />
            ) : (
              <JsonSelectorButton
                className={css.jsonSelectorButton}
                displayText={(values[field.identifier] as string) || field.label}
                onClick={() => openDrawer(field.identifier, field.label)}
                disabled={isDisabled}
                icon="plus"
              />
            )}
          </Layout.Vertical>
        )
      })}
    </>
  )
}
