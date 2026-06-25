import { useEffect, useRef, useState, Suspense } from 'react';
import { categories, type Variant, type Category } from './effects';
import { initBehaviors, initCursor, type CursorMode } from './behaviors';
import { registry } from './registry';
import './lab.css';

type Bg = 'base' | 'elev' | 'spot';
type Amb = 'off' | 'aurora' | 'mesh' | 'grid' | 'gradient';

// data:{magnetic:'0.3'} -> {'data-magnetic':'0.3'} for spreading onto an element.
const da = (d?: Record<string, string>) =>
  Object.fromEntries(Object.entries(d ?? {}).map(([k, v]) => [`data-${k}`, v]));

function LibDemo({ v }: { v: Variant }) {
  const C = registry[v.component!];
  if (!C) return <span className="spec__missing">missing: {v.component}</span>;
  return (
    <Suspense fallback={<span className="spec__loading">loading…</span>}>
      <C {...(v.props ?? {})}>{v.label}</C>
    </Suspense>
  );
}

function Demo({ kind, v }: { kind: Category['kind']; v: Variant }) {
  if (v.source !== 'bespoke') return <LibDemo v={v} />;
  const cls = v.cls ?? '';
  const has = (s: string) => cls.includes(s);
  const style = v.style as React.CSSProperties | undefined;
  const data = da(v.data);

  switch (kind) {
    case 'button':
      return (
        <button className={`btn ${cls}`} style={style} {...data}>
          {has('bt-shimmer') ? (
            <span>{v.label ?? 'View work'}</span>
          ) : (
            <>
              {v.label ?? 'View work'}
              {has('bt-arrow') && <span className="arr">→</span>}
            </>
          )}
        </button>
      );
    case 'portrait':
      return (
        <button className={`ph ${cls}`} {...data} aria-label="Portrait specimen">
          <span className="port">
            <span className="port__img" />
          </span>
        </button>
      );
    case 'chip':
      return (
        <span className={`cw ${cls}`}>
          <span className="chip">
            {has('ch-dot') && <span className="dot" />}
            <span>{v.label ?? 'TypeScript'}</span>
          </span>
        </span>
      );
    case 'card':
      return (
        <div className={`card ${cls}`} tabIndex={0} {...data}>
          <div className="card__thumb" />
          <div className="card__body">
            <div className="card__title">Realtime dashboard</div>
            <p className="card__sum">Live metrics streamed over WebSockets with an offline cache.</p>
          </div>
          {has('cd-reveal') && <div className="card__cta">View case study →</div>}
        </div>
      );
    case 'link':
      return (
        <a className={`lnk ${cls}`} href="#demo" onClick={(e) => e.preventDefault()}>
          {v.label ?? 'Read more'}
          {has('ln-arrow') && <span className="arr"> →</span>}
        </a>
      );
    case 'heading':
      return (
        <div className={`htxt ${cls}`} data-text={v.label} {...data}>
          {v.label}
        </div>
      );
    case 'bg':
      return <div className={`bgtile ${cls}`} {...data} />;
    case 'loader':
      return (
        <div className={cls}>
          {(has('ld-dots') || has('ld-skeleton')) && (
            <>
              <i />
              <i />
              <i />
            </>
          )}
        </div>
      );
    case 'glass':
      return (
        <div className="glass-scene">
          <span className="glass-scene__blob a" />
          <span className="glass-scene__blob b" />
          <span className="glass-scene__txt">Aa</span>
          <div className={`glass ${cls}`}>
            {v.name}
            <span>backdrop-filter</span>
          </div>
        </div>
      );
  }
}

function badge(v: Variant) {
  if (v.js) return 'JS';
  if (v.live) return 'LIVE';
  return null;
}

export default function Lab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [bg, setBg] = useState<Bg>('base');
  const [amb, setAmb] = useState<Amb>('off');
  const [rm, setRm] = useState(false);
  const [cursor, setCursor] = useState<CursorMode | 'off'>('off');
  const [active, setActive] = useState(categories[0].id);

  // Wire JS-driven specimens once the catalog has rendered.
  useEffect(() => {
    if (!stageRef.current) return;
    return initBehaviors(stageRef.current);
  }, []);

  // Reduced-motion preview toggles a body class (see lab.css).
  useEffect(() => {
    document.body.classList.toggle('rm', rm);
  }, [rm]);

  // Cursor follower / trail.
  useEffect(() => {
    if (cursor === 'off') return;
    return initCursor(cursor);
  }, [cursor]);

  // Highlight the active category in the rail while scrolling.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const replayGlares = () => {
    const btns = stageRef.current?.querySelectorAll<HTMLElement>('.btn.glare');
    btns?.forEach((b) => {
      b.classList.remove('sweep');
      void b.offsetWidth;
      b.classList.add('sweep');
    });
    setTimeout(() => btns?.forEach((b) => b.classList.remove('sweep')), 1800);
  };

  const onStageMove = (e: React.MouseEvent) => {
    if (bg !== 'spot') return;
    const r = stageRef.current!.getBoundingClientRect();
    stageRef.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    stageRef.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const copyCls = (cls?: string) => cls && navigator.clipboard?.writeText(`.${cls.split(' ').join('.')}`);

  const total = categories.reduce((n, c) => n + c.variants.length, 0);

  return (
    <div className="lab">
      {amb !== 'off' && <div className={`ambient amb-${amb}`} aria-hidden="true" />}
      <aside className="rail">
        <div className="rail__brand">
          <b>Interaction<span>·</span>Lab</b>
          <small>{total} specimens · {categories.length} families</small>
        </div>

        <nav>
          <div className="rail__group-label">Families</div>
          <div className="rail__nav">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`rail__link ${active === cat.id ? 'active' : ''}`}
                onClick={() => document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>{cat.code} · {cat.title}</span>
                <span className="n">{cat.variants.length}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="ctlset">
          <div className="rail__group-label">Controls</div>
          <div className="ctlrow">
            <span>Canvas</span>
            <div className="seg">
              <button className={bg === 'base' ? 'on' : ''} onClick={() => setBg('base')}>Base</button>
              <button className={bg === 'elev' ? 'on' : ''} onClick={() => setBg('elev')}>Elev</button>
              <button className={bg === 'spot' ? 'on' : ''} onClick={() => setBg('spot')}>Spot</button>
            </div>
          </div>
          <div className="ctlrow">
            <span>Ambient background</span>
            <div className="seg">
              {(['off', 'aurora', 'mesh', 'grid', 'gradient'] as const).map((a) => (
                <button key={a} className={amb === a ? 'on' : ''} onClick={() => setAmb(a)}>
                  {a === 'off' ? 'Off' : a === 'gradient' ? 'Grad' : a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="ctlrow">
            <span>Cursor</span>
            <div className="seg">
              {(['off', 'ring', 'trail', 'dust', 'comet'] as const).map((m) => (
                <button key={m} className={cursor === m ? 'on' : ''} onClick={() => setCursor(m)}>
                  {m === 'off' ? 'Off' : m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="ctlrow">
            <span>Reduced motion</span>
            <div className="seg">
              <button className={!rm ? 'on' : ''} onClick={() => setRm(false)}>Off</button>
              <button className={rm ? 'on' : ''} onClick={() => setRm(true)}>On</button>
            </div>
          </div>
          <button className="btn-ctl" onClick={replayGlares}>▶ Replay all glares</button>
        </div>
      </aside>

      <div ref={stageRef} className={`stage bgv-${bg}`} onMouseMove={onStageMove}>
        <header className="hero-lab">
          <p className="hero-lab__eyebrow">Portfolio · micro-interaction bench</p>
          <h1>A bench for <em>motion</em>, hover &amp; ambience.</h1>
          <p>
            Every specimen below is the real component with one effect applied. Hover to feel it, fire the
            glares in sync, switch the canvas, or preview the reduced-motion fallback. Pick the ones you
            like by code and I'll wire them into the site.
          </p>
          <div className="hero-lab__legend">
            <span><code>CODE·NN</code> reference id</span>
            <span><code>JS</code> needs a little script</span>
            <span><code>LIVE</code> animates at rest</span>
            <span>teal border = on the site today</span>
          </div>
        </header>

        {categories.map((cat) => (
          <section key={cat.id} id={cat.id} className="cat">
            <div className="cat__head">
              <span className="cat__code">{cat.code}</span>
              <h2>{cat.title}</h2>
            </div>
            <p className="cat__desc">{cat.desc}</p>
            <div className="grid">
              {cat.variants.map((v) => {
                const b = badge(v);
                return (
                  <div key={v.code} className={`spec ${v.current ? 'is-current' : ''}`}>
                    {b && <span className="spec__badge">{b}</span>}
                    <div className="spec__stage">
                      <Demo kind={cat.kind} v={v} />
                    </div>
                    <div className="spec__meta">
                      <span className="spec__code">{v.code}{v.current ? ' · current' : ''}</span>
                      <span className="spec__name">{v.name}</span>
                      <span className="spec__blurb">{v.blurb}</span>
                      {v.cls && (
                        <span className="spec__cls" title="Copy selector" onClick={() => copyCls(v.cls)}>
                          .{v.cls.split(' ').join('.')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <footer style={{ padding: '32px 40px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          dev-only · not shipped · explore/ui-effects-lab
        </footer>
      </div>
    </div>
  );
}
