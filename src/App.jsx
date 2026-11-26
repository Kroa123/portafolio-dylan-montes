import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, Download, Mail, MapPin, Menu, X } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { profile, projects, experience, skills, certifications } from './data'
import ProjectCard from './components/ProjectCard'
import { GithubIcon, WhatsappIcon } from './components/Icons'

const ContainerYard = lazy(() => import('./components/ContainerYard'))

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'live', label: 'En vivo' },
  { id: 'web', label: 'Web' },
  { id: 'movil', label: 'Móvil' },
  { id: 'backend', label: 'Backend' },
]

const FEATURED = ['perfect-clean', 'valle-vet', 'calendar', 'kroa-ahorros']

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduced
}

function useWebGL() {
  return useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }, [])
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = [
    ['#sobre-mi', 'Sobre mí'],
    ['#proyectos', 'Proyectos'],
    ['#experiencia', 'Experiencia'],
    ['#habilidades', 'Habilidades'],
    ['#contacto', 'Contacto'],
  ]
  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wrap header-inner">
        <a href="#inicio" className="brand" aria-label="Dylan Montes, inicio">
          <span className="brand-mark" aria-hidden="true">DM</span>
          <span className="brand-name">Dylan Montes</span>
        </a>
        <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Principal">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="btn btn--primary btn--sm nav-cv" href={profile.cv} download>
            Descargar CV <Download size={15} aria-hidden="true" />
          </a>
        </nav>
        <button className="nav-toggle" aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}

function Hero({ reducedMotion }) {
  const root = useRef(null)
  const webgl = useWebGL()
  const [hovered, setHovered] = useState(null)
  const hoveredProject = projects.find((p) => p.id === hovered)
  const yardProjects = projects.filter((p) => p.status !== 'progress')

  const goTo = useCallback((id) => {
    const el = document.getElementById(`p-${id}`)
    if (!el) return
    el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
    el.classList.remove('is-flash')
    void el.offsetWidth
    el.classList.add('is-flash')
  }, [reducedMotion])

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.hero-line', { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.08, delay: 0.1 })
    gsap.from('.hero-fade', { opacity: 0, y: 14, duration: 0.7, ease: 'power2.out', stagger: 0.07, delay: 0.55 })
  }, { scope: root, dependencies: [reducedMotion] })

  return (
    <section id="inicio" className="hero" ref={root}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="hero-id hero-fade">
            <img className="hero-photo" src="/foto.webp" alt="Foto de Dylan Jefferson Montes Castrillón" width="233" height="287" />
            <p className="hero-status">
              <span className="dot" aria-hidden="true" /> Disponible para nuevas oportunidades
            </p>
          </div>
          <h1 className="hero-title">
            <span className="mask"><span className="hero-line">Dylan Jefferson</span></span>
            <span className="mask"><span className="hero-line">Montes Castrillón</span></span>
          </h1>
          <p className="hero-role hero-fade">Desarrollador full stack</p>
          <p className="hero-lead hero-fade">
            Construyo sistemas web y apps móviles de punta a punta: desde la reunión con gerencia y el
            diseño de la base de datos hasta el despliegue en producción. Trabajo con React, PHP Laravel,
            SQL y Kotlin.
          </p>
          <div className="hero-actions hero-fade">
            <a className="btn btn--primary" href="#proyectos">Ver proyectos <ArrowDown size={17} aria-hidden="true" /></a>
            <a className="btn btn--ghost" href={profile.cv} download>Descargar CV <Download size={17} aria-hidden="true" /></a>
          </div>
          <ul className="hero-links hero-fade">
            {profile.github.map((g) => (
              <li key={g.user}>
                <a href={g.url} target="_blank" rel="noreferrer"><GithubIcon size={16} /> {g.user}</a>
              </li>
            ))}
            <li><a href={`mailto:${profile.email}`}><Mail size={16} aria-hidden="true" /> {profile.email}</a></li>
            <li className="muted"><MapPin size={16} aria-hidden="true" /> {profile.location}</li>
          </ul>
        </div>

        <div className="hero-yard">
          <div className="yard-canvas" aria-hidden="true">
            {webgl ? (
              <Suspense fallback={<div className="yard-loading" />}>
                <ContainerYard projects={yardProjects} onSelect={goTo} hovered={hovered} onHover={setHovered} reducedMotion={reducedMotion} />
              </Suspense>
            ) : (
              <div className="yard-loading" />
            )}
          </div>
          <div className="yard-caption" aria-live="polite">
            {hoveredProject ? (
              <>
                <strong>{hoveredProject.title}</strong>
                <span>{hoveredProject.subtitle}. Haz clic para verlo.</span>
              </>
            ) : (
              <span>Antes de programar trabajé como estibador en el puerto del Callao. Cada contenedor es un proyecto: arrastra para girar la pila y haz clic en uno para verlo.</span>
            )}
          </div>
          <ul className="yard-list" aria-label="Proyectos de la pila">
            {yardProjects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`yard-chip ${hovered === p.id ? 'is-active' : ''}`}
                  style={{ '--c': p.color }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
                  onFocus={() => setHovered(p.id)}
                  onBlur={() => setHovered((h) => (h === p.id ? null : h))}
                  onClick={() => goTo(p.id)}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap">
        <dl className="manifest">
          <div><dt>Desplegados en la web</dt><dd>Perfect Clean y Valle Vet</dd></div>
          <div><dt>En producción</dt><dd>Calendario de gerencia en Devdatep</dd></div>
          <div><dt>Apps Android</dt><dd>Kroa Ahorros y YOPETI</dd></div>
          <div><dt>Formación</dt><dd>Ingeniería de Sistemas, IX ciclo, UCV</dd></div>
        </dl>
      </div>
    </section>
  )
}

const QUALITIES = ['Puntualidad', 'Responsabilidad', 'Ganas de salir adelante', 'Aprendizaje rápido', 'Trabajo en equipo', 'Comunicación con gerencia', 'Disciplina', 'Constancia']

function About() {
  return (
    <section id="sobre-mi" className="section about">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Conoce sobre mí</h2>
          <p className="section-lead">Quién soy dentro y fuera del código.</p>
        </div>
        <div className="about-grid">
          <figure className="about-photo">
            <img src="/foto.webp" alt="Dylan Jefferson Montes Castrillón" width="233" height="287" loading="lazy" />
            <figcaption>Dylan Jefferson Montes Castrillón<br /><span>Ingeniería de Sistemas, UCV</span></figcaption>
          </figure>
          <div className="about-text">
            <h3>Como ingeniero de sistemas</h3>
            <p>
              Estudio Ingeniería de Sistemas en la Universidad César Vallejo (IX ciclo) y me gusta entender un problema
              completo antes de escribir código: conversar con quien lo vive, ordenar los requerimientos, diseñar la base
              de datos y recién ahí construir. Disfruto ver un sistema pasar de una idea en una reunión a algo que la gente
              usa todos los días, como el calendario que hoy usa la gerencia de Devdatep.
            </p>
            <p>
              Me considero una persona puntual, responsable y con muchas ganas de salir adelante. Vengo de trabajar en el
              puerto y en el aeropuerto, donde la seguridad y los tiempos no se negocian; esa disciplina la traigo a cada
              entrega. Aprendo rápido, pregunto cuando algo no está claro y uso herramientas de IA para avanzar más rápido
              sin dejar de entender lo que hago. Mi tesis aplica machine learning a la gestión de inventarios de una
              empresa real, porque quiero que lo que construyo tenga impacto concreto.
            </p>
            <ul className="chips about-qualities" aria-label="Cualidades">
              {QUALITIES.map((q) => <li key={q}>{q}</li>)}
            </ul>

            <h3>Fuera del código: la música</h3>
            <p>
              La música es mi pasión. Desde hace 4 años soy tubista en la banda Anthony's Friends, y cada ensayo y cada
              presentación me llenan de una forma que nada más lo hace. La tuba sostiene la base de toda la banda: no
              siempre se luce, pero sin ella la música no se sostiene.
            </p>
            <p>
              Tocar en una banda me enseñó cosas que aplico todos los días como desarrollador: llegar a tiempo, practicar
              con constancia, escuchar al resto y saber cuándo entrar. Un buen equipo, como una buena banda, suena bien
              cuando cada uno hace su parte con compromiso.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Projects() {
  const [filter, setFilter] = useState('all')
  const list = useMemo(() => {
    if (filter === 'all') return projects
    if (filter === 'live') return projects.filter((p) => p.live)
    return projects.filter((p) => p.kind.includes(filter))
  }, [filter])
  const featured = filter === 'all' ? list.filter((p) => FEATURED.includes(p.id)) : []
  const rest = filter === 'all' ? list.filter((p) => !FEATURED.includes(p.id)) : list

  return (
    <section id="proyectos" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Proyectos</h2>
          <p className="section-lead">
            Trabajo real: sistemas en producción, sitios desplegados y apps Android. Los que están en vivo se abren
            con un clic en la vista previa; el resto enlaza a su código en GitHub.
          </p>
        </div>

        <div className="filters" role="group" aria-label="Filtrar proyectos">
          {FILTERS.map((f) => (
            <button key={f.id} className={`filter ${filter === f.id ? 'is-active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="filter-count">
                {f.id === 'all' ? projects.length : f.id === 'live' ? projects.filter((p) => p.live).length : projects.filter((p) => p.kind.includes(f.id)).length}
              </span>
            </button>
          ))}
        </div>

        {featured.length > 0 && (
          <div className="featured">
            {featured.map((p) => <ProjectCard key={p.id} project={p} featured />)}
          </div>
        )}
        <div className="grid">
          {rest.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experiencia" className="section section--alt">
      <div className="wrap exp-grid">
        <div className="section-head section-head--sticky">
          <h2 className="section-title">Experiencia</h2>
          <p className="section-lead">
            Del puerto al software. En la estiba aprendí a trabajar con protocolos de seguridad, tiempos exigentes y en
            coordinación con todo un equipo. Hoy aplico esa disciplina al desarrollo.
          </p>
          <div className="edu">
            <p className="edu-label">Formación</p>
            <p className="edu-title">Ingeniería de Sistemas, IX ciclo</p>
            <p className="edu-sub">Universidad César Vallejo, 2022 – actualidad</p>
            <p className="edu-sub">Inglés intermedio, 6 niveles certificados</p>
          </div>
        </div>
        <ol className="timeline">
          {experience.map((e) => (
            <li key={e.company} className="tl-item">
              <p className="tl-period">{e.period}</p>
              <h3 className="tl-company">{e.company}</h3>
              <p className="tl-role">{e.role}</p>
              <ul className="tl-points">
                {e.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="habilidades" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title">Habilidades</h2>
          <p className="section-lead">Las tecnologías que uso en el trabajo y en mis proyectos, agrupadas por área.</p>
        </div>
        <div className="skills">
          {skills.map((s) => (
            <div key={s.group} className="skill-group">
              <h3>{s.group}</h3>
              <ul className="chips">
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="certs">
          <h3 className="certs-title">Certificaciones</h3>
          <ul>
            {certifications.map((c) => (
              <li key={c.name}>
                <span className="cert-name">{c.name}</span>
                <span className="cert-org">{c.org}</span>
                <span className="cert-date">{c.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contacto" className="section contact">
      <div className="wrap">
        <h2 className="contact-title">¿Conversamos?</h2>
        <p className="section-lead">
          Busco un puesto como desarrollador frontend o full stack. Respondo el mismo día por correo o WhatsApp.
        </p>
        <a className="contact-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <a className="contact-phone" href={profile.whatsapp} target="_blank" rel="noreferrer" aria-label={`Escribir por WhatsApp al ${profile.phone}`}>
          <WhatsappIcon size={22} /> {profile.phone}
        </a>
        <div className="contact-actions">
          <a className="btn btn--primary" href={profile.whatsapp} target="_blank" rel="noreferrer"><WhatsappIcon size={17} /> Escribir por WhatsApp</a>
          <a className="btn btn--ghost" href={profile.cv} download>Descargar CV <Download size={17} aria-hidden="true" /></a>
          {profile.github.map((g) => (
            <a key={g.user} className="btn btn--ghost" href={g.url} target="_blank" rel="noreferrer"><GithubIcon size={17} /> {g.label}</a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const reducedMotion = useReducedMotion()
  return (
    <>
      <a className="skip" href="#proyectos">Saltar a proyectos</a>
      <Header />
      <main>
        <Hero reducedMotion={reducedMotion} />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p>Dylan Montes Castrillón, {new Date().getFullYear()}</p>
          <p className="muted">Diseñado y programado por mí con React y Three.js.</p>
        </div>
      </footer>
    </>
  )
}
