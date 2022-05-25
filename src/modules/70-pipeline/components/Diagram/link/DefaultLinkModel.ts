/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  LabelModel,
  LinkModel,
  LinkModelGenerics,
  LinkModelListener,
  PortModel,
  PortModelAlignment
} from '@projectstorm/react-diagrams-core'
import { Point } from '@projectstorm/geometry'
import type { BaseEntityEvent, BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core'
import { Event } from '@pipeline/utils/PipelineStudioUtils'
import { DefaultLabelModel } from '../label/DefaultLabelModel'
import { DiagramType } from '../Constants'

export interface DefaultLinkModelListener extends LinkModelListener {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  colorChanged?(event: BaseEntityEvent<DefaultLinkModel> & { color: null | string }): void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  widthChanged?(event: BaseEntityEvent<DefaultLinkModel> & { width: 0 | number }): void
}

export interface DefaultLinkModelOptions extends BaseModelOptions {
  width?: number
  color?: string
  selectedColor?: string
  curvyness?: number
  strokeDasharray?: number
  type?: string
  maxLinePartLength?: { type: 'in' | 'out'; size: number }
  allowAdd?: boolean
  testName?: string
  curve?: number
}

export interface DefaultLinkModelGenerics extends LinkModelGenerics {
  LISTENER: DefaultLinkModelListener
  OPTIONS: DefaultLinkModelOptions
}

export class DefaultLinkModel extends LinkModel<DefaultLinkModelGenerics> {
  constructor(options: DefaultLinkModelOptions = {}) {
    super({
      type: DiagramType.Default,
      width: options.width || 2,
      curve: options.curve || 12,
      strokeDasharray: options.strokeDasharray ?? 0,
      allowAdd: options.allowAdd || true,
      color: options.color || 'var(--diagram-link)',
      selectedColor: options.selectedColor || 'var(--diagram-hover-link-color)',
      curvyness: 50,
      ...options
    })
  }

  calculateControlOffset(port: PortModel): [number, number] {
    if (port.getOptions().alignment === PortModelAlignment.RIGHT) {
      return [this.options.curvyness || 0, 0]
    } else if (port.getOptions().alignment === PortModelAlignment.LEFT) {
      return [-(this.options.curvyness || 0), 0]
    } else if (port.getOptions().alignment === PortModelAlignment.TOP) {
      return [0, -(this.options.curvyness || 0)]
    }
    return [0, this.options.curvyness || 0]
  }

  setColorOfLink(color: string): void {
    this.options.color = color
  }

  getSVGPath(): string | undefined {
    if (this.points.length == 2) {
      const firstPoint = this.getFirstPoint().clone().getPosition()
      firstPoint.x += 3
      const lastPoint = this.getLastPoint().clone().getPosition()
      lastPoint.x -= 3
      if (Math.abs(firstPoint.y - lastPoint.y) > 3 && this.options.curve) {
        const diameter = this.options.curve * 2
        const topToBottom = lastPoint.y - firstPoint.y > 0
        let middlePoint = (firstPoint.x + lastPoint.x) / 2
        if (this.options.maxLinePartLength) {
          middlePoint =
            this.options.maxLinePartLength.type === 'in'
              ? firstPoint.x + this.options.maxLinePartLength.size
              : lastPoint.x - this.options.maxLinePartLength.size
        }
        const midX = new Point(middlePoint, firstPoint.y)
        const midX1 = new Point(midX.x - diameter, midX.y)
        const midX2 = topToBottom ? new Point(midX.x, midX.y + diameter) : new Point(midX.x, midX.y - diameter)
        const midY = new Point(midX.x, lastPoint.y)
        const midY1 = topToBottom
          ? new Point(midX.x, lastPoint.y - diameter)
          : new Point(midX.x, lastPoint.y + diameter)
        const midY2 = new Point(midX.x + diameter, lastPoint.y)
        return `M${firstPoint.toSVG()} L${midX1.toSVG()} Q${midX.toSVG()} ${midX2.toSVG()} L${midY1.toSVG()} Q${midY.toSVG()} ${midY2.toSVG()} L${lastPoint.toSVG()}`
      }
      return `M${firstPoint.toSVG()} L${lastPoint.toSVG()}`
    }
  }

  serialize(): any {
    return {
      ...super.serialize(),
      width: this.options.width,
      color: this.options.color,
      curvyness: this.options.curvyness,
      selectedColor: this.options.selectedColor
    }
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event)
    this.options.color = event.data.color
    this.options.width = event.data.width
    this.options.curvyness = event.data.curvyness
    this.options.selectedColor = event.data.selectedColor
  }

  addLabel(label: LabelModel | string): void {
    if (label instanceof LabelModel) {
      return super.addLabel(label)
    }
    const labelOb = new DefaultLabelModel()
    labelOb.setLabel(label)
    return super.addLabel(labelOb)
  }

  setWidth(width: number): void {
    this.options.width = width
    this.fireEvent({ width }, Event.widthChanged)
  }

  setColor(color: string): void {
    this.options.color = color
    this.fireEvent({ color }, Event.colorChanged)
  }
}
