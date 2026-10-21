import React, {useMemo,useRef,useEffect} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';

const c = {
  steel:'#536171', edge:'#8191a3', dark:'#2a3441', inner:'#89929d', jaw:'#d89032',
  wear:'#d9a94d', orange:'#bd4d31', belt:'#18202b', motor:'#1872c5', spring:'#748695', rock:'#aab0b4'
};
export const ITEMS = [
  {id:'hopper',name:'Tolva de alimentación',detail:'Recibe y dirige el material hacia la cámara de trituración.',material:'Acero estructural'},
  {id:'fixed',name:'Mandíbula fija',detail:'Superficie estacionaria contra la cual se comprime el mineral.',material:'Acero y placa antidesgaste'},
  {id:'moving',name:'Mandíbula móvil',detail:'Oscila mediante el accionamiento del eje excéntrico.',material:'Acero y placa antidesgaste'},
  {id:'liners',name:'Placas de desgaste',detail:'Superficies reemplazables que reciben la abrasión del material.',material:'Aleación antidesgaste'},
  {id:'shaft',name:'Eje excéntrico',detail:'Convierte el movimiento rotativo en desplazamiento oscilante.',material:'Acero aleado'},
  {id:'flywheel',name:'Volante de inercia',detail:'Acumula energía y ayuda a estabilizar el ciclo de trituración.',material:'Acero / fundición'},
  {id:'pitman',name:'Biela / pitman',detail:'Transmite el movimiento del eje excéntrico al conjunto móvil.',material:'Acero estructural'},
  {id:'toggle',name:'Placa de articulación',detail:'Transmite el empuje hacia la mandíbula móvil.',material:'Acero'},
  {id:'spring',name:'Resorte de tensión',detail:'Colabora con el retorno y la sujeción del mecanismo.',material:'Acero para resortes'},
  {id:'motor',name:'Motor eléctrico',detail:'Proporciona el accionamiento rotativo de la transmisión.',material:'Acero, cobre, aluminio'},
  {id:'belt',name:'Poleas y correas',detail:'Transmiten la rotación desde el motor hasta el volante.',material:'Metal y elastómero'},
  {id:'frame',name:'Bastidor',detail:'Estructura principal que soporta y posiciona los mecanismos.',material:'Acero estructural'},
  {id:'outlet',name:'Tolva de descarga',detail:'Permite salir al material tras la reducción de tamaño.',material:'Acero estructural'}
];
const kinematics = { phase:0 };

function Mat({ color, ghost=false, selected=false, metalness=.47, roughness=.48 }){
  return <meshStandardMaterial color={selected?'#f2c165':color} metalness={metalness} roughness={roughness} transparent={ghost} opacity={ghost ? .16 : 1} depthWrite={!ghost} emissive={selected?'#7e4815':'#000000'} emissiveIntensity={selected ? .22 : 0}/>;
}
function Box({position=[0,0,0],args=[1,1,1],rotation=[0,0,0],color,ghost=false,selected=false}){
  return <mesh position={position} rotation={rotation} castShadow={!ghost} receiveShadow><boxGeometry args={args}/><Mat color={color} ghost={ghost} selected={selected}/></mesh>;
}
function Cyl({position=[0,0,0],radius=.2,depth=.2,rotation=[Math.PI/2,0,0],color,selected=false,ghost=false,segments=40}){
  return <mesh position={position} rotation={rotation} castShadow><cylinderGeometry args={[radius,radius,depth,segments]}/><Mat color={color} selected={selected} ghost={ghost}/></mesh>;
}
function Part({id,base=[0,0,0],shift=[0,0,0],mode,selected,onSelect,children}){
  const group = useRef();
  useFrame((_,dt)=>{
    if(!group.current)return;
    const t=mode==='exploded'?1:0;
    const k=1-Math.exp(-Math.min(dt,.05)*5);
    group.current.position.x=THREE.MathUtils.lerp(group.current.position.x,base[0]+shift[0]*t,k);
    group.current.position.y=THREE.MathUtils.lerp(group.current.position.y,base[1]+shift[1]*t,k);
    group.current.position.z=THREE.MathUtils.lerp(group.current.position.z,base[2]+shift[2]*t,k);
  });
  return <group ref={group} position={base} onClick={e=>{e.stopPropagation();onSelect(id);}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}>{children}</group>;
}
function Hopper({ghost,selected}){
  const geom=useMemo(()=>{
    const bottom=[[-.62,0,-.44],[.62,0,-.44],[.62,0,.44],[-.62,0,.44]];
    const top=[[-1.02,.75,-.72],[1.02,.75,-.72],[1.02,.75,.72],[-1.02,.75,.72]];
    const verts=[];
    for(let i=0;i<4;i++){let j=(i+1)%4;[bottom[i],bottom[j],top[j],bottom[i],top[j],top[i]].forEach(p=>verts.push(...p));}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();return g;
  },[]);
  return <group><mesh geometry={geom} castShadow receiveShadow><meshStandardMaterial color={selected?'#d2ddea':c.steel} metalness={.7} roughness={.44} side={THREE.DoubleSide} transparent={ghost} opacity={ghost ? .17 : 1} depthWrite={!ghost}/></mesh>
    {[[-1.02,.75,-.72],[1.02,.75,-.72],[1.02,.75,.72],[-1.02,.75,.72]].map((p,i)=>{
      let q=[[-1.02,.75,-.72],[1.02,.75,-.72],[1.02,.75,.72],[-1.02,.75,.72]][(i+1)%4];
      let d=new THREE.Vector3(...q).sub(new THREE.Vector3(...p));let m=new THREE.Vector3(...p).add(new THREE.Vector3(...q)).multiplyScalar(.5);
      return <mesh key={i} position={m.toArray()} rotation={[0,-Math.atan2(d.z,d.x),0]} castShadow><boxGeometry args={[d.length(),.055,.075]}/><Mat color={c.edge} ghost={ghost} selected={selected}/></mesh>;
    })}
  </group>;
}
function Jaw({move=false,ghost=false,selected=false,phase=0}){
  return <group position={move?[.32+Math.sin(phase)*.075,1.52,.40]:[-.83,1.51,.40]} rotation={[0,0,move?-.20+Math.sin(phase)*.04:.13]}>
    <Box args={[.31,1.65,.66]} color={move?c.inner:c.edge} ghost={ghost} selected={selected}/>
    <Box args={[.11,1.54,.70]} position={[move?-.22:.22,0,0]} color={c.wear} ghost={ghost} selected={selected}/>
    {Array.from({length:10},(_,i)=><Box key={i} args={[.035,.10,.71]} position={[move?-.29:.29,-.68+i*.15,0]} color={c.jaw} ghost={ghost} selected={selected}/>)}
  </group>;
}
function JawComponent({move=false,mode,running,speed,selected}){
  const ref=useRef();
  useFrame(()=>{if(ref.current)ref.current.rotation.z=(move&&running&&mode==='running')?Math.sin(kinematics.phase)*.055:0;});
  return <group ref={ref}><Jaw move={move} ghost={mode==='xray'&& !move} selected={selected} phase={running&&mode==='running'?kinematics.phase:0}/></group>;
}
function FlyWheel({selected,running,mode}){
  const spinning=useRef();
  useFrame(()=>{if(spinning.current && mode==='running'&&running) spinning.current.rotation.z=kinematics.phase;});
  return <group ref={spinning}>
    <mesh position={[0,0,0]} castShadow><torusGeometry args={[.76,.135,14,64]}/><Mat color={c.orange} selected={selected}/></mesh>
    {Array.from({length:5},(_,i)=><Box key={i} args={[.19,1.40,.18]} rotation={[0,0,i*Math.PI*2/5]} color={c.orange} selected={selected}/>)}
    <Cyl position={[0,0,.10]} radius={.25} depth={.40} color={c.edge} selected={selected}/>
    <Cyl position={[0,0,.35]} radius={.11} depth={.1} color={'#b5bac4'} selected={selected}/>
  </group>;
}
function Shaft({selected,running,mode}){
  const ref=useRef();
  useFrame(()=>{if(ref.current&&mode==='running'&&running)ref.current.rotation.z=kinematics.phase;});
  return <group ref={ref}>
    <Cyl depth={2.45} radius={.18} color={'#c0c9d0'} selected={selected}/>
    <Cyl position={[0,0,.68]} radius={.28} depth={.15} color={c.edge} selected={selected}/>
    <Cyl position={[0,.07,-.2]} radius={.25} depth={.40} color={c.inner} selected={selected}/>
    <Cyl position={[0,0,-1.12]} radius={.27} depth={.13} color={c.edge} selected={selected}/>
  </group>;
}
function Springs({selected}){
  const curve=useMemo(()=>{
    let points=[];for(let i=0;i<=140;i++){const t=i/140;let a=t*2*Math.PI*10;points.push(new THREE.Vector3(t*.96-.48,Math.sin(a)*.12,Math.cos(a)*.12));}return new THREE.CatmullRomCurve3(points);
  },[]);
  return <group><mesh><tubeGeometry args={[curve,150,.037,8,false]}/><Mat color={c.spring} selected={selected}/></mesh>
   <Box args={[1.4,.06,.06]} position={[0,0,0]} color={c.edge} selected={selected}/>
   <Box args={[.14,.38,.43]} position={[-.63,0,0]} color={c.dark} selected={selected}/>
   <Box args={[.14,.38,.43]} position={[.63,0,0]} color={c.dark} selected={selected}/>
  </group>;
}
function Motor({selected,running,mode}){
  const rotor=useRef();
  useFrame(()=>{if(rotor.current && mode==='running'&&running)rotor.current.rotation.z=kinematics.phase*1.6;});
  return <group>
    <Cyl position={[0,0,0]} radius={.45} depth={1.1} color={c.motor} selected={selected}/>
    {Array.from({length:11},(_,i)=><Cyl key={i} position={[0,0,-.46+i*.09]} radius={.475} depth={.034} color={'#2585d7'} selected={selected}/>)}
    <Cyl position={[0,0,-.67]} radius={.39} depth={.23} color={'#145b99'} selected={selected}/>
    <Box position={[0,-.47,-.25]} args={[.74,.16,.85]} color={'#1d66a4'} selected={selected}/>
    <Box position={[0,.48,0]} args={[.32,.17,.4]} color={'#226cae'} selected={selected}/>
    <group ref={rotor}><Cyl position={[0,0,.67]} radius={.20} depth={.2} color={c.edge} selected={selected}/></group>
  </group>;
}
function Belt({selected}){
  const curve=useMemo(()=>{
    const pts=[[-.49,.62],[-.35,.77],[.24,.75],[.92,.38],[1.23,.22],[1.46,.10],[1.45,-.13],[1.28,-.25],[.89,-.18],[.18,-.62],[-.29,-.74],[-.52,-.60],[-.77,-.21],[-.73,.25],[-.49,.62]].map(p=>new THREE.Vector3(p[0],p[1],0));
    return new THREE.CatmullRomCurve3(pts,true,'catmullrom',.3);
  },[]);
  return <group><mesh><tubeGeometry args={[curve,140,.054,8,true]}/><meshStandardMaterial color={selected?'#f1c56c':c.belt} roughness={.9}/></mesh>
    <Cyl radius={.42} depth={.12} color={'#2b3542'} selected={selected}/>
    <Cyl position={[1.11,-.07,0]} radius={.24} depth={.12} color={'#384553'} selected={selected}/>
  </group>;
}
function Rocks({running,mode}){
  const ref=useRef();
  const points=useMemo(()=>Array.from({length:20},(_,i)=>({x:Math.sin(i*9.27)*.49,y:2.22+((i*7)%13)*.052,z:Math.cos(i*4.3)*.32,size:.10+((i*3)%5)*.024,rot:i*1.1})),[]);
  useFrame(()=>{if(ref.current)ref.current.rotation.y=mode==='running'&&running?Math.sin(kinematics.phase*.5)*.035:0;});
  return <group ref={ref}>
    {points.map((p,i)=><mesh key={i} position={[p.x,p.y,p.z]} rotation={[p.rot,p.rot*.3,p.rot*.7]} castShadow><icosahedronGeometry args={[p.size,0]}/><meshStandardMaterial color={i%4===0?'#7a8088':i%3===0?'#8e959f':'#aaa8a2'} roughness={1}/></mesh>)}
  </group>;
}
function Labels({items,show,onSelect}){
  if(!show)return null;
  const marks=[['hopper',[-.95,3.45,.45]],['fixed',[-1.17,1.92,1.01]],['moving',[.52,1.78,1.06]],['flywheel',[1.0,2.15,-.28]],['motor',[2.65,1.5,.4]],['spring',[1.42,.78,1.4]]];
  return marks.map(([id,at])=><Html key={id} position={at} distanceFactor={12} center occlude={false}><button className="model-tag" onClick={()=>onSelect(id)}>{items.find(x=>x.id===id)?.name}</button></Html>);
}
function CameraControl({mode,resetCount}){
  const {camera}=useThree(); const controls=useRef();
  useEffect(()=>{
    camera.position.set(mode==='xray'?5.3:mode==='exploded'?6.2:6.6,mode==='xray'?2.5:4.4,mode==='xray'?4.0:7.3);
    controls.current?.target.set(.32,1.42,0);
    controls.current?.update();
  },[mode,resetCount,camera]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.08} minDistance={3.3} maxDistance={16} minPolarAngle={.15} maxPolarAngle={Math.PI*.5} />;
}
function Machine({mode,selected,onSelect,running,speed,labels,resetCount}){
  const ghost=mode==='xray';const sel=(id)=>selected===id;
  useFrame((_,delta)=>{if(running&&mode==='running')kinematics.phase+=delta*speed*2.9;});
  return <>
  <color attach="background" args={['#122335']}/>
  <ambientLight intensity={1.05}/>
  <hemisphereLight intensity={1.2} groundColor="#1c2833" color="#d6e8ff"/>
  <directionalLight position={[3.5,8,6]} intensity={3.2} castShadow shadow-mapSize={[2048,2048]}/>
  <directionalLight position={[-6,4,-5]} intensity={1.3} color="#7babf2"/>
  <group rotation={[0,-.18,0]}>
    <Part id="frame" mode={mode} selected={selected} onSelect={onSelect}>
      <Box args={[5.2,.20,3.5]} position={[.55,.11,-.22]} color={'#4e5864'} selected={sel('frame')}/>
      {[-1,1].flatMap(x=>[-1,1].map((z,i)=><Box key={`${x}-${z}`} args={[.18,1.05,.2]} position={[.65+x*2.3,.65,-.28+z*1.48]} color={c.dark} ghost={ghost} selected={sel('frame')}/>))}
      {[[-1.47,.59,1.02],[-1.47,.59,-1.38],[1.65,.59,1.05],[1.65,.59,-1.38]].map((p,i)=><Box key={i} args={[.21,.90,.23]} position={p} color={c.steel} ghost={ghost} selected={sel('frame')}/>)}
      <Box args={[2.1,.24,1.4]} position={[-.55,.40,.05]} color={c.dark} ghost={ghost} selected={sel('frame')}/>
      <Box args={[2.2,.15,1.5]} position={[1.9,.44,-.65]} color={c.dark} ghost={ghost} selected={sel('frame')}/>
      <Box args={[.25,2.16,1.55]} position={[-1.44,1.45,.07]} color={c.steel} ghost={ghost} selected={sel('frame')}/>
      <Box args={[.23,2.12,1.55]} position={[.66,1.45,.07]} color={c.dark} ghost={ghost} selected={sel('frame')}/>
      <Box args={[1.95,.2,1.56]} position={[-.39,2.60,.02]} color={c.edge} ghost={ghost} selected={sel('frame')}/>
    </Part>
    <Part id="hopper" base={[-.38,2.61,.05]} shift={[-1.5,1.5,.1]} mode={mode} selected={selected} onSelect={onSelect}><Hopper ghost={ghost} selected={sel('hopper')}/></Part>
    <Part id="fixed" shift={[-1.1,0,.7]} mode={mode} selected={selected} onSelect={onSelect}><JawComponent mode={mode} selected={sel('fixed')}/></Part>
    <Part id="moving" shift={[1.05,.15,1.15]} mode={mode} selected={selected} onSelect={onSelect}><JawComponent move mode={mode} running={running} speed={speed} selected={sel('moving')}/></Part>
    <Part id="liners" base={[-.6,1.54,1.00]} shift={[0,0,1.7]} mode={mode} selected={selected} onSelect={onSelect}>
      {Array.from({length:9},(_,i)=><Box key={i} args={[.19,.07,.09]} position={[.15,-.7+i*.16,0]} color={c.wear} selected={sel('liners')}/>)}
    </Part>
    <Part id="pitman" base={[.25,1.7,-.12]} shift={[.1,.5,-1.15]} mode={mode} selected={selected} onSelect={onSelect}>
      <Box args={[.56,1.28,.68]} rotation={[0,0,-.20]} color={c.inner} ghost={ghost} selected={sel('pitman')}/>
      <Cyl position={[.11,.54,.08]} radius={.31} depth={.76} color={c.edge} selected={sel('pitman')}/>
    </Part>
    <Part id="shaft" base={[.47,2.32,-.46]} shift={[0,.45,-1.35]} mode={mode} selected={selected} onSelect={onSelect}><Shaft selected={sel('shaft')} running={running} mode={mode}/></Part>
    <Part id="flywheel" base={[.48,2.31,-1.72]} shift={[0,0,-1.5]} mode={mode} selected={selected} onSelect={onSelect}><FlyWheel selected={sel('flywheel')} running={running} mode={mode}/></Part>
    <Part id="toggle" base={[.73,.71,.58]} shift={[.95,-.2,.85]} mode={mode} selected={selected} onSelect={onSelect}>
      <Box args={[1.09,.17,.45]} position={[.12,0,0]} rotation={[0,0,.31]} color={c.edge} selected={sel('toggle')}/>
    </Part>
    <Part id="spring" base={[1.08,.76,1.05]} shift={[.9,0,.8]} mode={mode} selected={selected} onSelect={onSelect}><Springs selected={sel('spring')}/></Part>
    <Part id="motor" base={[2.2,1.05,-.87]} shift={[2.0,0,-.5]} mode={mode} selected={selected} onSelect={onSelect}><Motor selected={sel('motor')} running={running} mode={mode}/></Part>
    <Part id="belt" base={[1.02,1.85,-.13]} shift={[0,1.4,-.85]} mode={mode} selected={selected} onSelect={onSelect}><Belt selected={sel('belt')}/></Part>
    <Part id="outlet" base={[-.46,.39,.20]} shift={[-1.3,-.4,.35]} mode={mode} selected={selected} onSelect={onSelect}>
      <Box args={[1.22,.2,.93]} position={[0,0,.11]} rotation={[0,0,-.19]} color={c.orange} selected={sel('outlet')}/>
      <Box args={[1.24,.20,.11]} position={[0,-.16,.56]} color={c.edge} selected={sel('outlet')}/>
    </Part>
    <Rocks mode={mode} running={running}/>
    <Labels items={ITEMS} show={labels} onSelect={onSelect}/>
  </group>
  <ContactShadows position={[0,-.02,0]} opacity={.37} scale={14} blur={2.6} far={5}/>
  <Grid position={[0,-.03,0]} args={[20,20]} cellSize={.6} cellThickness={.35} cellColor="#284058" sectionSize={3} sectionThickness={.8} sectionColor="#334f6a" fadeDistance={20} fadeStrength={2} infiniteGrid />
  <CameraControl mode={mode} resetCount={resetCount}/>
  </>;
}
export default function CrusherScene(props){
  return <Canvas shadows camera={{position:[6.6,4.4,7.3],fov:39,near:.1,far:100}} dpr={[1,1.7]} gl={{antialias:true,alpha:false}} onPointerMissed={()=>props.onSelect(null)}>
    <Machine {...props}/>
  </Canvas>;
}
