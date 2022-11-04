/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Heading, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import { EntityConfig, EntityType, EnvironmentType, FIELD_KEYS, ResourcesInterface } from '@freeze-windows/types'
import type { FieldVisibility } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { ServicesAndEnvRenderer, OrgProjAndServiceRenderer } from './FreezeStudioConfigSectionRenderers'

interface ConfigViewModeRendererProps {
  config: EntityConfig
  getString: UseStringsReturn['getString']
  setEditView: () => void
  deleteConfig: () => void
  fieldsVisibility: FieldVisibility
  resources: ResourcesInterface
  isReadOnly: boolean
  index: number
}

export const ConfigViewModeRenderer: React.FC<ConfigViewModeRendererProps> = ({
  config,
  getString,
  setEditView,
  deleteConfig,
  fieldsVisibility,
  resources,
  isReadOnly,
  index
}) => {
  const { name, entities } = config || /* istanbul ignore next */ {}
  const entitiesMap: Record<FIELD_KEYS, EntityType> =
    /* istanbul ignore next */ entities?.reduce((accum: any, item: EntityType) => {
      if (item?.type) {
        accum[item.type] = item as EntityType
      }
      return accum
    }, {}) || {}
  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between', alignItems: 'start' }}
      data-testid={`config-view-mode_${index}`}
    >
      <Layout.Vertical>
        <Heading
          color={Color.GREY_800}
          level={3}
          style={{ fontWeight: 700, fontSize: '12px', lineHeight: '18px', marginBottom: '12px' }}
        >
          {name}
        </Heading>
        <OrgProjAndServiceRenderer
          entitiesMap={entitiesMap}
          freezeWindowLevel={fieldsVisibility.freezeWindowLevel}
          resources={resources}
          getString={getString}
        />
        <ServicesAndEnvRenderer
          freezeWindowLevel={fieldsVisibility.freezeWindowLevel}
          getString={getString}
          envType={
            /* istanbul ignore next */ (entitiesMap[FIELD_KEYS.EnvType]?.entityRefs?.[0] ||
              EnvironmentType.All) as EnvironmentType
          }
        />
      </Layout.Vertical>
      <Layout.Horizontal>
        <Button disabled={isReadOnly} icon="Edit" minimal withoutCurrentColor onClick={setEditView} />
        <Button disabled={isReadOnly} icon="main-trash" minimal withoutCurrentColor onClick={deleteConfig} />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
