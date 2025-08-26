export function initParallax() {
  if (typeof window === 'undefined') return
  function onScroll() {
    const layers = document.querySelectorAll('.parallax-layer')
    const scrollY = window.scrollY || window.pageYOffset
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || '0.5')
      const y = -(scrollY * speed)
      el.style.transform = `translate3d(0, ${y}px, 0)`
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  return () => window.removeEventListener('scroll', onScroll)
}
