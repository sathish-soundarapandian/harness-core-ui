/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getEntityNameFromType, joinAsASentence } from '../StringUtils'

describe('Test StringUtils', () => {
  test('Test getEntityNameFromType method', () => {
    expect(getEntityNameFromType('Connectors')).toBe('connector')
    expect(getEntityNameFromType('Pipelines')).toBe('pipeline')
    expect(getEntityNameFromType(undefined)).toBe('')
  })

  test('Test joinAsASentence method', () => {
    expect(joinAsASentence(['item1', 'item2', 'item3'], 'and')).toEqual('item1, item2 and item3')
    expect(joinAsASentence(['item1', 'item2'], 'and')).toEqual('item1 and item2')
    expect(joinAsASentence([], 'and')).toEqual('')
    expect(joinAsASentence(['item'], 'and')).toEqual('item')
    expect(joinAsASentence([''], 'and')).toEqual('')
    expect(joinAsASentence(['item1', ''], 'and')).toEqual('item1')
    expect(joinAsASentence(['item1', 'item2', ''], 'with')).toEqual('item1 with item2')
    expect(joinAsASentence(['item1', 'item2', 'item3'], 'plus')).toEqual('item1, item2 plus item3')
  })
})
