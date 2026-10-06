import React, { useState, useEffect } from 'react';
import { DEFAULT_PROJECTS } from './data/defaultProjects';
import { ProductionProject, ShotItem, CharacterProfile } from './types/producer';
import { produceVideoProject, ProduceParams } from './services/geminiProducer';
import { UserProfile, OWNER_EMAIL } from './types/auth';
import {
  getCurrentUser,
  checkCanProduceVideo,
  deductQuotaAfterProduction,
  saveCurrentUser,
} from './services/authService';
import { TopBar } from './components/TopBar';
import { ExecutiveHero } from './components/ExecutiveHero';
import { DirectorMonitor } from './components/DirectorMonitor';
import { TimelineTracks } from './components/TimelineTracks';
import { AutonomousDecisionsPanel } from './components/AutonomousDecisionsPanel';
import { ConnectorsHub } from './components/ConnectorsHub';
import { PitchModal } from './components/PitchModal';
import { ShotDetailModal } from './components/ShotDetailModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { TransactionUploadModal } from './components/TransactionUploadModal';
import { AuthModal } from './components/AuthModal';
import { CharacterUploadModal } from './components/CharacterUploadModal';
import { RenderVideoModal } from './components/RenderVideoModal';
import { AiStudioLab } from './components/AiStudioLab';
import {
  VideoTutorialOverlay,
  TUTORIAL_AUTOPLAY_STORAGE_KEY,
  TUTORIAL_SEEN_STORAGE_KEY,
} from './components/VideoTutorialOverlay';
import {
  Check,
  Download,
  Film,
  Sparkles,
  Layers,
  Crown,
  CreditCard,
  ScanFace,
  Video,
  Loader2,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [projects, setProjects] = useState<ProductionProject[]>(DEFAULT_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [activeShotIndex, setActiveShotIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('director_deck');
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [selectedCharacterForEdit, setSelectedCharacterForEdit] = useState<CharacterProfile | null>(null);
  const [isProducing, setIsProducing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStageText, setExportStageText] = useState<string>('');
  const [inspectingShot, setInspectingShot] = useState<ShotItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync user state on load & check first-time visitor tutorial Auto-Play
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    try {
      const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_STORAGE_KEY);
      const autoPlayEnabled = localStorage.getItem(TUTORIAL_AUTOPLAY_STORAGE_KEY);
      if (!hasSeenTutorial && autoPlayEnabled !== 'false') {
        setIsTutorialOpen(true);
      }
    } catch {}
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSelectProject = (proj: ProductionProject) => {
    setCurrentProjectId(proj.id);
    setActiveShotIndex(0);
  };

  const handleProduceNew = async (params: ProduceParams) => {
    // Check user plan & quota
    const requestedDurationSec = params.duration || 20;
    const quotaCheck = checkCanProduceVideo(currentUser, requestedDurationSec);

    if (!quotaCheck.allowed) {
      setIsSubscriptionModalOpen(true);
      showToast(quotaCheck.reason || 'Payment required to produce video.');
      return;
    }

    setIsProducing(true);
    try {
      const newProj = await produceVideoProject(params);
      setProjects((prev) => [newProj, ...prev]);
      setCurrentProjectId(newProj.id);
      setActiveShotIndex(0);
      setIsPitchModalOpen(false);

      // Deduct quota for non-owner users
      const updatedUser = deductQuotaAfterProduction(currentUser, newProj.targetDurationSec);
      setCurrentUser(updatedUser);

      showToast(`vicky.AI produced: "${newProj.title}"`);
    } catch (err) {
      console.error(err);
      showToast('Production error occurred. Try again.');
    } finally {
      setIsProducing(false);
    }
  };

  const handleSaveShot = (updatedShot: ShotItem) => {
    const updatedShots = currentProject.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s));
    const updatedProject: ProductionProject = {
      ...currentProject,
      shots: updatedShots,
    };
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    showToast(`Updated Shot ${updatedShot.shotNumber} specs`);
  };

  const handleSaveCharacter = (character: CharacterProfile) => {
    const existingIndex = currentProject.autonomousDecisions.characterBible.findIndex(
      (c) => c.name.toLowerCase() === character.name.toLowerCase()
    );

    let updatedBible: CharacterProfile[] = [];
    if (existingIndex !== -1) {
      updatedBible = currentProject.autonomousDecisions.characterBible.map((c, i) =>
        i === existingIndex ? character : c
      );
    } else {
      updatedBible = [...currentProject.autonomousDecisions.characterBible, character];
    }

    // Propagate character image & prompt tags to matching shots
    const updatedShots = currentProject.shots.map((s) => {
      if (s.character === character.name || !s.character) {
        return {
          ...s,
          character: character.name,
          imagePreviewUrl: character.imageUrl || s.imagePreviewUrl,
          visualPrompt: `${s.visualPrompt} [face_lock: ${character.name}] [posture: ${character.bodyPosture || 'Heroic'}]`,
        };
      }
      return s;
    });

    const updatedProject: ProductionProject = {
      ...currentProject,
      shots: updatedShots,
      autonomousDecisions: {
        ...currentProject.autonomousDecisions,
        characterBible: updatedBible,
      },
    };

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    showToast(`Saved character "${character.name}" with Face ID & ${character.bodyPosture} posture lock`);
  };

  const handleRefineWithVicky = async (shot: ShotItem, instruction: string) => {
    try {
      const res = await fetch('/api/vicky/refine-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shot, instruction, style: currentProject.style }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.refined) {
          handleSaveShot({
            ...shot,
            ...data.refined,
          });
          showToast(`Vicky autonomously refined Shot ${shot.shotNumber}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Refinement fallback:', e);
    }
    // Local autonomous refinement fallback
    handleSaveShot({
      ...shot,
      title: `${shot.title} (Director Refinement)`,
      visualPrompt: `${shot.visualPrompt}, refined dynamic angle: ${instruction}`,
    });
    showToast(`Vicky refined Shot ${shot.shotNumber}`);
  };

  const handleAddShot = () => {
    const nextNumber = currentProject.shots.length + 1;
    const defaultChar = currentProject.autonomousDecisions.characterBible[0];
    const newShot: ShotItem = {
      id: `shot_${Date.now()}`,
      shotNumber: nextNumber,
      title: `Shot ${nextNumber}: Story Beat`,
      durationSec: 5,
      shotType: 'Medium',
      cameraMotion: 'Slow Push-In',
      lensMm: '35mm Cine Prime',
      visualPrompt: `Cinematic continuation shot for ${currentProject.title}, matching color grading and atmosphere ${
        defaultChar ? `featuring ${defaultChar.name}` : ''
      }`,
      imagePreviewUrl: defaultChar?.imageUrl || currentProject.shots[0]?.imagePreviewUrl,
      character: defaultChar?.name || 'Protagonist',
      voiceover: 'The story moves onward into new territory.',
      sfx: ['Ambient environment', 'Subtle musical drone'],
      transition: 'Cross Dissolve',
    };

    const updatedProject: ProductionProject = {
      ...currentProject,
      shots: [...currentProject.shots, newShot],
      targetDurationSec: currentProject.targetDurationSec + 5,
    };

    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setActiveShotIndex(currentProject.shots.length);
    showToast(`Added Shot ${nextNumber} to timeline`);
  };

  const handleExportAll = async () => {
    // If not owner and has no active plan, prompt payment
    if (!currentUser.isOwner && currentUser.plan === 'none') {
      setIsSubscriptionModalOpen(true);
      showToast('Export package requires an active plan ($3 single pass or $250 monthly).');
      return;
    }

    if (isExporting) return;

    setIsExporting(true);
    setExportProgress(20);
    setExportStageText('Serializing autonomous director decisions & character bible...');

    await new Promise((r) => setTimeout(r, 220));
    setExportProgress(55);
    setExportStageText('Bundling CapCut EDL, Canva overlays & DaVinci Resolve CDL...');

    await new Promise((r) => setTimeout(r, 240));
    setExportProgress(85);
    setExportStageText('Encoding JSON production package for download...');

    const exportPackage = {
      app: 'vicky.AI Autonomous Video Producer',
      project: currentProject,
      exportedAt: new Date().toISOString(),
      account: {
        email: currentUser.email,
        plan: currentUser.plan,
        isOwner: currentUser.isOwner,
      },
      characterConsistency: {
        characters: currentProject.autonomousDecisions.characterBible.map((c) => ({
          name: c.name,
          facePreserve: c.facePreserveEnabled ? `${((c.facePreserveStrength ?? 0.92) * 100).toFixed(0)}%` : 'disabled',
          posture: c.bodyPosture || 'Default',
          seedTag: c.consistencySeedPrompt,
        })),
      },
      connectors: {
        capcut: currentProject.connectors.capcut,
        canva: currentProject.connectors.canva,
        higgsfield: currentProject.connectors.higgsfield,
        davinciResolve: currentProject.connectors.davinciResolve,
        elevenlabs: currentProject.connectors.elevenlabs,
      },
    };

    await new Promise((r) => setTimeout(r, 180));
    setExportProgress(100);
    setExportStageText('Download triggered!');

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/ /g, '_')}_VickyAI_Production_Package.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      setExportStageText('');
      showToast('Downloaded Complete Vicky.AI Production Package');
    }, 320);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Strict 3-Zone Top Bar Contract */}
      <TopBar
        currentProject={currentProject}
        projects={projects}
        currentUser={currentUser}
        onSelectProject={handleSelectProject}
        onOpenNewModal={() => setIsPitchModalOpen(true)}
        onExportAll={handleExportAll}
        isExporting={isExporting}
        exportProgress={exportProgress}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Executive Hero & Autonomous Pitch Bar */}
        <ExecutiveHero
          project={currentProject}
          currentUser={currentUser}
          onProduce={handleProduceNew}
          onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
          isProducing={isProducing}
        />

        {/* Section View: Director Deck (Screening monitor + Shot timeline) */}
        {activeSection === 'director_deck' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Director Monitor (Left / 7 cols) */}
              <div className="lg:col-span-7">
                <DirectorMonitor
                  project={currentProject}
                  activeShotIndex={activeShotIndex}
                  onSelectShot={setActiveShotIndex}
                  onEditShot={setInspectingShot}
                  onOpenRenderModal={() => setIsRenderModalOpen(true)}
                  onVideoBlobGenerated={(blobUrl) => {
                    const updatedProj = { ...currentProject, masterVideoBlobUrl: blobUrl };
                    setProjects((prev) =>
                      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
                    );
                    showToast('Video Blob compiled & loaded into Director Monitor');
                  }}
                />
              </div>

              {/* Quick Shot Roster & Current Shot Breakdown (Right / 5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-100">Shot Inspection</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Shot {activeShotIndex + 1} of {currentProject.shots.length}
                  </span>
                </div>

                {currentProject.shots[activeShotIndex] && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400">Title:</span>
                      <h4 className="text-sm font-medium text-slate-100 mt-0.5">
                        {currentProject.shots[activeShotIndex].title}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Framing:</span>
                        <span className="text-slate-200 font-medium">
                          {currentProject.shots[activeShotIndex].shotType}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Camera Motion:</span>
                        <span className="text-amber-400 font-medium">
                          {currentProject.shots[activeShotIndex].cameraMotion}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Lens mm:</span>
                        <span className="text-slate-200 font-mono">
                          {currentProject.shots[activeShotIndex].lensMm}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Duration:</span>
                        <span className="text-slate-200 font-mono tabular-nums">
                          {currentProject.shots[activeShotIndex].durationSec} seconds
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Generative Visual Prompt (Higgsfield / Runway / Sora):
                      </span>
                      <p className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                        {currentProject.shots[activeShotIndex].visualPrompt}
                      </p>
                    </div>

                    {currentProject.shots[activeShotIndex].voiceover && (
                      <div className="bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40">
                        <span className="text-[10px] text-emerald-400 block mb-0.5 font-semibold">
                          Dialogue Voiceover:
                        </span>
                        <p className="text-xs text-slate-200 italic">
                          "{currentProject.shots[activeShotIndex].voiceover}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const char = currentProject.autonomousDecisions.characterBible.find(
                            (c) => c.name === currentProject.shots[activeShotIndex]?.character
                          ) || currentProject.autonomousDecisions.characterBible[0];
                          setSelectedCharacterForEdit(char || null);
                          setIsCharacterModalOpen(true);
                        }}
                        className="flex-1 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ScanFace className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Face & Posture Lock</span>
                      </button>

                      <button
                        onClick={() => setInspectingShot(currentProject.shots[activeShotIndex])}
                        className="flex-1 py-2 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors text-center"
                      >
                        Tweak Shot Specs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Tracks Section */}
            <TimelineTracks
              project={currentProject}
              activeShotIndex={activeShotIndex}
              onSelectShot={setActiveShotIndex}
              onAddShot={handleAddShot}
              onInspectShot={setInspectingShot}
            />

            {/* AI Studio Multimodal Production Lab */}
            <AiStudioLab
              project={currentProject}
              activeShotIndex={activeShotIndex}
              onApplyImageToShot={(shotIdx, imgUrl) => {
                const updatedShots = currentProject.shots.map((s, idx) =>
                  idx === shotIdx ? { ...s, imagePreviewUrl: imgUrl } : s
                );
                const updatedProj = { ...currentProject, shots: updatedShots };
                setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
                showToast(`Applied AI generated image to Shot #${shotIdx + 1}`);
              }}
              onApplyIdeaPitch={(ideaText) => {
                handleProduceNew({
                  idea: ideaText,
                  style: currentProject.style,
                  aspectRatio: currentProject.aspectRatio,
                  pacing: 'cinematic_epic',
                });
              }}
            />

            {/* Multi-Tool Connectors Preview */}
            <ConnectorsHub project={currentProject} />
          </div>
        )}

        {/* Section View: Timeline & Shots dedicated view */}
        {activeSection === 'timeline' && (
          <div className="space-y-6">
            <TimelineTracks
              project={currentProject}
              activeShotIndex={activeShotIndex}
              onSelectShot={setActiveShotIndex}
              onAddShot={handleAddShot}
              onInspectShot={setInspectingShot}
            />
            <DirectorMonitor
              project={currentProject}
              activeShotIndex={activeShotIndex}
              onSelectShot={setActiveShotIndex}
              onEditShot={setInspectingShot}
              onOpenRenderModal={() => setIsRenderModalOpen(true)}
              onVideoBlobGenerated={(blobUrl) => {
                const updatedProj = { ...currentProject, masterVideoBlobUrl: blobUrl };
                setProjects((prev) =>
                  prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
                );
                showToast('Video Blob compiled & loaded into Director Monitor');
              }}
            />
          </div>
        )}

        {/* Section View: Autonomous Decisions */}
        {activeSection === 'decisions' && (
          <div className="space-y-6">
            <AutonomousDecisionsPanel
              project={currentProject}
              onOpenCharacterUpload={(char) => {
                setSelectedCharacterForEdit(char || null);
                setIsCharacterModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Section View: Connectors Hub */}
        {activeSection === 'connectors' && (
          <div className="space-y-6">
            <ConnectorsHub project={currentProject} />
          </div>
        )}

        {/* Section View: AI Studio Lab */}
        {activeSection === 'ai_lab' && (
          <div className="space-y-6">
            <AiStudioLab
              project={currentProject}
              activeShotIndex={activeShotIndex}
              onApplyImageToShot={(shotIdx, imgUrl) => {
                const updatedShots = currentProject.shots.map((s, idx) =>
                  idx === shotIdx ? { ...s, imagePreviewUrl: imgUrl } : s
                );
                const updatedProj = { ...currentProject, shots: updatedShots };
                setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
                showToast(`Applied AI generated image to Shot #${shotIdx + 1}`);
              }}
              onApplyIdeaPitch={(ideaText) => {
                handleProduceNew({
                  idea: ideaText,
                  style: currentProject.style,
                  aspectRatio: currentProject.aspectRatio,
                  pacing: 'cinematic_epic',
                });
              }}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <PitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        onSubmit={handleProduceNew}
        isProducing={isProducing}
      />

      <CharacterUploadModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false);
          setSelectedCharacterForEdit(null);
        }}
        onSaveCharacter={handleSaveCharacter}
        existingCharacter={selectedCharacterForEdit}
      />

      <ShotDetailModal
        shot={inspectingShot}
        onClose={() => setInspectingShot(null)}
        onSave={handleSaveShot}
        onRefineWithVicky={handleRefineWithVicky}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(u) => {
          setCurrentUser(u);
          saveCurrentUser(u);
        }}
      />

      <TransactionUploadModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(u) => {
          setCurrentUser(u);
          saveCurrentUser(u);
          showToast(
            u.verificationStatus === 'pending'
              ? `Payment proof submitted! Status set to 'pending' admin verification.`
              : `Payment verified for ${u.email}!`
          );
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserLoggedIn={(u) => {
          setCurrentUser(u);
          saveCurrentUser(u);
          showToast(
            u.isOwner
              ? 'Logged in as Owner: Lifetime Free VIP Access Active'
              : `Logged in as ${u.email} (${u.plan === 'none' ? 'No Plan - Purchase via Easypaisa' : u.plan})`
          );
        }}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
      />

      <RenderVideoModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        project={currentProject}
        onVideoBlobGenerated={(blobUrl) => {
          const updatedProj = { ...currentProject, masterVideoBlobUrl: blobUrl };
          setProjects((prev) =>
            prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
          );
        }}
      />

      <VideoTutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateToSection={(section) => setActiveSection(section)}
      />

      {/* Visual Progress Bar & Spinner Overlay for Export All */}
      {isExporting && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-amber-400/70 shadow-2xl p-4 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Preparing JSON Export Package</span>
            </div>
            <span className="font-mono font-bold text-amber-400">{exportProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400 truncate">{exportStageText}</p>
        </div>
      )}

      {/* Toast Notification */}
      {notification && !isExporting && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-400/60 shadow-xl px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Quiet Footer with Easypaisa Info */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span>vicky.AI</span>
          <span>·</span>
          <span>Owner: {OWNER_EMAIL} (Lifetime Free VIP)</span>
          <span>·</span>
          <span>Easypaisa Payment: 03066053314</span>
        </div>
        <div className="text-[11px] text-slate-600">
          Plans: $3 for 1 video (3 min) · $250/month unlimited (up to 210 min cap)
        </div>
      </footer>
    </div>
  );
}
