import { useEffect, useRef, useState, Suspense } from 'react';
import { categories, type Variant, type Category } from './effects';
import { initCursor, type CursorMode } from './behaviors';
import { registry } from './registry';
import './lab.css';

type Bg = 'base' | 'elev' | 'spot';
type Amb = 'off' | 'aurora' | 'mesh' | 'grid' | 'gradient';

const SRC_COLOR: Record<Variant['source'], string> = {
  reactbits: 'var(--src-reactbits)',
  shadcn: 'var(--src-shadcn)',
  bespoke: 'var(--src-bespoke)',
};

function LibDemo({ v }: { v: Variant }) {
  const C = registry[v.component!];
  if (!C) return <span className="spec__missing">missing: {v.component}</span>;
  return (
    <Suspense fallback={<span className="spec__shimmer" aria-hidden="true" />}>
      <C {...(v.props ?? {})}>{v.label}</C>
    </Suspense>
  );
}

function Demo({ kind, v }: { kind: Category['kind']; v: Variant }) {
  if (kind === 'glass') {
    return (
      <div className="glass-scene">
        <span className="glass-scene__blob a" />
        <span className="glass-scene__blob b" />
        <span className="glass-scene__txt">Aa</span>
        {v.source === 'bespoke'
          ? <div className={`glass ${v.cls ?? ''}`}>{v.name}<span>backdrop-filter</span></div>
          : <LibDemo v={v} />}
      </div>
    );
  }
  if (v.source !== 'bespoke') return <LibDemo v={v} />;

  // Remaining bespoke families: chips (C), links (E), loaders (H).
  const cls = v.cls ?? '';
  const has = (s: string) => cls.includes(s);

  switch (kind) {
    case 'chip':
      return (
        <span className={`cw ${cls}`}>
          <span className="chip">
            {has('ch-dot') && <span className="dot" />}
            <span>{v.label ?? 'TypeScript'}</span>
          </span>
        </span>
      );
    case 'link':
      return (
        <a className={`lnk ${cls}`} href="#demo" onClick={(e) => e.preventDefault()}>
          {v.label ?? 'Read more'}
          {has('ln-arrow') && <span className="arr"> →</span>}
        </a>
      );
    case 'loader':
      return (
        <div className={cls}>
          {has('ld-dots') && (
            <>
              <i />
              <i />
              <i />
            </>
          )}
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
  const [source, setSource] = useState<'all' | 'reactbits' | 'shadcn' | 'bespoke'>('all');
  const [active, setActive] = useState(categories[0].id);

  // Reduced-motion preview toggles a body class (see lab.css).
  useEffect(() => {
    document.body.classList.toggle('rm', rm);
  }, [rm]);

  // Cursor follower / trail.
  useEffect(() => {
    if (cursor === 'off') return;
    return initCursor(cursor);
  }, [cursor]);

  // Highlight the active family in the rail while scrolling.
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

  const onStageMove = (e: React.MouseEvent) => {
    if (bg !== 'spot') return;
    const r = stageRef.current!.getBoundingClientRect();
    stageRef.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    stageRef.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const copyCls = (cls?: string) => cls && navigator.clipboard?.writeText(`.${cls.split(' ').join('.')}`);
  const copyInstall = (s?: string) => s && navigator.clipboard?.writeText(s);

  const total = categories.reduce((n, c) => n + c.variants.length, 0);
  const libCount = categories.reduce((n, c) => n + c.variants.filter((v) => v.source !== 'bespoke').length, 0);

  const sections = categories.map((cat) => ({
    cat,
    items: source === 'all' ? cat.variants : cat.variants.filter((v) => v.source === source),
  }));
  const shown = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="lab">
      {amb !== 'off' && <div className={`ambient amb-${amb}`} aria-hidden="true" />}
      <aside className="rail">
        <div className="rail__brand">
          <b>Interaction<span>·</span>Lab</b>
          <small>{total} specimens · {categories.length} families</small>
          <small className="rail__stat">{libCount}/{total} now from libraries · {total - libCount} bespoke</small>
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
                <span className="rail__mono">{cat.code}</span>
                <span className="rail__title">{cat.title}</span>
                <span className="n">{cat.variants.length}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="ctlset">
          <div className="rail__group-label">View</div>
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
        </div>
      </aside>

      <div ref={stageRef} className={`stage bgv-${bg}`} onMouseMove={onStageMove}>
        <div className="toolbar">
          <div className="toolbar__group">
            <span className="toolbar__label">Source</span>
            <div className="seg">
              {(['all', 'reactbits', 'shadcn', 'bespoke'] as const).map((s) => (
                <button key={s} className={source === s ? 'on' : ''} onClick={() => setSource(s)}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
          <span className="toolbar__count">showing <b>{shown}</b> of {total}</span>
        </div>

        <header className="hero-lab">
          <p className="hero-lab__eyebrow">Portfolio · micro-interaction bench</p>
          <h1>A bench for <em>motion</em>, hover &amp; ambience.</h1>
          <p>
            Every specimen below is the real component with one effect applied. Hover to feel it, switch
            the canvas, filter by source, or preview the reduced-motion fallback. Pick the ones you like
            by code and I'll wire them into the site.
          </p>
          <div className="hero-lab__legend">
            <span><code>CODE·NN</code> reference id</span>
            <span><code>JS</code> needs a little script</span>
            <span><code>LIVE</code> animates at rest</span>
            <span>teal frame = on the site today</span>
          </div>
        </header>

        {shown === 0 ? (
          <div className="lab-empty">
            No specimens from “{source}”. Switch the source filter back to <b>All</b> to see all {total}.
          </div>
        ) : (
          sections.map(({ cat, items }) => {
            if (items.length === 0) return null;
            return (
              <section key={cat.id} id={cat.id} className="cat">
                <div className="cat__head">
                  <span className="cat__code">{cat.code}</span>
                  <h2>{cat.title}</h2>
                  <span className="cat__rule" aria-hidden="true" />
                  <span className="cat__count">{items.length} {items.length === 1 ? 'specimen' : 'specimens'}</span>
                  <span className="cat__ghost" aria-hidden="true">{cat.code}</span>
                </div>
                <p className="cat__desc">{cat.desc}</p>
                <div className="lab-grid">
                  {items.map((v) => {
                    const b = badge(v);
                    return (
                      <div key={v.code} className={`spec ${v.current ? 'is-current' : ''}`}>
                        {b && <span className="spec__badge">{b}</span>}
                        <div className="spec__stage" data-demo={v.source !== 'bespoke' ? v.component : undefined}>
                          <Demo kind={cat.kind} v={v} />
                        </div>
                        <div className="spec__meta">
                          <div className="spec__meta-top">
                            <span className="spec__code">{v.code}{v.current ? ' · current' : ''}</span>
                            <span className="spec__src" style={{ '--src-c': SRC_COLOR[v.source] } as React.CSSProperties}>
                              {v.source}
                            </span>
                          </div>
                          <span className="spec__name">{v.name}</span>
                          <span className="spec__blurb">{v.blurb}</span>
                          {v.cls && (
                            <span className="spec__cls" title="Copy selector" onClick={() => copyCls(v.cls)}>
                              .{v.cls.split(' ').join('.')}
                            </span>
                          )}
                          {v.install && (
                            <span className="spec__cls" title="Copy install command" onClick={() => copyInstall(v.install)}>
                              ⧉ {v.component} · {v.siteTarget}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        <footer className="lab-footer">
          dev-only · not shipped · explore/ui-lab-v2
        </footer>
      </div>
    </div>
  );
}
