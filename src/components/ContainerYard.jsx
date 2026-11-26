import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const L = 2.4 // largo del contenedor
const H = 1.0
const D = 1.0

// Posiciones en la pila (x, nivel, z). Las primeras quedan al frente, donde se leen.
const SLOTS = [
  [-1.3, 0, 1.15], [1.3, 0, 1.15],
  [-1.3, 1, 1.15], [1.3, 1, 1.15],
  [-1.3, 0, 0], [1.3, 0, 0],
  [-1.3, 0, -1.15], [1.3, 0, -1.15],
  [-1.3, 1, -1.15], [-1.3, 2, -1.15],
  [1.3, 1, -1.15],
]
// Orden de carga: de abajo hacia arriba y del fondo al frente
const DROP_ORDER = SLOTS.map((s, i) => i).sort((a, b) => SLOTS[a][1] - SLOTS[b][1] || SLOTS[a][2] - SLOTS[b][2])

function shade(hex, amt) {
  const c = new THREE.Color(hex)
  const hsl = {}
  c.getHSL(hsl)
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)))
  return `#${c.getHexString()}`
}

// Tono industrial: baja saturación y un poco de gris acero
function weather(hex) {
  const c = new THREE.Color(hex)
  const hsl = {}
  c.getHSL(hsl)
  c.setHSL(hsl.h, hsl.s * 0.7, hsl.l * 0.95)
  return `#${c.getHexString()}`
}

function sideTexture(color, title, code) {
  const cv = document.createElement('canvas')
  cv.width = 1024
  cv.height = 426
  const g = cv.getContext('2d')
  g.fillStyle = color
  g.fillRect(0, 0, cv.width, cv.height)
  // corrugado
  for (let x = 0; x < cv.width; x += 28) {
    g.fillStyle = shade(color, -0.07)
    g.fillRect(x, 0, 10, cv.height)
    g.fillStyle = shade(color, 0.05)
    g.fillRect(x + 10, 0, 3, cv.height)
  }
  // marco
  g.strokeStyle = shade(color, -0.18)
  g.lineWidth = 18
  g.strokeRect(9, 9, cv.width - 18, cv.height - 18)
  // rotulado
  g.fillStyle = 'rgba(255,255,255,0.94)'
  g.font = '700 88px "Bricolage Grotesque Variable", system-ui, sans-serif'
  g.textBaseline = 'alphabetic'
  g.fillText(title, 60, 170, cv.width - 120)
  g.font = '600 38px "Instrument Sans Variable", system-ui, sans-serif'
  g.fillStyle = 'rgba(255,255,255,0.72)'
  g.fillText(code, 62, 236)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function endTexture(color) {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 256
  const g = cv.getContext('2d')
  g.fillStyle = shade(color, -0.04)
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = shade(color, -0.2)
  g.lineWidth = 8
  g.strokeRect(4, 4, 248, 248)
  g.beginPath()
  g.moveTo(128, 0)
  g.lineTo(128, 256)
  g.stroke()
  g.lineWidth = 6
  ;[60, 100, 156, 196].forEach((x) => {
    g.beginPath()
    g.moveTo(x, 20)
    g.lineTo(x, 236)
    g.stroke()
  })
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Container({ project, slot, index, hovered, setHovered, onSelect, animate, fontsReady }) {
  const ref = useRef()
  const start = useRef(null)
  const [x, layer, z] = slot
  const restY = layer * (H + 0.02) + H / 2
  const isHover = hovered === project.id

  const materials = useMemo(() => {
    if (!fontsReady) return null
    const code = `DMC ${String(index + 1).padStart(4, '0')}  ${project.year}`
    const base = weather(project.color)
    const side = sideTexture(base, project.title, code)
    const end = endTexture(base)
    const plain = new THREE.MeshStandardMaterial({ color: shade(base, -0.06), roughness: 0.7, metalness: 0.15 })
    const s = new THREE.MeshStandardMaterial({ map: side, roughness: 0.62, metalness: 0.15 })
    const e = new THREE.MeshStandardMaterial({ map: end, roughness: 0.65, metalness: 0.15 })
    // orden de caras: +x, -x, +y, -y, +z, -z
    return [e, e, plain, plain, s, s]
  }, [fontsReady, project, index])

  useEffect(() => () => materials?.forEach((m) => { m.map?.dispose(); m.dispose() }), [materials])

  useFrame((state, dt) => {
    const m = ref.current
    if (!m) return
    if (start.current === null) start.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - start.current - DROP_ORDER.indexOf(index) * 0.11
    let y = restY
    if (animate) {
      const dur = 0.9
      const p = Math.min(Math.max(t / dur, 0), 1)
      // caída con un pequeño rebote al asentarse
      const ease = p < 1 ? 1 - Math.pow(1 - p, 3) + Math.sin(p * Math.PI) * 0.04 : 1
      y = restY + (1 - ease) * 7
      m.visible = t > -0.05
    }
    const target = y + (isHover ? 0.16 : 0)
    m.position.y = THREE.MathUtils.damp(m.position.y, target, isHover || !animate ? 10 : 30, dt)
    if (animate && t < 0.9) m.position.y = y
  })

  if (!materials) return null
  return (
    <mesh
      ref={ref}
      position={[x, animate ? restY + 7 : restY, z]}
      material={materials}
      castShadow
      onPointerOver={(e) => { e.stopPropagation(); setHovered(project.id) }}
      onPointerOut={() => setHovered((h) => (h === project.id ? null : h))}
      onClick={(e) => { e.stopPropagation(); onSelect(project.id) }}
    >
      <boxGeometry args={[L, H, D]} />
    </mesh>
  )
}

// Spreader de grúa que sigue al contenedor señalado
function Spreader({ target }) {
  const group = useRef()
  const cable = useRef()
  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const idle = Math.sin(state.clock.elapsedTime * 0.6) * 0.25
    const tx = target ? target[0] : idle
    const tz = target ? target[2] : 0
    const ty = target ? target[1] * (H + 0.02) + H + 0.55 : 4.1
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 4, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 4, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 3, dt)
    if (cable.current) {
      const len = 9 - g.position.y
      cable.current.scale.y = len
      cable.current.position.y = len / 2 + 0.06
    }
  })
  return (
    <group ref={group} position={[0, 4.1, 0]}>
      <mesh>
        <boxGeometry args={[L + 0.1, 0.1, 0.12]} />
        <meshStandardMaterial color="#F2C230" roughness={0.5} metalness={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (L / 2), -0.1, 0]}>
          <boxGeometry args={[0.1, 0.18, D]} />
          <meshStandardMaterial color="#F2C230" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh ref={cable}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshStandardMaterial color="#9DB0C4" />
      </mesh>
    </group>
  )
}

// Aleja la cámara cuando el lienzo es angosto (móvil) para que entre toda la pila
function FitCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    const k = aspect < 1.25 ? 1.25 / aspect : 1
    camera.position.set(4.2 * k, 4.4 + (k - 1) * 1.6, 9.2 * k)
    camera.lookAt(0, 1.1, 0)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

function Rig({ children }) {
  const group = useRef()
  const { pointer } = useThree()
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.38 + pointer.x * 0.2, 2.5, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.y * -0.05, 2.5, dt)
  })
  return <group ref={group}>{children}</group>
}

export default function ContainerYard({ projects, onSelect, onHover, reducedMotion }) {
  const [hovered, setHovered] = useState(null)
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    let alive = true
    const ready = document.fonts?.ready ?? Promise.resolve()
    Promise.all([
      document.fonts?.load('700 88px "Bricolage Grotesque Variable"'),
      document.fonts?.load('600 38px "Instrument Sans Variable"'),
      ready,
    ]).finally(() => alive && setFontsReady(true))
    return () => { alive = false }
  }, [])

  useEffect(() => {
    onHover?.(hovered)
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => { document.body.style.cursor = '' }
  }, [hovered, onHover])

  const items = projects.slice(0, SLOTS.length)
  const hoverSlot = hovered ? SLOTS[items.findIndex((p) => p.id === hovered)] : null

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [4.2, 4.4, 9.2], fov: 33 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, 1.1, 0)}
      onPointerMissed={() => setHovered(null)}
    >
      <FitCamera />
      <hemisphereLight args={['#DCE8F5', '#0D2137', 0.9]} />
      <directionalLight position={[5, 9, 4]} intensity={1.6} color="#FFF4E0" />
      <directionalLight position={[-6, 3, -4]} intensity={0.45} color="#3FC1B0" />
      <Rig>
        <group position={[0, -0.4, 0]}>
          {items.map((p, i) => (
            <Container
              key={p.id}
              project={p}
              slot={SLOTS[i]}
              index={i}
              hovered={hovered}
              setHovered={setHovered}
              onSelect={onSelect}
              animate={!reducedMotion}
              fontsReady={fontsReady}
            />
          ))}
          <Spreader target={hoverSlot} />
          <gridHelper args={[14, 14, '#2D5378', '#1B3B5C']} position={[0, 0.001, 0]} />
          <ContactShadows position={[0, 0.002, 0]} scale={12} blur={2.2} opacity={0.55} far={4} color="#04101C" />
        </group>
      </Rig>
    </Canvas>
  )
}
