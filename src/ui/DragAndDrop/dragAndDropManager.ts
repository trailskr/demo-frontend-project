import { InjectionKey, reactive } from 'vue'

import { throttleRequestAnimationFrame } from '@/utils/utils'

/* eslint-disable no-use-before-define */

export interface DropSection {
  isAtTop?: boolean
  isAtBottom?: boolean
  isAtLeft?: boolean
  isAtRight?: boolean
}

/** Coordinates of the current movement */
export interface DragCursorPositions {
  start?: Coords
  move?: Coords
  diff: Coords
}

export interface CmvDragAndDrop {
  el: DragElement | undefined
  isDraggable: boolean
  isDropZone: boolean
  animateAvatar: boolean
  context: string
  modelValue: unknown
  bodyClassName: string | string[]
  numDragControls: number
  splitZoneVertically: boolean
  splitZoneHorizontally: boolean
  onStart(state: DragState): void
  canDragFn(): boolean
  canDropFn(draggedValue: unknown, dropSection: DropSection): boolean
  dragOver(draggedValue: unknown, dropSection: DropSection): void
  dragLeave(): void
  drop(draggedValue: unknown, dropSection: DropSection): void
  makeAvatar(): DragElement
  handleMove(coords: Coords): void
  dragStart(): void
  dragEnd(): void
  setDropPossibility(possibility: boolean | undefined): void
  dragState: DragState
}

export interface CmvDragControl {
  draggable: CmvDragAndDrop
}

export interface VueComponent<T> {
  exposed: T
}

export interface DragAndDropStatus {
  readonly isDraggable: boolean
  readonly isDropZone: boolean
  readonly isDragInProgress: boolean
  readonly isDropPossible?: boolean
  readonly isAtTop?: boolean
  readonly isAtBottom?: boolean
  readonly isAtLeft?: boolean
  readonly isAtRight?: boolean
}

export const draggablePropertyName = '__draggable__'
export const dragControlPropertyName = '__dragControl__'
export const dragAndDropKey: InjectionKey<VueComponent<CmvDragAndDrop>> = Symbol('dragAndDropKey')

/** Extends the DOM element with properties used in the drag-n-drop implementation */
export interface DragElement extends HTMLElement {
  [dragControlPropertyName]?: VueComponent<CmvDragControl>
  [draggablePropertyName]?: VueComponent<CmvDragAndDrop>
}

/** A set of coordinates */
export interface Coords {
  x: number
  y: number
}

interface AvatarInitialStyle {
  zIndex: string
}

interface DragProgress {
  avatar: HTMLElement
  avatarInitialStyle: AvatarInitialStyle
  handleAvatarMovement: boolean
  dropZone?: CmvDragAndDrop
  move: Coords
  isAtTop?: boolean
  isAtLeft?: boolean
}

/** Global drag state */
export interface DragState {
  start: Coords
  progress?: DragProgress
  readonly draggable: CmvDragAndDrop
}

export type DragStateInProgress = Required<DragState>

let state: DragState | undefined

const isDragElement = (target: Element | null): target is DragElement => {
  return target instanceof HTMLElement || target instanceof SVGElement
}

const findDraggable = (node: DragElement | null): CmvDragAndDrop | undefined => {
  while (node) {
    const dragAndDrop = node[draggablePropertyName]?.exposed
    if (dragAndDrop) {
      if (dragAndDrop.isDraggable && dragAndDrop.numDragControls === 0) {
        return dragAndDrop
      }
    }

    const dragControl = node[dragControlPropertyName]?.exposed
    if (dragControl) {
      if (dragControl.draggable?.isDraggable) {
        return dragControl.draggable
      }
    }

    node = node.parentElement
  }
}

const findDropZone = (node: DragElement | null, context: unknown): CmvDragAndDrop | undefined => {
  while (node) {
    const dragAndDrop = node[draggablePropertyName]?.exposed
    if (dragAndDrop) {
      if (dragAndDrop.isDropZone) {
        if (!context || dragAndDrop.context === context) {
          return dragAndDrop
        }
      }
    }
    node = node.parentElement
  }
}

const getNodeUnderCursor = ({ x, y }: Coords, avatar?: HTMLElement): DragElement | undefined => {
  let node: Element | null
  if (avatar) {
    const oldTransform = avatar.style.transform
    avatar.style.transform = 'translate(-1e9px, -1e9px)'

    node = document.elementFromPoint(x, y)

    avatar.style.transform = oldTransform
  } else {
    node = document.elementFromPoint(x, y)
  }

  return isDragElement(node) ? node : undefined
}

const positionAvatar = (s: DragStateInProgress) => {
  const move = s.progress.move
  const x = move.x - s.start.x
  const y = move.y - s.start.y
  const translate = `translate(${x}px, ${y}px)`
  const rotate = s.draggable.animateAvatar && 'rotate(3deg)'

  s.progress.avatar.style.transform = rotate ? `${rotate} ${translate}` : translate
}

export const makeDropSection = (isAtTop?: boolean, isAtLeft?: boolean): DropSection => ({
  isAtTop,
  isAtBottom: isAtTop == null ? undefined : !isAtTop,
  isAtLeft,
  isAtRight: isAtLeft == null ? undefined : !isAtLeft
})

const moveAvatar = (s: DragStateInProgress, coords: Coords) => {
  const p = s.progress
  p.move = coords
  const avatar = p.avatar

  let node: DragElement | undefined
  if (s.progress.handleAvatarMovement) {
    positionAvatar(s)
    node = getNodeUnderCursor(coords, avatar)
  } else {
    s.draggable.handleMove(coords)
    node = getNodeUnderCursor(coords)
  }

  if (!node) {
    return
  }

  const dropZone = findDropZone(node, s.draggable.context)

  if (!dropZone || p.dropZone !== dropZone) {
    p.dropZone?.dragLeave()
  }

  let isAtTop: boolean | undefined
  let isAtLeft: boolean | undefined
  if (dropZone && dropZone.el) {
    const rect = dropZone.el.getBoundingClientRect()
    isAtTop = dropZone && dropZone.el && dropZone.splitZoneVertically
      ? coords.y < rect.y + rect.height / 2
      : undefined
    isAtLeft = dropZone && dropZone.el && dropZone.splitZoneHorizontally
      ? coords.x < rect.x + rect.width / 2
      : undefined
  }

  if (dropZone) {
    if (
      p.dropZone === dropZone &&
      p.isAtTop === isAtTop &&
      p.isAtLeft === isAtLeft
    ) {
      // nothing changed
      return
    }
  }
  if (p.dropZone) {
    p.dropZone.setDropPossibility(undefined)
  }
  if (dropZone) {
    const dropSection = makeDropSection(isAtTop, isAtLeft)
    const canDrop = dropZone.canDropFn(s.draggable.modelValue, dropSection)
    dropZone.setDropPossibility(canDrop)
    if (canDrop) {
      dropZone.dragOver(s.draggable.modelValue, dropSection)
    }
  }
  p.dropZone = dropZone
  p.isAtTop = isAtTop
  p.isAtLeft = isAtLeft
}

const tryCreateAvatar = (s: DragState): void => {
  const names = s.draggable.bodyClassName
  document.body.style.userSelect = 'none'
  if (names) {
    const classList = Array.isArray(names) ? names : names.split(' ')
    document.body.classList.add(...classList)
  }

  const avatar = s.draggable.makeAvatar()
  const handleAvatarMovement = avatar !== s.draggable.el

  const avatarInitialStyle: AvatarInitialStyle = {
    zIndex: avatar.style.zIndex
  }

  s.progress = {
    avatar,
    avatarInitialStyle,
    handleAvatarMovement,
    move: {
      x: s.start.x,
      y: s.start.y
    }
  }

  if (handleAvatarMovement) {
    document.body.appendChild(avatar)
    avatar.style.zIndex = '9999'
    positionAvatar(s as DragStateInProgress)
  }

  s.draggable.dragStart()
}

const checkStartDragging = (s: DragState, coords: Coords): void => {
  const dX = coords.x - s.start.x
  const dY = coords.y - s.start.y
  if (Math.sqrt(dX * dX + dY * dY) >= 3) {
    tryCreateAvatar(s)
  }
}

// Common handlers

const checkStart = (target: DragElement, start: Coords): void => {
  const draggable = findDraggable(target)
  if (draggable && draggable.canDragFn()) {
    state = reactive({ draggable, start }) as DragState
    draggable.onStart(state)
  }
}

const onMove = (s: DragState, coords: Coords): void => {
  if (s.progress) {
    moveAvatar(s as DragStateInProgress, coords)
  } else {
    checkStartDragging(s, coords)
  }
}

const onEnd = (s: DragStateInProgress): void => {
  const p = s.progress
  const draggable = s.draggable
  const avatar = p.avatar

  if (p.dropZone) {
    const { isAtTop, isAtLeft } = p
    const dropSection = makeDropSection(isAtTop, isAtLeft)
    p.dropZone.drop(draggable.modelValue, dropSection)
    p.dropZone.setDropPossibility(undefined)
  }

  if (avatar !== draggable.el) {
    document.body.removeChild(avatar)
  }

  avatar.style.zIndex = p.avatarInitialStyle.zIndex

  document.body.style.userSelect = ''
  const names = draggable.bodyClassName
  if (names) {
    const classList = Array.isArray(names) ? names : names.split(' ')
    document.body.classList.remove(...classList)
  }

  draggable.dragEnd()
}

// Pointer handlers

const onPointerDown = (e: PointerEvent): void => {
  if (e.button !== 0) return // if not left mouse button
  if (!isDragElement(e.target as Element)) return
  checkStart(e.target as DragElement, { x: e.clientX, y: e.clientY })
  if (state) e.stopPropagation()
}

const onPointerMove = (e: PointerEvent): void => {
  if (!state) return
  e.stopPropagation()
  onMove(state, {
    x: e.clientX,
    y: e.clientY
  })
}

const onPointerEnd = (e: PointerEvent): void => {
  if (state && state.progress) {
    onEnd(state as DragStateInProgress)
    e.stopPropagation()
  }

  state = undefined
}

if (!import.meta.env.SSR) {
  document.addEventListener('pointerdown', onPointerDown, false)
  document.addEventListener('pointermove', throttleRequestAnimationFrame(onPointerMove)[0], false)
  document.addEventListener('pointerup', onPointerEnd, false)
}
