/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, IconName, CardSelect, Layout, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StoreType } from '@common/constants/GitSyncTypes'
import { SVGComponent } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraph'
import { LabelComponent } from '@common/components/InlineRemoteSelect/LabelComponent'

export interface CardInterface {
  type: string
  title: string
  info: string
  icon: IconName
  size: number
  disabled?: boolean
  entityType?: string
}

function getCards(
  getString: UseStringsReturn['getString'],
  isDisabled: (current: StoreType) => boolean,
  entityType = 'Pipeline'
): CardInterface[] {
  return [
    {
      type: StoreType.AI,
      title: getString('ai'),
      info: getString('common.git.aiStoreLabel', {
        entityType
      }),
      icon: 'repository',
      size: 80,
      disabled: isDisabled(StoreType.AI)
    },
    {
      type: StoreType.INLINE,
      title: getString('inline'),
      info: getString('common.git.inlineStoreLabel', {
        entityType
      }),
      icon: 'repository',
      size: 40,
      disabled: isDisabled(StoreType.INLINE)
    },
    {
      type: StoreType.REMOTE,
      title: getString('remote'),
      info: getString('common.git.remoteStoreLabel', {
        entityType
      }),
      icon: 'remote-setup',
      size: 40,
      disabled: isDisabled(StoreType.REMOTE)
    }
  ]
}

export interface InlineRemoteSelectProps {
  selected: 'INLINE' | 'REMOTE' | 'AI'
  onChange(item: CardInterface): void
  className?: string
  getCardDisabledStatus(current: 'INLINE' | 'REMOTE' | 'AI', selected: 'INLINE' | 'REMOTE' | 'AI'): boolean
  entityType?: string
}

export function InlineRemoteSelect(props: InlineRemoteSelectProps): React.ReactElement {
  const { selected, getCardDisabledStatus = () => false, onChange, className, entityType = 'Pipeline' } = props
  const { getString } = useStrings()

  const cards = getCards(getString, current => getCardDisabledStatus(current, selected), entityType)
  const selectedCard = cards.find(card => card.type === selected)

  return (
    <CardSelect
      data={cards}
      cornerSelected
      className={className}
      renderItem={(item: CardInterface) => (
        <Layout.Horizontal flex spacing={'small'}>
          {/* StyledProps--color-primary7 */}
          {/* StyledProps--color-grey600 */}
          { item.type === 'AI' ? 
            <><span className='bp3-icon StyledProps--main StyledProps--color' color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_600}><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="55px" height="55px" viewBox="0 0 119.25 122.88"><g><path d="M86.28,104.11c-0.47-0.19-0.98-0.3-1.52-0.3c-0.54,0-1.05,0.11-1.52,0.3c-0.47,0.2-0.9,0.48-1.25,0.84l-0.03,0.02 c-0.2,0.2-0.39,0.43-0.54,0.68c-0.08,0.13-0.16,0.27-0.23,0.42h-6.31v-5.48c-0.97,0.45-1.98,0.79-3.01,1 c-0.18,0.04-0.35,0.07-0.53,0.1v6.14c0,0.49,0.2,0.93,0.52,1.25c0.32,0.32,0.76,0.52,1.25,0.52h8.14c0.06,0.12,0.13,0.24,0.21,0.36 c0.14,0.21,0.3,0.41,0.48,0.59l0.03,0.03c0.36,0.36,0.8,0.66,1.29,0.86c0.47,0.19,0.98,0.3,1.52,0.3c0.52,0,1.03-0.1,1.49-0.29 l0.03-0.01c0.49-0.2,0.92-0.5,1.29-0.86c0.36-0.36,0.66-0.8,0.86-1.29c0.19-0.47,0.3-0.98,0.3-1.52c0-0.53-0.11-1.04-0.3-1.52 c-0.2-0.49-0.5-0.93-0.86-1.29C87.21,104.61,86.77,104.31,86.28,104.11L86.28,104.11z M57.43,66.61h-7.4l-1.06,3.48h-6.66 l7.95-21.12h7.14l7.92,21.12h-6.83L57.43,66.61L57.43,66.61z M56.05,62.03l-2.31-7.59l-2.32,7.59H56.05L56.05,62.03z M67.16,48.96 h6.55v21.12h-6.55V48.96L67.16,48.96z M62.17,27.31c-1.08,0.78-2.08,1.83-2.95,3.19c-0.04,0.07-0.1,0.13-0.17,0.17 c-0.27,0.17-0.63,0.09-0.8-0.17c-0.87-1.36-1.87-2.41-2.95-3.19c-1.16-0.84-2.41-1.37-3.7-1.63l-0.02,0 c-1.26-0.26-2.55-0.26-3.79-0.04c-1.31,0.23-2.58,0.71-3.72,1.37c-1.13,0.66-2.15,1.51-3,2.49c-0.82,0.95-1.48,2.04-1.91,3.21l0,0 c-0.07,0.18-0.13,0.37-0.19,0.57c-0.05,0.18-0.11,0.38-0.15,0.58c-0.05,0.26-0.27,0.45-0.55,0.46c-1.34,0.2-2.67,0.69-3.91,1.42 c-1.26,0.75-2.43,1.77-3.44,2.99c-1,1.22-1.84,2.66-2.44,4.26c-0.56,1.5-0.9,3.15-0.97,4.9c-0.01,0.23-0.01,0.45-0.01,0.68 c0,0.21,0.01,0.43,0.01,0.66c0.01,0.19-0.07,0.39-0.24,0.51c-0.82,0.59-1.56,1.2-2.22,1.83c-0.67,0.65-1.26,1.32-1.77,2.01 c-0.83,1.13-1.44,2.31-1.85,3.5c-0.43,1.24-0.64,2.51-0.66,3.76c-0.01,1.2,0.15,2.39,0.49,3.54c0.34,1.17,0.86,2.31,1.53,3.37l0,0 c0.38,0.61,0.81,1.21,1.28,1.77c0.48,0.57,1,1.11,1.56,1.62c0.14,0.13,0.22,0.34,0.18,0.54c-0.16,0.76-0.24,1.51-0.27,2.25 c-0.02,0.76,0.02,1.51,0.12,2.24c0.19,1.34,0.58,2.62,1.13,3.8c0.58,1.26,1.34,2.41,2.22,3.42c0.85,0.99,1.82,1.85,2.86,2.56 c1.05,0.72,2.16,1.28,3.3,1.67c0.51,0.17,1.03,0.31,1.56,0.41c0.5,0.1,1,0.16,1.49,0.18c0.27-0.01,0.52,0.18,0.58,0.46 c0.26,1.19,0.74,2.31,1.4,3.32c0.69,1.06,1.56,2,2.56,2.78c1.26,0.98,2.74,1.72,4.3,2.11c1.47,0.37,3.02,0.44,4.54,0.12 c1.36-0.28,2.68-0.86,3.9-1.78c1.12-0.85,2.16-1.99,3.03-3.47c0.05-0.09,0.13-0.16,0.23-0.21c0.28-0.15,0.63-0.04,0.78,0.24 c0.72,1.34,1.6,2.41,2.58,3.22c1.06,0.87,2.23,1.46,3.46,1.8c1.57,0.43,3.21,0.43,4.8,0.1c1.7-0.35,3.34-1.09,4.75-2.11 c1.11-0.79,2.09-1.76,2.87-2.86c0.74-1.03,1.29-2.18,1.61-3.39c0.04-0.23,0.22-0.43,0.47-0.47c1.47-0.26,2.92-0.87,4.25-1.78 c1.33-0.91,2.54-2.11,3.53-3.54c0.91-1.32,1.64-2.84,2.11-4.5c0.44-1.55,0.65-3.23,0.58-5c-0.02-0.2,0.07-0.4,0.25-0.52 c0.86-0.59,1.62-1.21,2.3-1.84c0.69-0.66,1.3-1.34,1.82-2.05l0,0c0.8-1.08,1.39-2.2,1.8-3.35c0.42-1.19,0.64-2.4,0.68-3.61 c0.03-1.17-0.11-2.33-0.41-3.47c-0.3-1.15-0.77-2.26-1.38-3.31l-0.02-0.02c-0.4-0.69-0.87-1.35-1.39-1.99 c-0.52-0.64-1.11-1.24-1.74-1.81c-0.15-0.13-0.23-0.34-0.19-0.55c0.14-0.69,0.23-1.38,0.26-2.06c0.03-0.69,0.01-1.37-0.06-2.04 c-0.15-1.39-0.52-2.71-1.06-3.94c-0.57-1.3-1.33-2.5-2.22-3.55c-0.86-1.02-1.85-1.91-2.91-2.65c-1.06-0.74-2.19-1.32-3.34-1.71 l-0.03-0.01c-0.61-0.21-1.23-0.36-1.84-0.46l-0.02,0c-0.6-0.1-1.2-0.14-1.79-0.13c-0.27,0.02-0.53-0.16-0.6-0.44 c-0.1-0.41-0.23-0.81-0.38-1.2c-0.16-0.4-0.34-0.79-0.55-1.18c-0.54-1-1.25-1.92-2.08-2.71c-0.85-0.81-1.82-1.5-2.86-2.03 c-1.07-0.54-2.24-0.92-3.44-1.09c-1.14-0.16-2.31-0.14-3.46,0.1C64.6,25.94,63.33,26.47,62.17,27.31L62.17,27.31z M78.52,38.57 c0.07-0.22,0.27-0.39,0.52-0.41c0.42-0.03,0.85-0.01,1.28,0.06c0.44,0.07,0.88,0.18,1.32,0.33c0.83,0.28,1.66,0.71,2.43,1.25 c0.76,0.53,1.48,1.18,2.1,1.92l0.01,0.02c0.65,0.77,1.2,1.63,1.61,2.57c0.39,0.88,0.65,1.82,0.76,2.81 c0.07,0.66,0.07,1.35-0.01,2.05c-0.07,0.65-0.22,1.32-0.45,1.99l-0.01,0.04c-0.14,0.42-0.13,0.86,0,1.25c0.14,0.4,0.4,0.76,0.77,1 l0.03,0.02c0.7,0.52,1.32,1.09,1.86,1.69c0.56,0.61,1.04,1.27,1.44,1.95c0.44,0.75,0.78,1.53,0.99,2.33 c0.22,0.79,0.32,1.59,0.29,2.38c-0.02,0.82-0.18,1.64-0.47,2.45c-0.28,0.77-0.69,1.53-1.23,2.27l-0.01,0.01 c-0.49,0.67-1.11,1.33-1.84,1.96c-0.7,0.6-1.51,1.17-2.44,1.72l-0.03,0.02c-0.37,0.21-0.64,0.53-0.8,0.9 c-0.16,0.37-0.21,0.78-0.13,1.18l0.01,0.08c0.19,1.53,0.1,2.99-0.21,4.32c-0.34,1.45-0.93,2.75-1.7,3.86 c-0.59,0.85-1.27,1.58-2,2.16c-0.75,0.6-1.56,1.04-2.39,1.31l-0.01,0c-0.3,0.09-0.63-0.08-0.72-0.38 c-1.13-3.69-3.08-4.88-6.38-6.58l-0.07-0.04c-0.46-0.22-0.96-0.24-1.41-0.1c-0.45,0.14-0.84,0.45-1.07,0.9l-0.03,0.06 c-0.22,0.46-0.24,0.96-0.1,1.41c0.15,0.45,0.47,0.85,0.93,1.09c2.76,1.41,4.8,2.48,4.77,5.94c-0.01,1.03-0.33,2.03-0.87,2.93 c-0.57,0.95-1.39,1.8-2.34,2.49c-0.97,0.7-2.06,1.21-3.18,1.46c-1.07,0.25-2.17,0.26-3.2-0.02c-1.74-0.48-2.87-1.64-3.63-3.05 c-0.72-1.34-1.12-2.9-1.41-4.32c-0.02-0.05-0.02-0.11-0.02-0.16c0-0.72-0.56-1.19-1.29-1.4c-0.32-0.1-0.67-0.14-1.01-0.14 c-0.35,0-0.69,0.05-1.01,0.14c-0.72,0.22-1.28,0.69-1.28,1.4c0,0.05-0.01,0.09-0.02,0.14c-0.56,2.22-1.37,3.89-2.32,5.09 c-1.11,1.41-2.41,2.18-3.75,2.46c-0.98,0.2-1.99,0.15-2.95-0.1c-1.01-0.27-1.97-0.76-2.81-1.4c-0.83-0.65-1.52-1.44-2-2.33 c-0.46-0.85-0.73-1.79-0.73-2.75c0-3.64,2.2-4.86,5.11-6.35c0.46-0.24,0.78-0.64,0.93-1.09c0.15-0.46,0.12-0.97-0.11-1.44 c-0.24-0.46-0.64-0.78-1.09-0.93c-0.45-0.14-0.95-0.12-1.41,0.1l-0.03,0.01c-3.43,1.75-5.48,3.03-6.71,6.84 c-0.07,0.25-0.31,0.44-0.58,0.43c-0.34-0.01-0.68-0.05-1.03-0.12c-0.34-0.07-0.68-0.16-1-0.28c-0.81-0.28-1.62-0.69-2.38-1.21 c-0.75-0.52-1.45-1.14-2.07-1.86c-0.64-0.74-1.19-1.57-1.61-2.48c-0.4-0.85-0.68-1.76-0.82-2.71l0-0.02 c-0.1-0.7-0.12-1.43-0.04-2.18c0.07-0.7,0.22-1.43,0.47-2.15l0.01-0.03c0.14-0.41,0.13-0.84,0.01-1.22l-0.01-0.02 c-0.13-0.4-0.39-0.75-0.75-1l-0.02-0.02c-0.64-0.48-1.22-0.99-1.73-1.55c-0.52-0.56-0.98-1.16-1.36-1.78 c-0.46-0.75-0.82-1.55-1.06-2.37c-0.23-0.8-0.35-1.62-0.34-2.46c0.01-0.85,0.16-1.72,0.46-2.57c0.29-0.81,0.71-1.62,1.29-2.41 c0.49-0.67,1.09-1.33,1.81-1.96c0.69-0.61,1.47-1.19,2.37-1.74c0.33-0.2,0.57-0.48,0.73-0.8l0.01-0.03 c0.16-0.33,0.22-0.7,0.17-1.07c-0.01-0.04-0.01-0.08-0.01-0.12l0-0.02c-0.05-0.35-0.08-0.7-0.1-1.04c-0.02-0.37-0.02-0.74-0.01-1.1 c0.05-1.31,0.3-2.54,0.71-3.65c0.44-1.19,1.06-2.26,1.8-3.17c0.61-0.75,1.31-1.38,2.04-1.87c0.73-0.49,1.5-0.84,2.29-1.04l0,0 c0.3-0.09,0.63,0.08,0.72,0.38c0.62,1.96,1.4,3.19,2.89,4.58l0.06,0.05c0.37,0.34,0.85,0.5,1.32,0.48 c0.47-0.02,0.93-0.21,1.27-0.58l0.03-0.04c0.34-0.37,0.5-0.85,0.48-1.32c-0.02-0.47-0.22-0.94-0.6-1.3 c-1.2-1.11-1.47-1.8-1.83-2.92c-0.42-1.29-0.35-2.55,0.06-3.67c0.28-0.77,0.72-1.49,1.28-2.12c0.55-0.63,1.22-1.19,1.96-1.62 l0.03-0.02c0.76-0.44,1.58-0.76,2.43-0.92c0.81-0.15,1.64-0.16,2.45,0.01c1.14,0.24,2.26,0.84,3.25,1.88 c0.87,0.91,1.64,2.17,2.25,3.83l0.01,0.02c0.21,0.65,0.89,1.03,1.69,1.18c0.36,0.07,0.74,0.09,1.11,0.07l0.01,0 c0.38-0.02,0.74-0.09,1.08-0.2c0.6-0.2,1.07-0.52,1.18-0.93v-0.23c0-1.16,0.69-2.39,1.64-3.4c1.04-1.1,2.43-1.97,3.6-2.21 c0.74-0.15,1.49-0.16,2.22-0.05c0.76,0.12,1.5,0.36,2.2,0.71L71.1,30c0.71,0.36,1.36,0.82,1.93,1.36c0.56,0.54,1.04,1.15,1.4,1.82 c0.57,1.05,0.83,2.25,0.65,3.52c-0.16,1.11-0.2,1.81-1.13,2.92l-0.01,0.01c-0.33,0.39-0.47,0.88-0.43,1.36 c0.04,0.46,0.25,0.91,0.62,1.23l0.06,0.05c0.39,0.32,0.87,0.45,1.34,0.41c0.46-0.04,0.91-0.25,1.23-0.62l0.05-0.07 C77.77,40.85,78.08,40.01,78.52,38.57L78.52,38.57z M100.48,87.51c-0.19-0.47-0.3-0.98-0.3-1.52c0-0.54,0.11-1.05,0.3-1.52 c0.2-0.47,0.48-0.9,0.84-1.25l0.02-0.03c0.2-0.2,0.43-0.39,0.68-0.54c0.13-0.08,0.27-0.16,0.42-0.23v-6.31h-7.76 c0.01-0.41,0.01-0.82-0.01-1.24c-0.02-0.23,0.08-0.46,0.28-0.59c0.8-0.55,1.53-1.12,2.19-1.71h7.06c0.49,0,0.93,0.2,1.25,0.52 c0.32,0.32,0.52,0.76,0.52,1.25v8.14c0.12,0.06,0.24,0.13,0.36,0.21c0.21,0.14,0.41,0.3,0.59,0.48l0.03,0.03 c0.36,0.36,0.66,0.8,0.86,1.29c0.19,0.47,0.3,0.98,0.3,1.52c0,0.52-0.1,1.02-0.29,1.49l-0.01,0.03c-0.2,0.49-0.5,0.92-0.86,1.29 c-0.36,0.36-0.8,0.66-1.29,0.86c-0.47,0.19-0.98,0.3-1.52,0.3c-0.53,0-1.04-0.11-1.52-0.3c-0.49-0.2-0.93-0.5-1.29-0.86 C100.98,88.44,100.68,88,100.48,87.51L100.48,87.51z M111.72,67.26h-10.55c0.18-0.39,0.34-0.78,0.48-1.18 c0.28-0.78,0.48-1.57,0.6-2.36h9.47c0.07-0.13,0.14-0.26,0.22-0.39c0.15-0.24,0.33-0.46,0.52-0.65c0.37-0.37,0.8-0.66,1.29-0.86 c0.47-0.19,0.98-0.3,1.52-0.3c0.52,0,1.02,0.1,1.49,0.29l0.03,0.01c0.49,0.2,0.92,0.5,1.29,0.86c0.36,0.36,0.66,0.8,0.86,1.29 c0.19,0.47,0.3,0.98,0.3,1.52c0,0.53-0.11,1.04-0.3,1.52c-0.2,0.49-0.5,0.93-0.86,1.29c-0.36,0.36-0.8,0.66-1.29,0.86 c-0.47,0.19-0.98,0.3-1.52,0.3c-0.52,0-1.02-0.1-1.49-0.29l-0.03-0.01c-0.49-0.2-0.92-0.5-1.29-0.86c-0.19-0.19-0.36-0.4-0.51-0.63 l-0.02-0.03C111.86,67.52,111.79,67.39,111.72,67.26L111.72,67.26z M115.08,57.58h-13.27c-0.34-1.12-0.82-2.21-1.42-3.25 l-0.02-0.03c-0.05-0.09-0.1-0.17-0.15-0.26h13.1V42.49c-0.1-0.06-0.2-0.12-0.3-0.19c-0.2-0.14-0.38-0.29-0.55-0.46 c-0.36-0.36-0.66-0.8-0.86-1.29c-0.19-0.47-0.3-0.98-0.3-1.52c0-0.53,0.11-1.05,0.3-1.52c0.2-0.49,0.5-0.92,0.86-1.29 c0.36-0.36,0.8-0.66,1.29-0.86c0.47-0.19,0.98-0.3,1.52-0.3c0.53,0,1.04,0.11,1.52,0.3c0.49,0.2,0.93,0.5,1.29,0.86 c0.36,0.36,0.66,0.8,0.86,1.29c0.19,0.47,0.3,0.98,0.3,1.52c0,0.52-0.1,1.02-0.29,1.49l-0.01,0.03c-0.2,0.49-0.5,0.92-0.86,1.29 c-0.22,0.22-0.48,0.42-0.75,0.59c-0.15,0.09-0.32,0.18-0.48,0.25v13.12c0,0.49-0.2,0.93-0.52,1.25 C116.01,57.38,115.57,57.58,115.08,57.58L115.08,57.58z M101.21,49.04h-4.52c0.12-0.66,0.19-1.32,0.22-1.98 c0.02-0.53,0.02-1.05-0.01-1.56h2.54v-5.22c-0.14-0.07-0.27-0.14-0.4-0.23c-0.24-0.15-0.46-0.33-0.67-0.54l0,0 c-0.36-0.36-0.66-0.8-0.86-1.29c-0.19-0.47-0.3-0.98-0.3-1.51c0-0.53,0.11-1.04,0.3-1.52c0.2-0.47,0.48-0.9,0.83-1.26l0.03-0.03 c0.36-0.36,0.8-0.66,1.29-0.86c0.47-0.19,0.98-0.3,1.52-0.3c0.54,0,1.05,0.11,1.52,0.3c0.47,0.2,0.9,0.48,1.26,0.84l0.03,0.02 c0.36,0.36,0.65,0.78,0.85,1.26l0.01,0.03c0.19,0.47,0.3,0.98,0.3,1.52c0,0.53-0.11,1.05-0.3,1.52c-0.2,0.47-0.48,0.9-0.83,1.26 l-0.03,0.03c-0.19,0.19-0.4,0.36-0.64,0.52c-0.12,0.08-0.24,0.15-0.37,0.21v7.02c0,0.49-0.2,0.93-0.52,1.25 C102.14,48.84,101.69,49.04,101.21,49.04L101.21,49.04z M31.13,18.77c0.47,0.19,0.98,0.3,1.52,0.3c0.54,0,1.05-0.11,1.52-0.3 c0.47-0.2,0.9-0.48,1.25-0.84l0.03-0.02c0.2-0.2,0.39-0.43,0.54-0.68c0.08-0.13,0.16-0.27,0.23-0.42h6.31v5.45 c1.11-0.59,2.31-1.02,3.54-1.27v-5.95c0-0.49-0.2-0.93-0.52-1.25c-0.32-0.32-0.76-0.52-1.25-0.52h-8.14 c-0.06-0.12-0.13-0.24-0.21-0.36c-0.14-0.21-0.3-0.41-0.48-0.59l-0.03-0.03c-0.36-0.36-0.8-0.66-1.29-0.86 c-0.47-0.19-0.98-0.3-1.52-0.3c-0.52,0-1.03,0.1-1.49,0.29l-0.03,0.01c-0.49,0.2-0.92,0.5-1.29,0.86c-0.36,0.36-0.66,0.8-0.86,1.29 c-0.19,0.47-0.3,0.98-0.3,1.52c0,0.53,0.11,1.04,0.3,1.52c0.2,0.49,0.5,0.93,0.86,1.29C30.21,18.27,30.64,18.57,31.13,18.77 L31.13,18.77z M51.39,7.53v13.66c1.18,0.34,2.33,0.88,3.41,1.66l0.12,0.09c0-0.03,0.01-0.06,0.01-0.09V7.53 c0.13-0.07,0.26-0.14,0.39-0.22c0.24-0.15,0.46-0.33,0.65-0.52c0.36-0.37,0.66-0.8,0.86-1.29c0.19-0.47,0.3-0.98,0.3-1.52 c0-0.52-0.1-1.02-0.29-1.49l-0.01-0.03c-0.2-0.49-0.5-0.92-0.86-1.29c-0.36-0.36-0.8-0.66-1.29-0.86c-0.47-0.19-0.98-0.3-1.52-0.3 c-0.53,0-1.04,0.11-1.52,0.3c-0.49,0.2-0.93,0.5-1.29,0.86c-0.36,0.36-0.66,0.8-0.86,1.29c-0.19,0.47-0.3,0.98-0.3,1.52 c0,0.52,0.1,1.02,0.29,1.49l0.01,0.03c0.2,0.49,0.5,0.92,0.86,1.29c0.19,0.19,0.4,0.36,0.63,0.51L51,7.31 C51.13,7.39,51.25,7.46,51.39,7.53L51.39,7.53z M61.06,4.17v19.98c0.48-0.49,0.99-0.92,1.51-1.3c0.65-0.47,1.33-0.86,2.03-1.16 V5.93h11.55c0.06,0.1,0.12,0.2,0.19,0.3c0.14,0.2,0.29,0.38,0.46,0.55c0.36,0.36,0.8,0.66,1.29,0.86c0.47,0.19,0.98,0.3,1.52,0.3 c0.53,0,1.05-0.11,1.52-0.3c0.49-0.2,0.93-0.5,1.29-0.86c0.36-0.36,0.66-0.8,0.86-1.29c0.19-0.47,0.3-0.98,0.3-1.52 c0-0.53-0.11-1.04-0.3-1.52c-0.2-0.49-0.5-0.93-0.86-1.29C82.04,0.8,81.6,0.5,81.11,0.3C80.64,0.11,80.13,0,79.6,0 c-0.52,0-1.02,0.1-1.49,0.29L78.08,0.3c-0.49,0.2-0.92,0.5-1.29,0.86c-0.22,0.22-0.42,0.48-0.59,0.75 c-0.09,0.15-0.18,0.32-0.25,0.48H62.83c-0.49,0-0.93,0.2-1.25,0.52C61.26,3.24,61.06,3.68,61.06,4.17L61.06,4.17z M69.6,18.04v2.74 c0.36,0.02,0.73,0.05,1.09,0.11c0.84,0.12,1.66,0.33,2.45,0.62v-1.69h5.22c0.07,0.14,0.14,0.27,0.23,0.4 c0.15,0.24,0.33,0.46,0.54,0.67l0,0c0.36,0.36,0.8,0.66,1.29,0.86c0.47,0.19,0.98,0.3,1.51,0.3s1.04-0.11,1.52-0.3 c0.47-0.2,0.9-0.48,1.26-0.83l0.03-0.03c0.36-0.36,0.66-0.8,0.86-1.29c0.19-0.47,0.3-0.98,0.3-1.52c0-0.54-0.11-1.05-0.3-1.52 c-0.2-0.47-0.48-0.9-0.84-1.26l-0.02-0.03c-0.36-0.36-0.78-0.65-1.26-0.85l-0.03-0.01c-0.47-0.19-0.98-0.3-1.52-0.3 c-0.53,0-1.05,0.11-1.52,0.3c-0.47,0.2-0.9,0.48-1.26,0.83l-0.03,0.03c-0.19,0.19-0.36,0.4-0.52,0.64 c-0.08,0.12-0.15,0.24-0.21,0.37h-7.02c-0.49,0-0.93,0.2-1.25,0.52C69.8,17.11,69.6,17.55,69.6,18.04L69.6,18.04z M18.77,35.2 c0.19,0.47,0.3,0.98,0.3,1.52c0,0.54-0.11,1.05-0.3,1.52c-0.2,0.47-0.48,0.9-0.84,1.25l-0.02,0.03c-0.2,0.2-0.43,0.39-0.68,0.54 c-0.13,0.08-0.27,0.16-0.42,0.23v6.31h6.55l0,0.31c0,0.24,0.01,0.49,0.02,0.75c0.02,0.22-0.08,0.44-0.27,0.58 c-0.86,0.61-1.63,1.25-2.33,1.9h-5.72c-0.49,0-0.93-0.2-1.25-0.52c-0.32-0.32-0.52-0.76-0.52-1.25v-8.14 c-0.12-0.06-0.24-0.13-0.36-0.21c-0.21-0.14-0.41-0.3-0.59-0.48l-0.03-0.03c-0.36-0.36-0.66-0.8-0.86-1.29 c-0.19-0.47-0.3-0.98-0.3-1.52c0-0.52,0.1-1.02,0.29-1.49l0.01-0.03c0.2-0.49,0.5-0.92,0.86-1.29c0.36-0.36,0.8-0.66,1.29-0.86 c0.47-0.19,0.98-0.3,1.52-0.3c0.53,0,1.04,0.11,1.52,0.3c0.49,0.2,0.93,0.5,1.29,0.86C18.27,34.27,18.57,34.71,18.77,35.2 L18.77,35.2z M7.53,55.45h9.4c-0.16,0.36-0.3,0.73-0.43,1.09c-0.28,0.81-0.48,1.62-0.6,2.44H7.53c-0.07,0.13-0.14,0.26-0.22,0.39 c-0.15,0.24-0.33,0.46-0.52,0.65c-0.37,0.37-0.8,0.66-1.29,0.86c-0.47,0.19-0.98,0.3-1.52,0.3c-0.52,0-1.02-0.1-1.49-0.29 l-0.03-0.01c-0.49-0.2-0.92-0.5-1.29-0.86c-0.36-0.36-0.66-0.8-0.86-1.29c-0.19-0.47-0.3-0.98-0.3-1.52c0-0.53,0.11-1.04,0.3-1.52 c0.2-0.49,0.5-0.93,0.86-1.29c0.36-0.36,0.8-0.66,1.29-0.86c0.47-0.19,0.98-0.3,1.52-0.3c0.52,0,1.02,0.1,1.49,0.29l0.03,0.01 c0.49,0.2,0.92,0.5,1.29,0.86c0.19,0.19,0.36,0.4,0.51,0.63l0.02,0.03C7.39,55.19,7.46,55.32,7.53,55.45L7.53,55.45z M4.17,65.13 H16.4c0.38,1.21,0.93,2.38,1.63,3.49l0,0.01l0.02,0.04H5.93v11.55c0.1,0.06,0.2,0.12,0.3,0.19c0.2,0.14,0.38,0.29,0.55,0.46 c0.36,0.36,0.66,0.8,0.86,1.29c0.19,0.47,0.3,0.98,0.3,1.52c0,0.53-0.11,1.05-0.3,1.52c-0.2,0.49-0.5,0.92-0.86,1.29 c-0.36,0.36-0.8,0.66-1.29,0.86c-0.47,0.19-0.98,0.3-1.52,0.3c-0.53,0-1.04-0.11-1.52-0.3c-0.49-0.2-0.93-0.5-1.29-0.86 C0.8,86.1,0.5,85.66,0.3,85.18C0.11,84.71,0,84.2,0,83.66c0-0.52,0.1-1.02,0.29-1.49l0.01-0.03c0.2-0.49,0.5-0.92,0.86-1.29 c0.22-0.22,0.48-0.42,0.75-0.59c0.15-0.09,0.32-0.18,0.48-0.25V66.89c0-0.49,0.2-0.93,0.52-1.25C3.24,65.33,3.68,65.13,4.17,65.13 L4.17,65.13z M18.04,73.67h3.3c-0.11,0.66-0.17,1.31-0.19,1.95c-0.02,0.54-0.01,1.07,0.03,1.59h-1.37v5.22 c0.14,0.07,0.27,0.14,0.4,0.23c0.24,0.15,0.46,0.33,0.67,0.54l0,0c0.36,0.36,0.66,0.8,0.86,1.29c0.19,0.47,0.3,0.98,0.3,1.52 s-0.11,1.04-0.3,1.52c-0.2,0.47-0.48,0.9-0.83,1.26l-0.03,0.03c-0.36,0.36-0.8,0.66-1.29,0.86c-0.47,0.19-0.98,0.3-1.52,0.3 c-0.54,0-1.05-0.11-1.52-0.3c-0.47-0.2-0.9-0.48-1.26-0.84l-0.03-0.02c-0.36-0.36-0.65-0.78-0.85-1.26l-0.01-0.03 c-0.19-0.47-0.3-0.98-0.3-1.52c0-0.53,0.11-1.05,0.3-1.52c0.2-0.47,0.48-0.9,0.83-1.26l0.03-0.03c0.19-0.19,0.4-0.36,0.64-0.52 c0.12-0.08,0.24-0.15,0.37-0.21v-7.02c0-0.49,0.2-0.93,0.52-1.25C17.11,73.86,17.55,73.67,18.04,73.67L18.04,73.67z M66.03,115.35 v-13.99c-1.25-0.39-2.43-1.02-3.51-1.91l-0.02-0.02v15.93c-0.13,0.07-0.26,0.14-0.39,0.22c-0.24,0.15-0.46,0.33-0.65,0.52 c-0.36,0.37-0.66,0.8-0.86,1.29c-0.19,0.47-0.3,0.98-0.3,1.52c0,0.52,0.1,1.02,0.29,1.49l0.01,0.03c0.2,0.49,0.5,0.92,0.86,1.29 c0.36,0.36,0.8,0.66,1.29,0.86c0.47,0.19,0.98,0.3,1.52,0.3c0.53,0,1.04-0.11,1.52-0.3c0.49-0.2,0.93-0.5,1.29-0.86 c0.36-0.36,0.66-0.8,0.86-1.29c0.19-0.47,0.3-0.98,0.3-1.52c0-0.52-0.1-1.02-0.29-1.49l-0.01-0.03c-0.2-0.49-0.5-0.92-0.86-1.29 c-0.19-0.19-0.4-0.36-0.63-0.51l-0.03-0.02C66.29,115.49,66.16,115.42,66.03,115.35L66.03,115.35z M56.35,118.71V98.55 c-0.42,0.43-0.86,0.81-1.32,1.16c-0.71,0.54-1.45,0.97-2.22,1.31v15.94H41.26c-0.06-0.1-0.12-0.2-0.19-0.3 c-0.14-0.2-0.29-0.38-0.46-0.55c-0.36-0.36-0.8-0.66-1.29-0.86c-0.47-0.19-0.98-0.3-1.52-0.3c-0.53,0-1.05,0.11-1.52,0.3 c-0.49,0.2-0.92,0.5-1.29,0.86c-0.36,0.36-0.66,0.8-0.86,1.29c-0.19,0.47-0.3,0.98-0.3,1.52c0,0.53,0.11,1.04,0.3,1.52 c0.2,0.49,0.5,0.93,0.86,1.29c0.36,0.36,0.8,0.66,1.29,0.86c0.47,0.19,0.98,0.3,1.52,0.3c0.52,0,1.02-0.1,1.49-0.29l0.03-0.01 c0.49-0.2,0.92-0.5,1.29-0.86c0.22-0.22,0.42-0.48,0.59-0.75c0.09-0.15,0.18-0.32,0.25-0.48h13.12c0.49,0,0.93-0.2,1.25-0.52 C56.15,119.64,56.35,119.2,56.35,118.71L56.35,118.71z M47.81,104.84v-2.91c-0.78-0.04-1.56-0.16-2.32-0.35 c-0.41-0.1-0.82-0.23-1.22-0.37v1.87h-5.22c-0.07-0.14-0.14-0.27-0.23-0.4c-0.15-0.24-0.33-0.46-0.54-0.67l0,0 c-0.36-0.36-0.8-0.66-1.29-0.86c-0.47-0.19-0.98-0.3-1.51-0.3c-0.53,0-1.04,0.11-1.52,0.3c-0.47,0.2-0.9,0.48-1.26,0.83L32.67,102 c-0.36,0.36-0.66,0.8-0.86,1.29c-0.19,0.47-0.3,0.98-0.3,1.52c0,0.54,0.11,1.05,0.3,1.52c0.2,0.47,0.48,0.9,0.84,1.26l0.02,0.03 c0.36,0.36,0.78,0.65,1.26,0.85l0.03,0.01c0.47,0.19,0.98,0.3,1.52,0.3c0.53,0,1.04-0.11,1.52-0.3c0.47-0.2,0.9-0.48,1.26-0.83 l0.03-0.03c0.19-0.19,0.36-0.4,0.52-0.64c0.08-0.12,0.15-0.24,0.21-0.37h7.02c0.49,0,0.93-0.2,1.25-0.52 C47.61,105.77,47.81,105.33,47.81,104.84L47.81,104.84z" /></g></svg></span>
            <Container>
            <Text
              font={{ variation: FontVariation.FORM_TITLE }}
              color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.title}
            </Text>
            <Text>{item.info}</Text>
          </Container><LabelComponent />
          </>
          : <>
          <Icon name={item.icon} size={item.size} color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_600} />
          <Container className={selected === 'AI' ? 'hide-option' : 'show-option'}>
          <Text
            font={{ variation: FontVariation.FORM_TITLE }}
            color={selected === item.type ? Color.PRIMARY_7 : Color.GREY_800}
          >
            {item.title}
          </Text>
          <Text>{item.info}</Text>
        </Container>
        </>
      }
          
        </Layout.Horizontal>
      )}
      selected={selectedCard}
      onChange={onChange}
    />
  )
}
