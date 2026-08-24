import { nextTick, onBeforeUnmount, onMounted } from 'vue'

const GHOST_SELECTOR = '.sortable-fallback, .sortable-drag'
const FLY_DURATION_MS = 220

let observer: MutationObserver | null = null
let refCount = 0

let lastGhostEl: HTMLElement | null = null
let lastGhostRect: DOMRect | null = null

function forceOpaque() {
  document.querySelectorAll<HTMLElement>(GHOST_SELECTOR).forEach((el) => {
    el.style.setProperty('opacity', '1', 'important')
  })
}

function flyGhostTo(ghost: HTMLElement, fromRect: DOMRect, toRect: DOMRect, landedEl: HTMLElement) {
  ghost.style.transition = 'none'
  ghost.style.margin = '0'
  ghost.style.position = 'fixed'
  ghost.style.top = `${fromRect.top}px`
  ghost.style.left = `${fromRect.left}px`
  ghost.style.width = `${fromRect.width}px`
  ghost.style.height = `${fromRect.height}px`
  ghost.style.transform = 'none'
  ghost.style.zIndex = '100000'
  ghost.style.pointerEvents = 'none'
  ghost.style.opacity = '1'
  document.body.appendChild(ghost)

  requestAnimationFrame(() => {
    ghost.style.transition = `top ${FLY_DURATION_MS}ms ease, left ${FLY_DURATION_MS}ms ease`
    ghost.style.top = `${toRect.top}px`
    ghost.style.left = `${toRect.left}px`
  })

  const cleanup = () => {
    ghost.removeEventListener('transitionend', cleanup)
    ghost.remove()
    landedEl.style.removeProperty('opacity')
  }
  ghost.addEventListener('transitionend', cleanup)
  setTimeout(cleanup, FLY_DURATION_MS + 150)
}

function handleMutations(mutations: MutationRecord[]) {
  forceOpaque()

  const ghost = document.querySelector<HTMLElement>(GHOST_SELECTOR)
  if (ghost) {
    lastGhostEl = ghost
    lastGhostRect = ghost.getBoundingClientRect()
    return
  }

  if (!lastGhostEl || !lastGhostRect) return

  const ghostWasRemoved = mutations.some(
    (m) => m.type === 'childList' && Array.from(m.removedNodes).includes(lastGhostEl as Node),
  )
  if (!ghostWasRemoved) return

  const landedMutation = mutations.find(
    (m) =>
      m.type === 'attributes' &&
      m.attributeName === 'class' &&
      typeof m.oldValue === 'string' &&
      m.oldValue.includes('sortable-ghost'),
  )
  const landedEl = landedMutation?.target as HTMLElement | undefined
  const flyingGhost = lastGhostEl
  const flyingFromRect = lastGhostRect
  lastGhostEl = null
  lastGhostRect = null

  if (!landedEl) return

  landedEl.style.setProperty('opacity', '0', 'important')

  nextTick(() => {
    flyGhostTo(flyingGhost, flyingFromRect, landedEl.getBoundingClientRect(), landedEl)
  })
}

export function useDragGhostOpacityFix() {
  onMounted(() => {
    if (refCount === 0) {
      observer = new MutationObserver(handleMutations)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['style', 'class'],
      })
    }
    refCount++
  })

  onBeforeUnmount(() => {
    refCount--
    if (refCount === 0) {
      observer?.disconnect()
      observer = null
    }
  })
}
