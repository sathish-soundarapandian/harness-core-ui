/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Droppable, DragDropContext } from 'react-beautiful-dnd'
import type { ModuleName } from 'framework/types/ModuleName'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { DEFAULT_MODULES_ORDER } from '../util'
import DraggableModuleItem from './DraggableModuleItem/DraggableModuleItem'

interface ModuleSortableListProps {
  activeModule: ModuleName
  onSelect: (module: ModuleName) => void
}

interface ModulesPreferenceStoreData {
  orderedModules: ModuleName[]
  selectedModules: ModuleName[]
}

export const MODULES_CONFIG_PREFERENCE_STORE_KEY = 'modulesConfiguration'

const reorder = (list: ModuleName[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const ModuleSortableList: React.FC<ModuleSortableListProps> = ({ onSelect, activeModule }) => {
  const { setPreference: setModuleConfigPreference, preference: { orderedModules = [], selectedModules = [] } = {} } =
    usePreferenceStore<ModulesPreferenceStoreData>(PreferenceScope.USER, MODULES_CONFIG_PREFERENCE_STORE_KEY)

  useEffect(() => {
    if (!orderedModules || orderedModules.length === 0) {
      setModuleConfigPreference({
        selectedModules,
        orderedModules: DEFAULT_MODULES_ORDER
      })
    }
  }, [orderedModules])

  return (
    <>
      <DragDropContext
        onDragEnd={result => {
          if (!result.destination) {
            return
          }
          // Re order modules based on source and destination index
          const reordered = reorder(orderedModules, result.source.index, result.destination.index)
          // Save reorderd modules in the preference store
          setModuleConfigPreference({ orderedModules: reordered, selectedModules })
        }}
      >
        <Droppable droppableId="droppableModules">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {orderedModules.map((module, index) => (
                <DraggableModuleItem
                  key={module}
                  index={index}
                  module={module}
                  isActive={activeModule === module}
                  onClick={onSelect}
                  checked={selectedModules.indexOf(module) > -1}
                  onCheckboxChange={checked => {
                    const tempOrderedSelectedModules = [...selectedModules]

                    if (checked) {
                      tempOrderedSelectedModules.push(module)
                    } else {
                      const moduleIndex = tempOrderedSelectedModules.indexOf(module)
                      tempOrderedSelectedModules.splice(moduleIndex, 1)
                    }

                    setModuleConfigPreference({
                      orderedModules,
                      selectedModules: tempOrderedSelectedModules
                    })
                  }}
                />
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  )
}

export default ModuleSortableList
