/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useLayoutEffect, useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { defaultTo } from 'lodash-es'
import { Button, ButtonSize, ButtonVariation, Container, Layout } from '@wings-software/uicore'
import Draggable from 'react-draggable'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { LEFT_TEXTFIELD_WIDTH } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import type { SliderAspects, TimelineSliderProps } from './TimelineSlider.types'
import TimelineSliderHandle from './components/TimelineSliderHandle/TimelineSliderHandle'
import {
  calculateLeftHandleDragEndData,
  calculateRightHandleBounds,
  calculateRightHandleDragEndData,
  calculateSliderAspectsOnDrag,
  calculateSliderAspectsOnLeftHandleDrag,
  calculateSliderAspectsOnRightHandleDrag,
  calculateSliderDragEndData,
  determineSliderPlacementForClick,
  isLeftHandleWithinBounds,
  isSliderWithinBounds
} from './TimelineSlider.utils'
import {
  INITIAL_RIGHT_SLIDER_OFFSET,
  LEFT_SLIDER_BOUNDS,
  LEFT_SLIDER_OFFSET,
  MAGNIFYING_GLASS_BOUNDS
} from './TimelineSlider.constants'
import css from './TimelineSlider.module.scss'

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  initialSliderWidth,
  className,
  containerWidth: initialContainerWidth,
  leftContainerOffset = 0,
  minSliderWidth,
  onSliderDragEnd,
  infoCard,
  resetFocus,
  maxSliderWidth,
  hideSlider,
  onZoom
}) => {
  const { getString } = useStrings()
  const mainRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [{ width, leftOffset, rightHandlePosition, leftHandlePosition, onClickTransition }, setSliderAspects] =
    useState<SliderAspects>({
      width: initialSliderWidth,
      leftOffset: 0,
      rightHandlePosition: initialSliderWidth - INITIAL_RIGHT_SLIDER_OFFSET,
      leftHandlePosition: LEFT_SLIDER_OFFSET
    })

  const handleSliderClick = useCallback(
    (parentClickEvent: MouseEvent): void => {
      /* istanbul ignore else */ if (mainRef.current) {
        const updatedSliderAspects = determineSliderPlacementForClick({
          clickEventX: parentClickEvent.clientX,
          containerOffset: mainRef.current.getBoundingClientRect().x,
          containerWidth,
          sliderAspects: { width, leftOffset, rightHandlePosition, leftHandlePosition },
          isSliderHidden: hideSlider
        })

        /* istanbul ignore else */ if (updatedSliderAspects) {
          setSliderAspects(updatedSliderAspects)
          onSliderDragEnd?.(calculateSliderDragEndData(updatedSliderAspects, parentClickEvent, containerWidth))
        }
      }
    },
    [containerWidth, hideSlider, leftHandlePosition, leftOffset, onSliderDragEnd, rightHandlePosition, width]
  )

  useLayoutEffect(() => {
    /* istanbul ignore else */ if (mainRef.current) {
      if (initialContainerWidth) {
        setContainerWidth(mainRef.current.getBoundingClientRect().width)
      } else {
        setContainerWidth(
          defaultTo(mainRef.current.parentElement?.getBoundingClientRect().width, 0) - leftContainerOffset
        )
      }
    }
  }, [initialContainerWidth, leftContainerOffset])

  useLayoutEffect(() => {
    const ref = mainRef

    if (ref.current && hideSlider) {
      ref.current.parentNode?.addEventListener('click', handleSliderClick as EventListener, {
        once: true
      })
    }

    return () => {
      ref.current?.parentNode?.removeEventListener('click', handleSliderClick as EventListener, false)
    }
  }, [handleSliderClick, hideSlider])

  useEffect(() => {
    if (hideSlider) {
      setSliderAspects({
        width: initialSliderWidth,
        leftOffset: 0,
        rightHandlePosition: initialSliderWidth - INITIAL_RIGHT_SLIDER_OFFSET,
        leftHandlePosition: LEFT_SLIDER_OFFSET
      })
    }
  }, [hideSlider, initialSliderWidth])

  const containerStyles = useMemo(
    () => ({ width: initialContainerWidth, left: leftContainerOffset }),
    [initialContainerWidth, leftContainerOffset]
  )

  if (hideSlider) {
    return <div ref={mainRef} className={cx(css.main, className)} style={containerStyles} />
  }

  return (
    <div ref={mainRef} className={cx(css.main, className)} style={containerStyles}>
      <Container className={css.mask} width={leftOffset} onClick={e => handleSliderClick(e as unknown as MouseEvent)} />
      <Container
        className={css.sliderContainer}
        width={width}
        style={{ left: leftOffset, transition: onClickTransition }}
        onClick={e => e.stopPropagation()}
      >
        {infoCard && (
          <Container className={cx(css.card, { [css.reverseCard]: leftOffset < LEFT_TEXTFIELD_WIDTH })}>
            {infoCard}
            <Layout.Horizontal className={css.cardFooter} spacing="xsmall">
              <Button
                text={getString('reset')}
                size={ButtonSize.SMALL}
                variation={ButtonVariation.LINK}
                onClick={resetFocus}
              />
              {onZoom && (
                <Button
                  text={getString('cv.zoom')}
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.SECONDARY}
                  onClick={onZoom}
                />
              )}
            </Layout.Horizontal>
          </Container>
        )}
        <TimelineSliderHandle
          className={css.leftHandle}
          bounds={LEFT_SLIDER_BOUNDS}
          defaultPosition={{ x: leftHandlePosition, y: 0 }}
          onDragEnd={e => {
            onSliderDragEnd?.(
              calculateLeftHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                e as MouseEvent,
                containerWidth
              )
            )
          }}
          onDrag={e => {
            const draggableEvent = e as MouseEvent
            if (isLeftHandleWithinBounds({ draggableEvent, leftOffset, minSliderWidth, width, maxSliderWidth })) {
              setSliderAspects(currAspects => calculateSliderAspectsOnLeftHandleDrag(currAspects, draggableEvent))
            }
          }}
        />
        <Draggable
          axis="x"
          bounds={MAGNIFYING_GLASS_BOUNDS}
          onStop={e => {
            onSliderDragEnd?.(
              calculateSliderDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                e as MouseEvent,
                containerWidth
              )
            )
          }}
          onDrag={e => {
            const draggableEvent = e as MouseEvent
            if (isSliderWithinBounds({ draggableEvent, leftOffset, width, containerWidth })) {
              setSliderAspects(currAspects => calculateSliderAspectsOnDrag(currAspects, draggableEvent))
            }
          }}
        >
          <div className={css.magnifyingGlass} />
        </Draggable>
        <TimelineSliderHandle
          className={css.rightHandle}
          position={{ x: rightHandlePosition, y: 0 }}
          bounds={calculateRightHandleBounds(
            { width, leftHandlePosition, leftOffset, rightHandlePosition },
            containerWidth,
            minSliderWidth,
            maxSliderWidth
          )}
          onDragEnd={(_, dragData) => {
            onSliderDragEnd?.(
              calculateRightHandleDragEndData(
                { width, leftHandlePosition, leftOffset, rightHandlePosition },
                dragData,
                containerWidth
              )
            )
          }}
          onDrag={(e, dragData) => {
            const draggableEvent = e as MouseEvent
            if (draggableEvent.movementX === 0) return
            setSliderAspects(currAspects => calculateSliderAspectsOnRightHandleDrag(currAspects, dragData))
          }}
        />
      </Container>
      <Container
        onClick={e => handleSliderClick(e as unknown as MouseEvent)}
        className={css.mask}
        width={containerWidth - leftOffset - width}
        style={{ left: leftOffset + width }}
      />
    </div>
  )
}

export default TimelineSlider
