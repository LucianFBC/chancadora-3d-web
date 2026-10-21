import React,{useMemo,useState} from 'react';
import {Activity, CircleHelp, Cuboid, Layers3, Eye, EyeOff, Play, Pause, RotateCcw, Settings2, Maximize2, ChevronRight, Gauge, ScanLine, Box, ArrowUpRight, Info, Wrench, Download, MonitorPlay} from 'lucide-react';
import CrusherScene,{ITEMS} from './Crusher.jsx';
const MODES=[{id:'general',name:'Vista general',icon:Box,desc:'Modelo ensamblado'}, {id:'exploded',name:'Desensamblado',icon:Layers3,desc:'Vista explotada'}, {id:'running',name:'Funcionamiento',icon:Activity,desc:'Ciclo mecánico'}, {id:'xray',name:'Rayos X',icon:ScanLine,desc:'Estructura interna'}];
function IconButton({Icon,title,onClick,active=false,children}){return <button className={'icon-btn '+(active?'active':'')} onClick={onClick} title={title}><Icon size={17}/>{children&&<span>{children}</span>}</button>}
function App(){
  const [mode,setMode]=useState('general');
  const [selected,setSelected]=useState('shaft');
  const [running,setRunning]=useState(false);
  const [speed,setSpeed]=useState(1);
  const [labels,setLabels]=useState(true);
  const [resetCount,setResetCount]=useState(0);
  const [showHelp,setShowHelp]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  const active=useMemo(()=>ITEMS.find(p=>p.id===selected),[selected]);
  const modeInfo=MODES.find(m=>m.id===mode);
  function changeMode(v){setMode(v);setRunning(v==='running');}
  function toggleFullscreen(){const node=document.querySelector('.simulator');if(!document.fullscreenElement){node?.requestFullscreen?.();setFullscreen(true);}else{document.exitFullscreen?.();setFullscreen(false)}}
  return <main className="simulator">
    <header className="topbar">
      <div className="brand"><div className="brand-icon"><svg viewBox="0 0 40 40" width="35"><polygon points="2,33 17,7 29,33" fill="#65acff"/><polygon points="15,33 28,7 39,33" fill="#2373c0"/><polygon points="9,33 18,18 24,33" fill="#c1e0ff"/></svg></div>
        <div><div className="brand-title">Chancadora de Mandíbulas <span className="alpha">PROTOTIPO V0.1</span></div><div className="brand-subtitle">Simulador mecánico interactivo <span className="middot">·</span> Vista 3D</div></div></div>
      <div className="top-actions"><span className="pill"><span className="status-dot"/> Escena interactiva</span><IconButton Icon={CircleHelp} title="Ayuda" onClick={()=>setShowHelp(true)}/><IconButton Icon={Maximize2} title="Pantalla completa" onClick={toggleFullscreen}/></div>
    </header>
    <section className="workspace">
      <aside className="left-panel panel">
        <div className="panel-title"><span>Componentes</span><span className="count">{ITEMS.length}</span></div>
        <p className="panel-intro">Selecciona una pieza para examinar su función.</p>
        <div className="parts-scroll">{ITEMS.map((part,i)=><button key={part.id} className={'part-item '+(selected===part.id?'selected':'')} onClick={()=>setSelected(part.id)}><span className="part-num">{i+1}</span><span className="part-name">{part.name}</span><ChevronRight size={14} className="part-chevron"/></button>)}</div>
        <div className="panel-foot"><div className="hint-icon"><Wrench size={16}/></div><div>Modelo geométrico provisional<br/><span>Basado en referencias visuales</span></div></div>
      </aside>
      <section className="stage">
        <div className="stage-toolbar"><div className="stage-breadcrumb"><Cuboid size={15}/><span>Escena / Chancadora 3D</span></div><div className="stage-tools"><span className="camera-label">Órbita libre</span><IconButton Icon={RotateCcw} title="Restablecer cámara" onClick={()=>setResetCount(n=>n+1)}/><IconButton Icon={Eye} title="Mostrar / ocultar etiquetas" active={labels} onClick={()=>setLabels(v=>!v)}/></div></div>
        <div className="scene-shell"><CrusherScene mode={mode} running={running} speed={speed} selected={selected} labels={labels} resetCount={resetCount} onSelect={setSelected}/>
          <div className="scene-overlay-top"><span className="scene-tag"><span className="scene-tag-dot"/> {modeInfo.name}</span>{active&&<div className="selected-banner"><div className="banner-heading"><span className="tiny-circle"/> {active.name}</div><div>{active.detail}</div></div>}</div>
          <div className="axis-gizmo"><div className="axis axis-z">Z</div><div className="axis axis-y">Y</div><div className="axis axis-x">X</div></div>
          <div className="scene-overlay-bottom"><div className="scene-tip">Arrastra para rotar <span>·</span> Rueda para zoom <span>·</span> Clic para inspeccionar</div><div className="render-pill">VISTA 3D EN TIEMPO REAL</div></div>
        </div>
        <div className="stage-bottom">
          <div className="modes-header"><div className="modes-title">Modos de visualización</div><div className="modes-hint">Cambia de escena sin salir del visor</div></div>
          <div className="mode-grid">{MODES.map(m=>{const M=m.icon;return <button key={m.id} className={'mode-card '+(mode===m.id?'active':'')} onClick={()=>changeMode(m.id)}><span className="mode-icon"><M size={19}/></span><span className="mode-text"><b>{m.name}</b><small>{m.desc}</small></span><ChevronRight size={15}/></button>})}</div>
          <div className="play-row"><div className="run-controls"><button className={'play-btn '+(running&&mode==='running'?'paused':'')} onClick={()=>{if(mode!=='running')setMode('running');setRunning(v=>mode!=='running'?true:!v)}}>{running&&mode==='running'?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}{running&&mode==='running'?'Pausar mecanismo':'Iniciar funcionamiento'}</button><span className="animation-note">Animación cinemática ilustrativa</span></div><div className="speed-control"><Gauge size={15}/><label htmlFor="speed">Velocidad</label><input id="speed" type="range" min="0.25" max="3" step="0.25" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><strong>{speed.toFixed(2)}×</strong></div></div>
        </div>
      </section>
      <aside className="right-panel"><div className="details panel"><div className="panel-title info-title"><span><span className="tiny-circle number">{Math.max(0,ITEMS.findIndex(x=>x.id===selected))+1}</span> {active?.name||'Información de componente'}</span></div>
        <div className="part-illustration"><div className="blueprint-drawing"><svg viewBox="0 0 360 175" role="img" aria-label="Ilustración técnica decorativa del eje excéntrico">
          <defs><linearGradient id="metal" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#c5d3dc"/><stop offset=".52" stopColor="#728596"/><stop offset="1" stopColor="#354557"/></linearGradient></defs><g transform="translate(30,18)"><rect x="22" y="66" width="276" height="38" rx="12" fill="url(#metal)" stroke="#bacbd6" strokeWidth="2"/><rect x="88" y="47" width="90" height="76" rx="6" fill="url(#metal)" stroke="#bdcedd" strokeWidth="2"/><rect x="174" y="60" width="34" height="50" rx="4" fill="#4f6074" stroke="#91abbc"/><rect x="199" y="67" width="70" height="37" rx="3" fill="url(#metal)" stroke="#abbac7"/><rect x="6" y="75" width="38" height="21" fill="#758899" stroke="#c5d5e0"/><ellipse cx="89" cy="86" rx="8" ry="38" fill="#506579" stroke="#a1b7c9"/><ellipse cx="177" cy="85" rx="7" ry="38" fill="#526b83" stroke="#a1b7c9"/>{Array.from({length:8},(_,i)=><line key={i} x1={120+i*7} y1="53" x2={120+i*7} y2="118" stroke="#c7d6dd" opacity=".6"/>)}<line x1="0" y1="86" x2="320" y2="86" stroke="#e3c66e" strokeDasharray="5 6" opacity=".7"/></g></svg></div><div className="illustration-caption">Ilustración referencial · No corresponde a un plano de fabricación</div></div>
        <div className="data-rows"><div><span>Función</span><strong>{active?.detail||'Haz clic en una pieza para seleccionarla.'}</strong></div><div><span>Material</span><strong>{active?.material||'—'}</strong></div><div><span>Dimensiones</span><strong>Pendientes de verificación</strong></div><div><span>Estado</span><strong>{mode==='running'&&running?'En funcionamiento':'Sin movimiento'}</strong></div></div>
      </div>
      <div className="section panel"><div className="panel-title"><span>Vista de corte</span><ScanLine size={17}/></div><div className="cut-diagram"><div className="cut-inner"><div className="cut-wall cut-left"/><div className="cut-wall cut-right"/><div className="cut-pitman"/><div className="cut-wheel"/><div className="cut-rocks">◆ ◆<br/> ◆ ◆ ◆<br/> ◆ ◆<br/> ◆</div><div className="cut-arrow">↕</div></div><span>Representación esquemática</span></div></div>
      <div className="panel controls"><div className="panel-title"><span>Opciones de visualización</span><Settings2 size={17}/></div><div className="toggle-row"><span><ScanLine size={17}/> Modo rayos X</span><button role="switch" aria-checked={mode==='xray'} className={'switch '+(mode==='xray'?'on':'')} onClick={()=>changeMode(mode==='xray'?'general':'xray')}><i/></button></div><div className="toggle-row"><span><Eye size={17}/> Mostrar etiquetas</span><button role="switch" aria-checked={labels} className={'switch '+(labels?'on':'')} onClick={()=>setLabels(v=>!v)}><i/></button></div><div className="toggle-row"><span><Layers3 size={17}/> Vista explotada</span><button role="switch" aria-checked={mode==='exploded'} className={'switch '+(mode==='exploded'?'on':'')} onClick={()=>changeMode(mode==='exploded'?'general':'exploded')}><i/></button></div></div>
      </aside>
    </section>
    <footer className="footer"><span>Chancadora 3D · Prototipo funcional de visualización</span><span>Referencias: fotografías y plano proporcionados por el usuario <span className="middot">·</span> No usar para fabricación ni cálculos de ingeniería</span></footer>
    {showHelp&&<div className="modal-shade" onClick={()=>setShowHelp(false)}><section className="modal" onClick={e=>e.stopPropagation()}><header><h2>Controles del simulador</h2><button onClick={()=>setShowHelp(false)}>✕</button></header><p>Este prototipo incluye geometría aproximada generada por código, no una reconstrucción CAD verificada.</p><ul><li><b>Arrastrar</b> para rotar la cámara</li><li><b>Rueda del ratón</b> para acercar o alejar</li><li><b>Clic en una pieza</b> para ver su información</li><li><b>Modos</b> para funcionamiento, transparencia y despiece</li><li><b>Velocidad</b> para acelerar o reducir el ciclo</li></ul><button className="play-btn" onClick={()=>setShowHelp(false)}>Entendido</button></section></div>}
  </main>
}
export default App;
