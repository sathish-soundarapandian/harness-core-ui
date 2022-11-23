/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, FormikForm, FormInput, Layout } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { FIELD_KEYS, FreezeWindowLevels, ResourcesInterface } from '@freeze-windows/types'
import type { FieldVisibility } from '@freeze-windows/utils/FreezeWindowStudioUtil'
import {
  EnvironmentTypeRenderer,
  Organizationfield,
  ProjectField,
  ServiceFieldRenderer
} from './FreezeStudioConfigSectionRenderers'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface ConfigEditModeRendererProps {
  index: number
  getString: UseStringsReturn['getString']
  formikProps: any
  resources: ResourcesInterface
  saveEntity: any
  setVisualView: () => void
  fieldsVisibility: FieldVisibility
}

export const ConfigEditModeRenderer: React.FC<ConfigEditModeRendererProps> = ({
  index,
  getString,
  formikProps,
  resources,
  saveEntity,
  setVisualView,
  fieldsVisibility
}) => {
  return (
    <FormikForm>
      <Layout.Vertical data-testid={`config-edit-mode_${index}`}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
          <Layout.Vertical width={'400px'}>
            <FormInput.Text name={`entity[${index}].name`} label={getString('name')} inputGroup={{ autoFocus: true }} />
            {fieldsVisibility.showOrgField ? (
              <Organizationfield
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                setFieldValue={formikProps.setFieldValue}
                organizations={resources.orgs || []}
                fetchProjectsForOrgId={resources.fetchProjectsForOrgId}
              />
            ) : null}
            {fieldsVisibility.showProjectField ? (
              <ProjectField
                getString={getString}
                namePrefix={`entity[${index}]`}
                values={formikProps.values?.entity?.[index] || {}}
                setFieldValue={formikProps.setFieldValue}
                resources={resources}
              />
            ) : null}
          </Layout.Vertical>
          <Layout.Horizontal spacing="small">
            <Button icon="tick" minimal withoutCurrentColor className={css.tickButton} onClick={saveEntity} />
            <Button icon="cross" minimal withoutCurrentColor className={css.crossButton} onClick={setVisualView} />
          </Layout.Horizontal>
        </Layout.Horizontal>
        <hr className={css.separator} />
        <Layout.Vertical>
          <Layout.Horizontal spacing="medium">
            <ServiceFieldRenderer
              getString={getString}
              name={`entity[${index}].${FIELD_KEYS.Service}`}
              isDisabled={resources.freezeWindowLevel !== FreezeWindowLevels.PROJECT}
              services={resources.services || []}
            />
            <EnvironmentTypeRenderer getString={getString} name={`entity[${index}].${FIELD_KEYS.EnvType}`} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </FormikForm>
  )
}
