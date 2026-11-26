import { useRef, useState } from 'react'
import { ArrowUpRight, Download, Lock, Smartphone, Server } from 'lucide-react'
import { GithubIcon } from './Icons'
import { statusInfo } from '../data'

function hostOf(url) {
  try { return new URL(url).host } catch { return '' }
}

function BrowserPreview({ project, href }) {
  const frame = useRef(null)
  const [shift, setShift] = useState(0)
  const scrollable = project.shotType === 'scroll'

  const measure = (img) => {
    const f = frame.current
    if (!f || !scrollable) return
    const extra = img.getBoundingClientRect().height - f.getBoundingClientRect().height
    setShift(Math.max(0, extra))
  }

  const body = (
    <>
      <div className="browser-bar" aria-hidden="true">
        <span /><span /><span />
        <div className="browser-url">{hostOf(project.live || project.repo)}</div>
      </div>
      <div className="browser-view" ref={frame}>
        <img
          src={project.shot}
          alt={`Captura de ${project.title}`}
          loading="lazy"
          decoding="async"
          onLoad={(e) => measure(e.currentTarget)}
          style={{ '--shift': `-${shift}px`, '--dur': `${Math.max(2.5, shift / 260)}s` }}
          className={scrollable ? 'is-scroll' : ''}
        />
      </div>
    </>
  )

  if (!href) return <div className="browser">{body}</div>
  return (
    <a className="browser" href={href} target="_blank" rel="noreferrer" aria-label={`Abrir ${project.title}`}>
      {body}
      <span className="browser-cta">
        {project.live ? 'Abrir sitio' : 'Ver repositorio'} <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </a>
  )
}

function PhonePreview({ project }) {
  return (
    <div className="phones">
      {project.shots.map((s, i) => (
        <div className="phone" key={s} style={{ '--i': i }}>
          <img src={s} alt={`${project.title}, pantalla ${i + 1}`} loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  )
}

function Cover({ project }) {
  const Icon = project.kind.includes('movil') ? Smartphone : Server
  return (
    <div className="cover" style={{ '--c': project.color }}>
      <Icon size={30} aria-hidden="true" />
      <p className="cover-title">{project.title}</p>
      <p className="cover-stack">{project.stack.slice(0, 4).join('  /  ')}</p>
    </div>
  )
}

export default function ProjectCard({ project, featured }) {
  const status = statusInfo[project.status]
  const previewHref = project.live || (!project.repoPrivate && project.repo) || project.download
  const label = project.statusLabel || status.label

  return (
    <article id={`p-${project.id}`} className={`project ${featured ? 'project--featured' : ''}`} style={{ '--c': project.color }}>
      <div className="project-media">
        {project.shotType === 'phone' && <PhonePreview project={project} />}
        {(project.shotType === 'scroll' || project.shotType === 'static') && (
          <BrowserPreview project={project} href={previewHref} />
        )}
        {project.shotType === 'none' && <Cover project={project} />}
      </div>

      <div className="project-body">
        <div className="project-meta">
          <span className={`status status--${status.tone}`}>{label}</span>
          <span className="project-year">{project.year}</span>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-sub">{project.subtitle}</p>
        <p className="project-summary">{project.summary}</p>
        {featured && project.bullets.length > 0 && (
          <ul className="project-points">
            {project.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        <ul className="chips" aria-label="Tecnologías">
          {project.stack.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <div className="project-actions">
          {project.live && (
            <a className="btn btn--primary btn--sm" href={project.live} target="_blank" rel="noreferrer">
              Ver en vivo <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          {project.download && (
            <a className="btn btn--primary btn--sm" href={project.download} target="_blank" rel="noreferrer">
              Descargar APK <Download size={16} aria-hidden="true" />
            </a>
          )}
          {project.repo && !project.repoPrivate && (
            <a className="btn btn--ghost btn--sm" href={project.repo} target="_blank" rel="noreferrer">
              <GithubIcon size={16} /> Código
            </a>
          )}
          {project.repo2 && (
            <a className="btn btn--ghost btn--sm" href={project.repo2.url} target="_blank" rel="noreferrer">
              <GithubIcon size={16} /> {project.repo2.label}
            </a>
          )}
          {project.repoPrivate && (
            <span className="private-note"><Lock size={14} aria-hidden="true" /> Código privado, disponible en entrevista</span>
          )}
        </div>
        {project.repoNote && <p className="repo-note">{project.repoNote}</p>}
      </div>
    </article>
  )
}
