import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../helpers/useAuth';
import { getProjects } from '../endpoints/projects/list_GET.schema';
import { postCreateProject } from '../endpoints/projects/create_POST.schema';
import styles from './_index.module.css';

type Project = { id:string; title:string; productionType:string; status:string; progress:number; synopsis:string; updatedAt:string };
const prettyDate = (value:string) => {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Edited today';
  return 'Updated ' + date.toLocaleDateString(undefined, { month:'short', day:'numeric' });
};

export default function HomePage(){
 const queryClient=useQueryClient();
 const {authState,logout}=useAuth();
 const [idea,setIdea]=useState(''); const [title,setTitle]=useState(''); const [genre,setGenre]=useState('Short film');
 const [modal,setModal]=useState(false); const [notice,setNotice]=useState('');
 const [active,setActive]=useState('Overview');
 const projectsQuery=useQuery({queryKey:['film-projects'],queryFn:getProjects,staleTime:30000});
 const projects:Project[]=projectsQuery.data?.projects ?? [];
 const createMutation=useMutation({mutationFn:postCreateProject,onSuccess:async()=>{await queryClient.invalidateQueries({queryKey:['film-projects']});setTitle('');setIdea('');setModal(false);setNotice('Your project has been saved to your studio.');},onError:(e:Error)=>setNotice(e.message)});
 function createProject(){if(!title.trim()){setNotice('Please add a project title first.');return;}createMutation.mutate({title:title.trim(),productionType:genre,synopsis:idea.trim()});}
 const ownerName=authState.type==='authenticated'?authState.user.displayName:'Studio Owner';
 return <main className={styles.shell}>
  <aside className={styles.sidebar}>
   <div className={styles.brand}><div className={styles.brandMark}>V</div><div><b>VICKY</b><small>AI FILM STUDIO</small></div></div>
   <div className={styles.navLabel}>WORKSPACE</div>
   <nav>{['Overview','My projects','Characters','Story library'].map((n,i)=><button key={n} onClick={()=>{setActive(n);if(n!=='Overview'&&n!=='My projects')setNotice(n+' workspace is planned for the next production phase.')}} className={active===n?styles.active:''}><span>{['◫','▤','♙','▧'][i]}</span>{n}</button>)}</nav>
   <div className={styles.owner}><div className={styles.ownerAvatar}>W</div><div><b>{ownerName}</b><small>Lifetime owner access</small></div><i/></div>
   <button className={styles.logout} onClick={()=>logout()}>Sign out ↗</button>
   <div className={styles.version}>VICKY STUDIO · PRIVATE BUILD</div>
  </aside>
  <section className={styles.main}>
   <header className={styles.topbar}><span>STUDIO <i>/</i> {active.toUpperCase()}</span><div><small><i/> PRIVATE WORKSPACE</small><b>W</b></div></header>
   <div className={styles.content}>
    <section className={styles.hero}><div><label>YOUR CREATIVE CONTROL ROOM</label><h1>Every great film<br/><em>starts with an idea.</em></h1><p>Welcome to Vicky. Your stories, characters and film productions begin here.</p></div><div className={styles.seal}><strong>V</strong><small>YOUR STUDIO<br/>YOUR STORIES</small></div></section>
    <section className={styles.stats}><div><label>YOUR PROJECTS</label><strong>{String(projects.length).padStart(2,'0')}</strong><small>Saved in your studio</small></div><div><label>SCENES PLANNED</label><strong>—</strong><small>Scene planning is coming next</small></div><div><label>PRODUCTION ENGINE</label><strong className={styles.preparing}>Preparing</strong><small><i/> AI generation is not connected yet</small></div></section>
    <section className={styles.sectionHead}><div><label>MAKE SOMETHING UNFORGETTABLE</label><h2>Start a new production</h2></div><button className={styles.outline} onClick={()=>setModal(true)}>＋ New project</button></section>
    <section className={styles.ideaCard}><div className={styles.ideaTitle}><span>✳</span><div><b>What story do you want to tell?</b><small>Write a rough idea. It doesn't need to be perfect. Vicky will help you shape it.</small></div></div><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="A detective returns to his hometown and discovers that everyone remembers a different version of the same night..." rows={3}/><div className={styles.ideaFoot}><small>YOUR IDEA CAN BE A SINGLE SENTENCE</small><button onClick={()=>{setTitle('');setModal(true);}}>Build my film idea <b>→</b></button></div></section>
    <section className={styles.sectionHead}><div><label>YOUR CREATIVE WORK</label><h2>{active==='My projects'?'All projects':'Recent projects'} <sup>{projects.length}</sup></h2></div><button className={styles.viewAll} onClick={()=>setActive('My projects')}>View all →</button></section>
    {projectsQuery.isLoading?<div className={styles.empty}>Loading your saved productions…</div>:projectsQuery.isError?<div className={styles.empty}>We couldn't load your projects. <button onClick={()=>projectsQuery.refetch()}>Try again</button></div>:projects.length===0?<div className={styles.empty}><b>Your studio is ready for its first story.</b><p>Create a project and it will be saved here automatically.</p><button onClick={()=>setModal(true)}>＋ Create your first project</button></div>:<section className={styles.grid}>{projects.map((p,i)=><article key={p.id} className={styles.project}><div className={i%2===0?styles.artOne:styles.artTwo}><small>PROJECT {String(i+1).padStart(2,'0')}</small><span>{p.title}</span><label>{p.productionType}</label><i/></div><div className={styles.projectBody}><div className={styles.projectMeta}><span>{p.status}</span><small>{prettyDate(p.updatedAt)}</small></div><p>{p.synopsis||'Your film idea will take shape here.'}</p><div className={styles.track}><i style={{width:p.progress+'%'}}/></div><div className={styles.progress}><small>DEVELOPMENT</small><b>{p.progress}%</b></div><button onClick={()=>setNotice('The project workspace for '+p.title+' is the next feature being built.')}>Open project <span>↗</span></button></div></article>)}</section>}
    <section className={styles.next}><span>✦</span><div><label>COMING NEXT</label><h3>Build the story development room</h3><p>Screenplay drafts, character profiles, scene breakdowns and storyboard planning in one guided workflow.</p></div><small>PHASE 03</small></section>
   </div>
  </section>
  {modal&&<div className={styles.backdrop} onClick={()=>setModal(false)}><section className={styles.modal} onClick={e=>e.stopPropagation()}><div className={styles.modalHead}><div><label>NEW PRODUCTION</label><h2>Give your story a name.</h2></div><button onClick={()=>setModal(false)}>×</button></div><label>PROJECT TITLE</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. The Silent City" maxLength={160}/><label>PRODUCTION TYPE</label><select value={genre} onChange={e=>setGenre(e.target.value)}><option>Short film</option><option>Feature film</option><option>Web series</option><option>Documentary</option><option>Animated film</option></select><label>YOUR STORY IDEA (OPTIONAL)</label><textarea value={idea} onChange={e=>setIdea(e.target.value)} rows={4} maxLength={12000} placeholder="Tell Vicky what you have in mind..."/><footer><button onClick={()=>setModal(false)}>Cancel</button><button onClick={createProject} disabled={createMutation.isPending}>{createMutation.isPending?'Saving…':'Create project →'}</button></footer></section></div>}
  {notice&&<div className={styles.notice}>✦ {notice}<button onClick={()=>setNotice('')}>×</button></div>}
 </main>;
}