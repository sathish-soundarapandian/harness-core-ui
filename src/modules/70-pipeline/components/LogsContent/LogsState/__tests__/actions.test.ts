/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { useActionCreator, UseActionCreatorReturn } from '../actions'
import { ActionType } from '../types'

const dispatch = jest.fn()
describe('useActionCreator tests', () => {
  beforeEach(() => {
    dispatch.mockClear()
  })

  test.each<[ActionType, keyof UseActionCreatorReturn]>([
    [ActionType.CreateSections, 'createSections'],
    [ActionType.FetchSectionData, 'fetchSectionData'],
    [ActionType.FetchingSectionData, 'fetchingSectionData'],
    [ActionType.GoToNextSearchResult, 'goToNextSearchResult'],
    [ActionType.GoToPrevSearchResult, 'goToPrevSearchResult'],
    [ActionType.ResetSearch, 'resetSearch'],
    [ActionType.ResetSection, 'resetSection'],
    [ActionType.Search, 'search'],
    [ActionType.ToggleSection, 'toggleSection'],
    [ActionType.UpdateSectionData, 'updateSectionData']
  ])('%s action type', (type, method) => {
    const { result } = renderHook(useActionCreator, { initialProps: dispatch })

    result.current[method]({} as any)

    expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ type }))
  })
})
