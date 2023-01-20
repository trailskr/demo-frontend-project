import { RingBuffer } from 'ring-buffer-ts'
import { Ref } from 'vue'

import { throttleRequestAnimationFrame } from '@/utils/utils'

import { Point2D } from './Point2D'
import { Transform2D } from './Transform2D'

export enum PointerMethod {
  Default = 'default',
  Pan = 'pan',
  PanInertia = 'pan-inertia',
  Click = 'click',
  Copy = 'copy',
  Cross = 'cross',
  NotAllowed = 'not-allowed',
  Drag = 'drag',
  ResizeRow = 'resize-row',
  ResizeCol = 'resize-col',
  ResizeN = 'resize-n',
  ResizeE = 'resize-e',
  ResizeNESW = 'resize-nesw',
  ResizeNWSE = 'resize-nwse',
  Text = 'text'
}

export const pointerMethodCursorMap = {
  [PointerMethod.Default]: 'default',
  [PointerMethod.Pan]: 'grab',
  [PointerMethod.PanInertia]: 'grab',
  [PointerMethod.Click]: 'pointer',
  [PointerMethod.Copy]: 'copy',
  [PointerMethod.Cross]: 'crosshair',
  [PointerMethod.NotAllowed]: 'not-allowed',
  [PointerMethod.Drag]: 'all-scroll',
  [PointerMethod.ResizeRow]: 'row-resize',
  [PointerMethod.ResizeCol]: 'col-resize',
  [PointerMethod.ResizeN]: 'n-resize',
  [PointerMethod.ResizeE]: 'e-resize',
  [PointerMethod.ResizeNESW]: 'nesw-resize',
  [PointerMethod.ResizeNWSE]: 'nwse-resize',
  [PointerMethod.Text]: 'text'
}

const dragCursors = new Set<PointerMethod>([
  PointerMethod.Cross,
  PointerMethod.Drag,
  PointerMethod.ResizeRow,
  PointerMethod.ResizeCol,
  PointerMethod.ResizeN,
  PointerMethod.ResizeE,
  PointerMethod.ResizeNESW,
  PointerMethod.ResizeNWSE
])

const isDragPointerMethod = (pointerMethod?: PointerMethod): boolean => {
  if (!pointerMethod) return false
  return dragCursors.has(pointerMethod)
}

const isPanPointerMethod = (pointerMethod?: PointerMethod): boolean => {
  return pointerMethod === PointerMethod.Pan || pointerMethod === PointerMethod.PanInertia
}

export type PointerCheckHandler = (point: Point2D, overEvent: PointerEvent | undefined, downEvent: PointerEvent | undefined) => PointerMethod | undefined

/**
 * If returns true - happens stopPropagation, preventDefault
 */
export type ClickHandler = (point: Point2D) => true | void

/**
 * If returns true - will be started drag process
 */
export type PointerDownHandler = (point: Point2D) => true | void

/**
 * If returns false - drag process is stopped
 */
export type DragHandler = (dragDiff: Point2D, leftTop: Point2D) => false | void

export enum WheelMode {
  Zoom = 'zoom',
  Scroll = 'scroll'
}

export type WheelHandler = (e: WheelEvent) => WheelMode | undefined

export type DragStartHandler = () => void
export type DragEndHandler = () => void

export type ZoomControllerZoomOptions = {
    minZoom?: number
    maxZoom?: number
    zoomFactor?: number
} | {
  zooms: number[]
}

interface DonwEventInfo {
  event: PointerEvent
  downScreenPos: Point2D
  moveScreenPos: Point2D // only used with 2 pointers guestures
}

export type ZoomControllerOptions = {
    transform: Ref<Transform2D>
    convertTransform?: (transform: Transform2D) => Transform2D
    onPointerCheck?: PointerCheckHandler
    onClick?: ClickHandler
    onDoubleClick?: ClickHandler
    onPointerDown?: PointerDownHandler
    onWheel?: WheelHandler
    onDrag?: DragHandler
    onDragStart?: DragStartHandler
    onDragEnd?: DragEndHandler
    scale?: number
    panFriction?: number
} & ZoomControllerZoomOptions

export class PanZoomDragController {
  private el?: HTMLElement
  private onDispose?: () => void
  // internal real-time transform data
  private _innerTransform: Transform2D
  // will be set throttled after next request animation frame to reduce render count
  // linked with opts.tranform
  private _transform: Ref<Transform2D>
  private convertTransform: (transform: Transform2D) => Transform2D
  private downEvents: Map<number, DonwEventInfo> = new Map()
  private prevPinchRange = 0
  private prevPinchCenter = new Point2D(0, 0)
  private pan?: RingBuffer<Point2D> // In screen space
  private panSpeed = new Point2D(0, 0)
  private panFriction: number
  private animationId: number | undefined
  private inertia = false
  private drag?: Point2D // In reprojected space
  public readonly minZoom: number
  public readonly maxZoom: number
  public readonly zoomFactor: number
  public readonly zooms?: number[]
  private zoomIndex: number
  private scale: number

  public onMount?: () => void
  public onTransformChange?: (t: Transform2D) => void

  private readonly onPointerCheck: PointerCheckHandler
  private readonly onClick?: ClickHandler
  private readonly onDoubleClick?: ClickHandler
  private readonly onPointerDown?: PointerDownHandler
  private readonly onWheel?: WheelHandler
  private readonly onDrag?: DragHandler
  private readonly onDragStart?: DragStartHandler // Shot on drag move and drag resize events
  private readonly onDragEnd?: DragEndHandler

  constructor (opts: ZoomControllerOptions) {
    if ('zooms' in opts) {
      if (opts.zooms.length === 0) throw new Error('zooms array is empty')
      this.zooms = opts.zooms
      this.minZoom = 0
      this.maxZoom = 0
      this.zoomFactor = 2
    } else {
      if (opts.minZoom != null && opts.minZoom < 0) throw new Error('minZoom should be greater than 0')
      if (opts.maxZoom != null && opts.maxZoom < 1) throw new Error('maxZoom should be greater than 1')
      if (opts.zoomFactor != null && opts.zoomFactor < 1) throw new Error('minZoom should be greater than 1')

      this.minZoom = opts.minZoom != null ? opts.minZoom : 1 / 16
      this.maxZoom = opts.maxZoom != null ? opts.maxZoom : Infinity
      this.zoomFactor = opts.zoomFactor != null ? opts.zoomFactor : 2
    }
    this._transform = opts.transform
    this._innerTransform = opts.transform.value
    this.convertTransform = opts.convertTransform ?? ((t) => t)

    this.onPointerCheck = opts.onPointerCheck != null ? opts.onPointerCheck : () => undefined
    this.onClick = opts.onClick
    this.onDoubleClick = opts.onDoubleClick
    this.onPointerDown = opts.onPointerDown
    this.onWheel = opts.onWheel
    this.onDrag = opts.onDrag
    this.onDragStart = opts.onDragStart
    this.onDragEnd = opts.onDragEnd
    this.zoomIndex = this.getCorrectZoomIndex(this._innerTransform.k)
    this.scale = opts.scale ?? 1
    this.panFriction = opts.panFriction ?? 15
  }

  private getCorrectZoomIndex (k: number): number {
    if (!this.zooms) return -1
    const zoomRelations = this.zooms.map((zoom, index) => [zoom / k, index])
    return zoomRelations.reduce((pair1, pair2) => {
      return Math.abs(1 - pair1[0]) < Math.abs(1 - pair2[0]) ? pair1 : pair2
    })[1]
  }

  public mount (el: HTMLElement) {
    this.dispose()

    this.el = el

    document.addEventListener('pointermove', this._onPointerMove)
    document.addEventListener('pointerup', this._onPointerUp)
    document.addEventListener('pointerdown', this._onPointerDown)
    document.addEventListener('dblclick', this._onDoubleClick)
    el.addEventListener('wheel', this._onWheel)
    const unwatchTransform = watch(this._transform, (transform) => {
      this._innerTransform = transform
    }, { immediate: true })

    this.onDispose = () => {
      document.removeEventListener('pointermove', this._onPointerMove)
      document.removeEventListener('pointerup', this._onPointerUp)
      document.removeEventListener('pointerdown', this._onPointerDown)
      document.removeEventListener('dblclick', this._onDoubleClick)
      el.removeEventListener('wheel', this._onWheel)
      unwatchTransform()

      this.el = undefined
    }

    this.onMount?.()
  }

  public isMounted (): boolean {
    return !!this.el
  }

  public dispose () {
    if (this.onDispose) {
      this.onDispose()
      this.onDispose = undefined
    }
  }

  public isDisposed () {
    return !!this.onDispose
  }

  public zoomIn (origin?: Point2D): boolean {
    if (this.zooms != null) return this.shiftZoomIndex(1, origin)
    return this.zoom(this.zoomFactor, origin)
  }

  public zoomOut (origin?: Point2D): boolean {
    if (this.zooms != null) return this.shiftZoomIndex(-1, origin)
    return this.zoom(1 / this.zoomFactor, origin)
  }

  private shiftZoomIndex (zoomShift: number, origin?: Point2D): boolean {
    if (!this.zooms || !this.el) return false
    if (zoomShift > 0 && !this.isZoomInAllowed()) return false
    if (zoomShift < 0 && !this.isZoomOutAllowed()) return false
    this.zoomIndex += zoomShift
    if (!origin) origin = new Point2D(this.el.clientWidth * this.scale / 2, this.el.clientHeight * this.scale / 2)
    this.setZoomPreserveOrigin(origin, this.zooms[this.zoomIndex])
    return true
  }

  /**
   * @param zoom - New zoom
   * @param origin - Translate relative to left top angle.
   *   After zoom this point will remain on the same place on the screen
   */
  public setZoom (zoom: number, origin?: Point2D): boolean {
    if (!this.el) return false
    if (!origin) origin = new Point2D(this.el.clientWidth * this.scale / 2, this.el.clientHeight * this.scale / 2)
    this.setZoomPreserveOrigin(origin, zoom)
    this.zoomIndex = this.getCorrectZoomIndex(this._innerTransform.k)
    return true
  }

  /**
   * @param factor - Zoom factor
   * @param origin - Translate relative to left top angle.
   *   After zoom this point will remain on the same place on the screen
   */
  public zoom (factor: number, origin?: Point2D): boolean {
    if (!this.el || factor === 1) return false
    if (!origin) origin = new Point2D(this.el.clientWidth * this.scale / 2, this.el.clientHeight * this.scale / 2)
    if (factor > 1 && !this.isZoomInAllowed()) return false
    if (factor < 1 && !this.isZoomOutAllowed()) return false
    if (this.zooms != null) {
      this.zoomIndex += factor > 1 ? 1 : -1
    } else {
      this.zoomPreserveOrigin(origin, factor)
    }

    return true
  }

  private setTransformThrottled = throttleRequestAnimationFrame((transform: Transform2D) => {
    this._transform.value = transform
  })[0]

  private setTransform (transform: Transform2D) {
    const newTransform = this.convertTransform(transform)
    this._innerTransform = newTransform
    this.setTransformThrottled(newTransform)
    this.onTransformChange?.(newTransform)
  }

  private zoomPreserveOrigin (origin: Point2D, k: number) {
    const t = this._innerTransform
    this.setTransform(
      t
        .translate(-origin.x, -origin.y) // Translate to center
        .scale(k)
        .translate(origin.x, origin.y)
    )
  }

  private setZoomPreserveOrigin (origin: Point2D, k: number) {
    const t = this._innerTransform
    this.setTransform(
      t
        .translate(-origin.x, -origin.y) // Translate to center
        .withScale(k)
        .translate(origin.x, origin.y)
    )
  }

  public isZoomInAllowed () {
    if (this.zooms != null) return this.zoomIndex < this.zooms.length - 1
    return this._innerTransform.k < this.maxZoom
  }

  public isZoomOutAllowed () {
    if (this.zooms != null) return this.zoomIndex > 0
    return this._innerTransform.k > this.minZoom
  }

  public get transform (): Transform2D {
    return this._transform.value
  }

  public set transform (transform: Transform2D) {
    this.setTransform(transform)
  }

  private createDownEventInfo (event: PointerEvent): DonwEventInfo {
    const leftTop = this.createEventScreenPoint(event)
    return { event, downScreenPos: leftTop, moveScreenPos: leftTop }
  }

  private createEventScreenPoint (e: PointerEvent) {
    return new Point2D(e.clientX * this.scale, e.clientY * this.scale)
  }

  private setCursor (pointerMethod: PointerMethod) {
    if (!this.el) return
    const cursor = pointerMethodCursorMap[pointerMethod]
    if (this.el.style.cursor !== cursor) {
      this.el.style.cursor = cursor
    }
  }

  private processPan (e: PointerEvent, inertia: boolean) {
    this.pan = this.pan ?? new RingBuffer(5)
    this.pan.add(this.createEventScreenPoint(e))
    this.inertia = inertia
    this.panSpeed = new Point2D(0, 0)
  }

  private startPanInertia (lastPoints: Point2D[]) {
    if (this.animationId != null) window.cancelAnimationFrame(this.animationId)
    const speeds: Point2D[] = []
    let prevPoint = lastPoints[lastPoints.length - 1]
    for (let i = lastPoints.length - 2; i >= 0; i--) {
      const point = lastPoints[i]
      speeds.push(lastPoints[i].sub(prevPoint))
      prevPoint = point
    }
    this.panSpeed = speeds.reduce((a, b) => a.add(b)).div(speeds.length) // avarage speed
    let lastTime: number | undefined
    const acceleration = new Point2D(
      -Math.sign(this.panSpeed.x),
      -Math.sign(this.panSpeed.y)
    ).mul(this.panFriction)
    let elapsed = 0
    let currentSpeed = this.panSpeed
    const onFrame = (time: number) => {
      if (lastTime != null) elapsed += (time - lastTime) / 1000
      currentSpeed = this.panSpeed.add(acceleration.mul(elapsed))
      if (Math.sign(currentSpeed.x) !== Math.sign(this.panSpeed.x)) {
        this.panSpeed = new Point2D(0, this.panSpeed.y)
        currentSpeed = new Point2D(0, currentSpeed.y)
      }
      if (Math.sign(currentSpeed.y) !== Math.sign(this.panSpeed.y)) {
        this.panSpeed = new Point2D(this.panSpeed.x, 0)
        currentSpeed = new Point2D(currentSpeed.x, 0)
      }
      const newTransform = this.convertTransform(
        this._innerTransform.translate(-currentSpeed.x, -currentSpeed.y)
      )
      if (newTransform.isEqual(this._innerTransform)) {
        this.panSpeed = new Point2D(0, 0)
        return
      } else {
        this.setTransform(newTransform)
      }
      lastTime = time
      this.animationId = window.requestAnimationFrame(onFrame)
    }
    this.animationId = window.requestAnimationFrame(onFrame)
  }

  private processDrag (e: PointerEvent) {
    if (!this.el) return
    this.drag = this.reprojectPointerEvent(this.el, e)
  }

  private finishDragAndPan (e?: PointerEvent) {
    this.drag = undefined
    if (this.inertia && this.pan && e) {
      this.pan.add(this.createEventScreenPoint(e))
      this.startPanInertia(this.pan.toArray())
    } else {
      if (this.animationId) window.cancelAnimationFrame(this.animationId)
      this.panSpeed = new Point2D(0, 0)
    }
    this.pan = undefined
    this.inertia = false
  }

  private finishPinchZoom () {
    this.prevPinchRange = 0
    this.prevPinchCenter = new Point2D(0, 0)
  }

  private reprojectPointerEvent (el: HTMLElement, e: PointerEvent): Point2D {
    const box = el.getBoundingClientRect()
    const point = new Point2D(e.clientX * this.scale - box.left * this.scale, e.clientY * this.scale - box.top * this.scale)

    return this._innerTransform.revert(point)
  }

  private throttledDrag = throttleRequestAnimationFrame((e: PointerEvent) => {
    if (!this.onDrag || !this.el || !this.drag) return
    const leftTop = this.reprojectPointerEvent(this.el, e)
    this.onDrag(leftTop.sub(this.drag!), leftTop)
    this.drag = leftTop
  })[0]

  private _onPointerDown = (e: PointerEvent) => {
    if (!this.el || !(e.target instanceof HTMLElement)) return
    if (!this.el.contains(e.target)) return

    if (this.animationId) window.cancelAnimationFrame(this.animationId)

    this.downEvents.set(e.pointerId, this.createDownEventInfo(e))
    // console.log('down events: ', this.downEvents.size)

    if (this.onPointerDown && this.downEvents.size === 1) {
      const point = this.reprojectPointerEvent(this.el, e)
      this.onPointerDown(point)
      const pointerMethod = this.onPointerCheck(point, undefined, e) ?? PointerMethod.Default
      this.setCursor(pointerMethod)
    }
  }

  private _onPointerMove = (e: PointerEvent) => {
    if (!this.el || !(e.target instanceof HTMLElement)) return

    const downEventInfo = this.downEvents.get(e.pointerId)
    if (!downEventInfo) {
      if (!this.el.contains(e.target)) return
      const point = this.reprojectPointerEvent(this.el, e)
      const pointerMethod = this.onPointerCheck(point, e, undefined) ?? PointerMethod.Default
      this.setCursor(pointerMethod)
      return
    }

    // drag and pan
    if (downEventInfo && this.downEvents.size === 1) {
      const lastPanPoint = this.pan?.get(-1)
      if (lastPanPoint) {
        this.setTransform(
          this._innerTransform.translate(
            e.clientX * this.scale - lastPanPoint.x,
            e.clientY * this.scale - lastPanPoint.y
          )
        )

        this.processPan(e, this.inertia)
        return
      }
      if (this.drag) {
        this.throttledDrag(e)
        return
      }

      // reset move info (need update only when 2 pointers active)
      downEventInfo.moveScreenPos = downEventInfo.downScreenPos
      const upScreenPoint = this.createEventScreenPoint(e)
      const move = upScreenPoint.sub(downEventInfo.downScreenPos)
      if (Math.abs(move.x) < 3 && Math.abs(move.y) < 3) return

      const point = this.reprojectPointerEvent(this.el, e)
      const pointerMethod = this.onPointerCheck(point, e, downEventInfo.event) ?? PointerMethod.Default
      if (isPanPointerMethod(pointerMethod)) {
        this.processPan(e, pointerMethod === PointerMethod.PanInertia)
      } else if (isDragPointerMethod(pointerMethod)) {
        if (this.onDragStart) this.onDragStart()
        this.processDrag(e)
      } else {
        this.finishDragAndPan(e)
      }
      this.setCursor(pointerMethod)
      // zoom
    } else if (this.downEvents.size === 2) {
      this.finishDragAndPan()
      downEventInfo.moveScreenPos = this.createEventScreenPoint(e)
      // console.log('update', e.pointerId, downEventInfo.moveScreenPos)

      const [
        { downScreenPos: downScreenPosA, moveScreenPos: moveScreenPosA },
        { downScreenPos: downScreenPosB, moveScreenPos: moveScreenPosB }
      ] = this.downEvents.values()
      const moveA = downScreenPosA.sub(moveScreenPosA)
      const moveB = downScreenPosB.sub(moveScreenPosB)
      const move = moveB.sub(moveA)
      if (Math.abs(move.x) < 3 && Math.abs(move.y) < 3) return

      const pinchCenter = moveScreenPosA.add(moveScreenPosB).div(2)
      const pinchRange = moveScreenPosA.sub(moveScreenPosB).length
      const prevPinchRange = this.prevPinchRange
      const prevPinchCenter = this.prevPinchCenter

      const pinchMove = prevPinchCenter.sub(pinchCenter)
      if (!prevPinchCenter.isEqual(new Point2D(0, 0)) && pinchMove.length > 0) {
        this.setTransform(
          this._innerTransform.translate(-pinchMove.x, -pinchMove.y)
        )
      }

      if (pinchRange > 0 && prevPinchRange > 0) {
        const ratio = pinchRange / prevPinchRange
        this.zoomPreserveOrigin(pinchCenter, ratio)
      }

      this.prevPinchRange = pinchRange
      this.prevPinchCenter = pinchCenter
    }
  }

  private _onPointerUp = (e: PointerEvent) => {
    if (this.pan || this.drag) {
      if (this.drag && this.onDragEnd) this.onDragEnd()
      this.finishDragAndPan(e)
    } else {
      const downEventInfo = this.downEvents.get(e.pointerId)
      if (downEventInfo) {
        if (this.downEvents.size < 2) {
          this.prevPinchRange = 0
          this.prevPinchCenter = new Point2D(0, 0)
        }

        // click event only left mouse button or touch
        if (
          this.el && (e.target instanceof HTMLElement) &&
        this.onClick && this.el.contains(e.target) &&
        this.downEvents.size === 1 && e.button === 0
        ) {
          const upScreenPoint = this.createEventScreenPoint(e)
          const move = upScreenPoint.sub(downEventInfo.downScreenPos)
          if (Math.abs(move.x) < 3 && Math.abs(move.y) < 3) {
            const point = this.reprojectPointerEvent(this.el, e)
            if (this.onClick(point)) {
              e.stopPropagation()
              e.preventDefault()
            }
          }
        }
      }
    }
    this.downEvents.delete(e.pointerId)
    // console.log('down events: ', this.downEvents.size)
    if (this.downEvents.size !== 2) {
      this.finishPinchZoom()
    }
  }

  private _onWheel = (e: WheelEvent) => {
    if (!this.el || !this.onWheel) return

    const box = this.el.getBoundingClientRect()

    const mode = this.onWheel(e)

    const deltaX = e.shiftKey ? e.deltaY : e.deltaX
    const deltaY = e.shiftKey ? 0 : e.deltaY

    if (mode === WheelMode.Zoom) {
      const origin = new Point2D(e.clientX * this.scale - box.left, e.clientY * this.scale - box.top)
      if (deltaY > 0 || deltaX > 0) {
        this.zoomOut(origin)
      } else {
        this.zoomIn(origin)
      }
      e.stopPropagation()
      e.preventDefault()
    } else if (mode === WheelMode.Scroll) {
      const oldTransform = this._innerTransform
      this.setTransform(
        this._innerTransform.translate(-deltaX, -deltaY)
      )
      if (!oldTransform.isEqual(this._innerTransform)) {
        e.stopPropagation()
        e.preventDefault()
      }
    }
  }

  private _onDoubleClick = (e: MouseEvent) => {
    if (!this.el || !(e.target instanceof HTMLElement)) return
    if (!this.el.contains(e.target)) return

    e.preventDefault()
    if (this.onDoubleClick) this.onDoubleClick(new Point2D(e.clientX * this.scale, e.clientY * this.scale))
  }
}
