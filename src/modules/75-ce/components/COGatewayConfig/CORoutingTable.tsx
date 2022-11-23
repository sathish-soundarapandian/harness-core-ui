/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty as _isEmpty, debounce as _debounce } from 'lodash-es'
import { FieldArray, Select, TextInput, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Formik } from 'formik'
import type { Field } from '@harness/uicore/dist/components/FieldArray/FieldArray'
import type { PortConfig } from 'services/lw'
import { useStrings } from 'framework/strings'
import css from './COGatewayConfig.module.scss'

interface SelectItem {
  label: string
  value: string
}

const protocols: SelectItem[] = [
  {
    label: 'http',
    value: 'http'
  },
  {
    label: 'https',
    value: 'https'
  }
]

const actions: SelectItem[] = [
  {
    label: 'Redirect',
    value: 'redirect'
  },
  {
    label: 'Forward',
    value: 'forward'
  }
]

interface CORoutingTableProps {
  routingRecords: PortConfig[]
  setRoutingRecords: (records: PortConfig[]) => void
  isAwsConfig?: boolean
}
const CORoutingTable: React.FC<CORoutingTableProps> = props => {
  const { getString } = useStrings()

  const getItembyValue = (items: SelectItem[], value: string): SelectItem => {
    return items.filter(x => x.value == value)[0]
  }

  const getTextInput: Field['renderer'] = (value, _rowIndex, handleChange) => (
    <TextInput
      defaultValue={value}
      style={{ border: 'none', marginBottom: 0 }}
      onChange={e => handleChange((e.currentTarget as HTMLInputElement).value)}
    />
  )

  const NumericInput: Field['renderer'] = (value, _rowIndex, handleChange) => {
    return (
      <TextInput
        value={value}
        style={{ border: 'none', marginBottom: 0 }}
        type="number"
        min={0}
        onChange={e => {
          const val = (e.currentTarget as HTMLInputElement).value
          handleChange(val)
        }}
      />
    )
  }

  const getProtocolSelect: Field['renderer'] = (value, _rowIndex, handleChange) => (
    <Select
      className={css.selectCell}
      value={getItembyValue(protocols, value)}
      items={protocols}
      onChange={item => handleChange(item.value)}
    />
  )

  const fields: Field[] = [
    {
      name: 'protocol',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.protocol')}</Text>,
      renderer: getProtocolSelect
    },
    {
      name: 'port',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.smtp.port')}</Text>,
      renderer: NumericInput
    },
    {
      name: 'action',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('action')}</Text>,
      renderer: (value, _rowIndex, handleChange) => (
        <Select
          className={css.selectCell}
          value={getItembyValue(actions, value)}
          items={actions}
          onChange={item => {
            handleChange(item.value)
          }}
        />
      )
    },
    {
      name: 'target_protocol',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.targetProtocol')}</Text>,
      renderer: (value, _rowIndex, handleChange) => (
        <Select
          className={css.selectCell}
          value={getItembyValue(protocols, value)}
          items={protocols}
          onChange={item => handleChange(item.value)}
          /* INFO: AWS check to disable target protocol in case of REDIRECT action */
          disabled={props.isAwsConfig && props.routingRecords?.[_rowIndex]?.action === actions[0].value}
        />
      )
    },
    {
      name: 'target_port',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.targetPort')}</Text>,
      renderer: (value, _rowIndex, handleChange) => {
        return (
          <TextInput
            value={value}
            style={{ border: 'none', marginBottom: 0 }}
            type="number"
            min={0}
            onChange={e => {
              const val = (e.currentTarget as HTMLInputElement).value
              handleChange(val)
            }}
            /* INFO: AWS check to disable target port in case of REDIRECT action */
            disabled={props.isAwsConfig && props.routingRecords?.[_rowIndex]?.action === actions[0].value}
          />
        )
      }
    },
    {
      name: 'redirect_url',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.redirectUrl')}</Text>,
      renderer: (value, rowIndex, handleChange) => (
        <TextInput
          value={value}
          disabled={props.routingRecords?.[rowIndex]?.action === actions[1].value}
          style={{ border: 'none', marginBottom: 0 }}
          onChange={e => handleChange((e.currentTarget as HTMLInputElement).value)}
        />
      )
    },
    {
      name: 'server_name',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.serverName')}</Text>,
      renderer: getTextInput
    },
    {
      name: 'routing_rules',
      label: <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('ce.common.pathMatch')}</Text>,
      renderer: (value, _rowIndex, handleChange) => (
        <TextInput
          defaultValue={value}
          style={{ border: 'none', marginBottom: 0 }}
          onChange={e => handleChange((e.currentTarget as HTMLInputElement).value)}
          data-testid="routingRules"
        />
      )
    }
  ]

  const getInitialData = () => {
    return props.routingRecords.map(_record => {
      return {
        ..._record,
        routing_rules: _isEmpty(_record['routing_rules']) ? '' : _record['routing_rules']?.[0].path_match
      }
    })
  }

  const handleFielArrayChange = _debounce(data => {
    const portConfig = [...(data.modifiedRows as Array<any>)]
    portConfig.forEach(config => {
      const routingRules = config['routing_rules']
      config['routing_rules'] = !_isEmpty(routingRules)
        ? [{ path_match: Array.isArray(routingRules) ? routingRules[0].path_match : routingRules }]
        : []

      /* INFO: AWS check to remove target port & target protocol in case of REDIRECT action
       * Need to remove once the support comes on BE
       */
      if (props.isAwsConfig && config.action === actions[0].value) {
        config['target_protocol'] = ''
        config['target_port'] = 0
      }
      if (config.action === actions[1].value) {
        config['redirect_url'] = ''
      }
      config.port = Number(config.port)
      config.target_port = Number(config.target_port)
    })
    props.setRoutingRecords(portConfig)
  }, 500)

  return (
    <div className={css.portConfigTable}>
      <Formik
        initialValues={{ routingTableData: getInitialData() }}
        enableReinitialize={true}
        onSubmit={values => {
          console.log(values) // eslint-disable-line
        }}
      >
        {formikProps => (
          <form onSubmit={formikProps.handleSubmit}>
            <FieldArray
              label={''}
              name={'routingTableData'}
              fields={fields}
              onChange={data => handleFielArrayChange(data)}
            />
          </form>
        )}
      </Formik>
    </div>
  )
}

export default CORoutingTable
