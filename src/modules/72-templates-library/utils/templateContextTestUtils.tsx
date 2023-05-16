/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'

import { pick } from 'lodash-es'

import { VisualYamlSelectedView } from '@harness/uicore'
import type { TestWrapperProps } from '@common/utils/testUtils';
import { TestWrapper } from '@common/utils/testUtils'
import type {
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext';
import {
  TemplateContext
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

import templateContextProviderProps from './__tests__/mocks/templateContextProvider.json'

export interface TemplateContextWrapperProps extends TestWrapperProps {
  templateContextValues?: Partial<TemplateContextInterface>
  isGitSyncEnabled?: boolean
}

export const TemplateContextTestWrapper: React.FC<TemplateContextWrapperProps> = props => {
  const { defaultAppStoreValues, templateContextValues, isGitSyncEnabled = true } = props
  const [view, setView] = React.useState<VisualYamlSelectedView>(VisualYamlSelectedView.VISUAL)
  return (
    <TestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CD']
        },
        isGitSyncEnabled: isGitSyncEnabled,
        connectivityMode: 'DELEGATE',
        ...defaultAppStoreValues
      }}
    >
      <TemplateContext.Provider
        value={
          {
            view: view,
            setView: setView,
            updateTemplateView: jest.fn(),
            ...templateContextProviderProps,
            ...templateContextValues,
            state: {
              ...templateContextProviderProps.state,
              ...templateContextValues?.state,
              yamlHandler: {
                getLatestYaml: () => 'dummy\n',
                getYAMLValidationErrorMap: () => new Map(),
                ...templateContextValues?.state?.yamlHandler
              }
            }
          } as TemplateContextInterface
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </TemplateContext.Provider>
    </TestWrapper>
  )
}
