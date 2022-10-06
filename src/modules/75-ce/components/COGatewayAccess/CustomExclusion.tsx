/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import {
  Button,
  Color,
  Container,
  FontVariation,
  Layout,
  PillToggle,
  Select,
  SelectOption,
  Text,
  TextInput
} from '@harness/uicore'
import { debounce, defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { CustomHandlerType, HandlerKind } from '@ce/constants'
import type { GatewayDetails, Handler } from '../COCreateGateway/models'
import css from './COGatewayAccess.module.scss'

interface CustomExclusionProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (data: GatewayDetails) => void
}

const CustomExclusion: React.FC<CustomExclusionProps> = ({ gatewayDetails, setGatewayDetails }) => {
  const { getString } = useStrings()
  const [selectedType, setSelectedType] = useState(
    defaultTo(get(gatewayDetails, 'routing.source_filters.type'), CustomHandlerType.exclude)
  )
  const [handlers, setHandlers] = useState<Handler[]>(
    defaultTo(get(gatewayDetails, 'routing.source_filters.filters'), [])
  )

  const kindOptions: SelectOption[] = [
    { label: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.option1Label'), value: HandlerKind.path },
    { label: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.option3Label'), value: HandlerKind.ip }
  ]

  const kindInputPlaceholderMap: Record<HandlerKind, string> = {
    [HandlerKind.ip]: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.option3Placeholder'),
    [HandlerKind.path]: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.option1Placeholder'),
    [HandlerKind.header]: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.option2Placeholder')
  }

  const saveSourceFilters = () => {
    setGatewayDetails({
      ...gatewayDetails,
      routing: {
        ...gatewayDetails.routing,
        source_filters: {
          type: selectedType,
          filters: handlers
        }
      }
    })
  }

  const debouncedSave = useCallback(debounce(saveSourceFilters, 500), [handlers, selectedType])

  useEffect(() => {
    debouncedSave()
  }, [handlers, selectedType])

  return (
    <Layout.Vertical spacing={'medium'} className={cx(css.dnsLinkContainer, css.customExclusion)}>
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('ce.co.autoStoppingRule.setupAccess.customExclusion.heading')}
      </Text>
      <p
        dangerouslySetInnerHTML={{
          __html: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.description')
        }}
      ></p>
      <PillToggle
        options={[
          {
            label: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.exclude').toUpperCase(),
            value: CustomHandlerType.exclude
          },
          {
            label: getString('ce.co.autoStoppingRule.setupAccess.customExclusion.include').toUpperCase(),
            value: CustomHandlerType.include
          }
        ]}
        onChange={setSelectedType}
        selectedView={selectedType}
        className={css.toggle}
      />
      <Container data-testid="customItemsContainer">
        {handlers.map((handler, index) => {
          return (
            <Layout.Horizontal key={`customSelection${index}`}>
              <Select
                name="kindSelector"
                items={kindOptions}
                onChange={kind => {
                  const updatedHandlers = handlers.map((item, i) => {
                    /* istanbul ignore else */
                    if (index === i) {
                      return { ...item, kind: kind.value as HandlerKind }
                    }
                    return item
                  })
                  setHandlers(updatedHandlers)
                }}
                value={kindOptions.find(opt => opt.value === handler.kind)}
                className={css.kindSelector}
              />
              <Layout.Horizontal className={css.valueContainer}>
                <TextInput
                  placeholder={kindInputPlaceholderMap[handler.kind]}
                  value={handler.value}
                  onChange={e => {
                    const updatedHandlers = handlers.map((item, i) => {
                      /* istanbul ignore else */
                      if (index === i) {
                        return { ...item, value: (e.target as HTMLInputElement).value }
                      }
                      return item
                    })
                    setHandlers(updatedHandlers)
                  }}
                />
                {handler.kind === HandlerKind.header && (
                  /* istanbul ignore next */ <TextInput
                    placeholder={getString(
                      'ce.co.autoStoppingRule.setupAccess.customExclusion.option2ValuePlaceholder'
                    )}
                  />
                )}
              </Layout.Horizontal>
              <Button
                minimal
                icon="main-trash"
                onClick={() => {
                  setHandlers(prevHandlers => prevHandlers.filter((_, i) => i !== index))
                }}
              />
            </Layout.Horizontal>
          )
        })}
        <Text
          className={css.addBtn}
          color={Color.PRIMARY_7}
          onClick={() => setHandlers([...handlers, { kind: HandlerKind.path, value: '' }])}
        >
          {'+ ' + getString('add')}
        </Text>
      </Container>
    </Layout.Vertical>
  )
}

export default CustomExclusion
