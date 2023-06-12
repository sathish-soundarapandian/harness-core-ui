import React, { useContext } from 'react'
import { useFormikContext } from 'formik'
import { AllowedTypes, Container, Layout, MultiTypeInputType, NoDataCard, Text } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import JsonSelector from '@cv/components/JsonSelector/JsonSelector'
import type { JsonRawSelectedPathType } from '@cv/components/JsonSelector/JsonSelectorType'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import {
  logsTableDefaultConfigs,
  FIELD_ENUM
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import JsonDrawerMultiType from './LogsTableComponent/components/JsonDrawerMultiType'
import type { LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'
import { getSelectedPath } from './JsonSelectorWithDrawer.utils'
import InputWithJsonSelector from './LogsTableComponent/components/InputWithJsonSelector/InputWithJsonSelector'
import css from './JsonSelectorWithDrawer.module.scss'

interface JsonSelectorWithDrawerProps {
  fieldMappings?: FieldMapping[]
  jsonData?: Record<string, any>
  disableFields?: boolean
  allowedTypes?: AllowedTypes
  multiTypeRecord: LogFieldsMultiTypeState | null
  setMultiTypeRecord: React.Dispatch<React.SetStateAction<LogFieldsMultiTypeState | null>>
  selectOnlyLastKey?: boolean
  showExactJsonPath?: boolean
}

export default function JsonSelectorWithDrawer(props: JsonSelectorWithDrawerProps): JSX.Element | null {
  const { getString } = useStrings()
  const { isTemplate } = useContext(SetupSourceTabsContext)
  const { values, setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()

  const {
    fieldMappings,
    disableFields,
    jsonData,
    multiTypeRecord,
    setMultiTypeRecord,
    selectOnlyLastKey,
    showExactJsonPath
  } = props
  const filteredFieldsMapping = fieldMappings?.filter(field => field.type === FIELD_ENUM.JSON_SELECTOR)
  const isDisabled = disableFields

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
                const path = getSelectedPath(selectOnlyLastKey, pathSelected, showExactJsonPath)
                drawerProps?.formikFieldUpdateFn(path)
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
    className: css.logsTableJsonDrawer,
    showConfirmationDuringClose: false
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
            {isTemplate && field?.isTemplateSupportEnabled ? (
              <JsonDrawerMultiType
                label={field.label}
                name={field.identifier}
                displayText={(values[field.identifier] as string) || field.label}
                onClick={() => openDrawer(field.identifier, field.label)}
                value={values[field.identifier] as string}
                key={multiTypeRecord?.[field.identifier] as string}
                disabled={isDisabled}
                displayTextclassName={classNames({
                  [css.inputText]: Boolean(values[field.identifier])
                })}
                className={css.jsonSelectorButton}
                multiType={multiTypeRecord?.[field.identifier] as MultiTypeInputType}
                setMultiType={handleTemplateTypeUpdate}
              />
            ) : (
              <InputWithJsonSelector
                className={css.jsonSelectorButton}
                displayTextclassName={classNames({
                  [css.inputText]: Boolean(values[field.identifier])
                })}
                displayText={(values[field.identifier] as string) || `Select ${field.label}`}
                onClick={() => openDrawer(field.identifier, field.label)}
                isDisabled={isDisabled}
                name={field.identifier}
              />
            )}
          </Layout.Vertical>
        )
      })}
    </>
  )
}
