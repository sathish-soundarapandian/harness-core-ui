/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TemplatesSelectorContextInterface } from './TemplateSelectorContext'

export const templateSelectorContextMock: TemplatesSelectorContextInterface = {
  state: {
    isDrawerOpened: false,
    selectorData: {
      templateType: 'Step',
      onSubmit: jest.fn(),
      onCancel: jest.fn()
    }
  },
  openTemplateSelector: jest.fn(),
  closeTemplateSelector: jest.fn()
}
