import type React from 'react'
import type { FieldArrayRenderProps } from 'formik'
import css from './DragHelper.module.scss'

export const onDragStart = (event: React.DragEvent<HTMLDivElement>, index: number): void => {
  event.dataTransfer.setData('data', index.toString())
  event.currentTarget.classList.add(css.dragging)
}

export const onDragEnd = (event: React.DragEvent<HTMLDivElement>): void => {
  event.currentTarget.classList.remove(css.dragging)
}

export const onDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
  event.currentTarget.classList.remove(css.dragOver)
}

export const onDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  event.currentTarget.classList.add(css.dragOver)
  event.dataTransfer.dropEffect = 'move'
}

export const onDrop = (
  event: React.DragEvent<HTMLDivElement>,
  arrayHelpers: FieldArrayRenderProps,
  droppedIndex: number
): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  const data = event.dataTransfer.getData('data')
  if (data) {
    const index = parseInt(data, 10)
    arrayHelpers.swap(index, droppedIndex)
  }
  event.currentTarget.classList.remove(css.dragOver)
}
