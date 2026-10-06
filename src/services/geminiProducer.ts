import { ProductionProject, VideoStyle, AspectRatio } from '../types/producer';
import { DEFAULT_PROJECTS } from '../data/defaultProjects';

export interface ProduceParams {
  idea: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  pacing: string;
  characterNotes?: string;
  duration?: number;
  characterImage?: string;
  characterName?: string;
  facePreserve?: boolean;
  faceStrength?: number;
  bodyPosture?: string;
}

export async function produceVideoProject(params: ProduceParams): Promise<ProductionProject> {
  try {
    const res = await fetch('/api/vicky/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        // Associate generated imagery previews or user uploaded character image
        const project = data.project as ProductionProject;

        if (params.characterImage && project.autonomousDecisions?.characterBible?.[0]) {
          const mainChar = project.autonomousDecisions.characterBible[0];
          if (params.characterName) mainChar.name = params.characterName;
          mainChar.imageUrl = params.characterImage;
          mainChar.facePreserveEnabled = params.facePreserve ?? true;
          mainChar.facePreserveStrength = params.faceStrength ?? 0.92;
          if (params.bodyPosture) mainChar.bodyPosture = params.bodyPosture as any;
        }

        project.shots = project.shots.map((shot, idx) => {
          if (params.characterImage && (shot.character || idx === 1)) {
            shot.imagePreviewUrl = params.characterImage;
          } else if (!shot.imagePreviewUrl) {
            // Assign from our generated cinematic pool matching style
            if (params.style === 'stylized_3d') {
              shot.imagePreviewUrl = '/src/assets/images/shot_stylized_3d_1790926401701.jpg';
            } else if (params.style === 'cyberpunk_noir') {
              shot.imagePreviewUrl = '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg';
            } else if (idx % 2 === 1) {
              shot.imagePreviewUrl = '/src/assets/images/shot_location_scout_1790926432440.jpg';
            } else {
              shot.imagePreviewUrl = '/src/assets/images/shot_cinematic_real_1790926385863.jpg';
            }
          }
          return shot;
        });
        return project;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call skipped or errored, falling back to autonomous engine:', err);
  }

  // Autonomous fallback synthesis engine
  return generateAutonomousProduction(params);
}

function generateAutonomousProduction(params: ProduceParams): ProductionProject {
  const { idea, style, aspectRatio, pacing } = params;
  const id = 'proj_' + Date.now();

  const is3D = style === 'stylized_3d';
  const isCyber = style === 'cyberpunk_noir';
  const isReal = style === 'real_hyperrealistic' || style === 'cinematic_anamorphic';

  // Autonomous styling matrix
  let gradingName = 'Arri Alexa Rec709 Film Contrast';
  let primary = '#0F172A';
  let secondary = '#1E293B';
  let accent = '#38BDF8';
  let shadows = '#020617';
  let contrastCurve = 'Cinematic Soft Highlight Roll-off';
  let saturationLevel = '90% Natural Film Density';
  let rationale = `Vicky.AI selected ${style.replace('_', ' ')} aesthetic with ${aspectRatio} ratio to maximize emotional immersion.`;
  let imageAsset = '/src/assets/images/shot_cinematic_real_1790926385863.jpg';

  if (is3D) {
    gradingName = 'Unreal Engine 5 Pixar Glow Emulation';
    primary = '#451952';
    secondary = '#662549';
    accent = '#F39E60';
    shadows = '#1A0B2E';
    contrastCurve = 'Punchy Midtones with High Specular Highlights';
    saturationLevel = '112% Rich Animated Palette';
    rationale = 'Vicky.AI chose vibrant warm brass and jewel tones for whimsical character appeal and 3D subsurface depth.';
    imageAsset = '/src/assets/images/shot_stylized_3d_1790926401701.jpg';
  } else if (isCyber) {
    gradingName = 'Neo-Cyberpunk Cyan & Magenta Anamorphic';
    primary = '#090A0F';
    secondary = '#1A0826';
    accent = '#FF007F';
    shadows = '#020307';
    contrastCurve = 'Aggressive S-Curve with Crushed Blacks';
    saturationLevel = '120% High Chroma Luminescence';
    rationale = 'High contrast split lighting isolates wet neon signs against deep midnight shadows.';
    imageAsset = '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg';
  } else if (isReal) {
    gradingName = 'Kodak 2383 Gold-Cyan Film Emulation';
    primary = '#0B192C';
    secondary = '#1E3E62';
    accent = '#FF6500';
    shadows = '#050C16';
    contrastCurve = 'Gentle Filmic S-Curve';
    saturationLevel = '88% Organic Print Balance';
    rationale = 'Naturalistic skin tones balanced with cool atmospheric aerial perspective and warm practical lights.';
    imageAsset = '/src/assets/images/shot_cinematic_real_1790926385863.jpg';
  }

  // Autonomous Character Generation
  const charName = is3D ? 'Orion Swift' : isCyber ? 'Kira Sterling' : 'Julian Mercer';
  const charDesc = is3D
    ? 'Expressive 3D animated adventurer with bright curious hazel eyes and customized aeronautical gear.'
    : isCyber
    ? 'Cunning operative with cybernetic telemetry ocular lens and weatherized tactical carbon coat.'
    : 'Focused investigator with thoughtful observant gaze, wool tailored coat and leather field satchel.';

  // Autonomous Location Generation
  const locName = is3D ? 'Skyhaven Cloud Citadel' : isCyber ? 'Sector 7 Neon Underdeck' : 'Misty Coastal Overlook';

  const titleWords = idea.split(' ').slice(0, 4).join(' ');
  const title = titleWords.length > 5 ? `Echoes of ${titleWords}` : 'The Infinite Odyssey';

  return {
    id,
    title,
    logline: `An autonomous production crafted by Vicky.AI exploring: ${idea.slice(0, 100)}...`,
    userIdea: idea,
    style,
    aspectRatio,
    targetDurationSec: 20,
    createdAt: new Date().toISOString(),
    autonomousDecisions: {
      directorRationale: rationale,
      colorPalette: {
        gradingName,
        primary,
        secondary,
        accent,
        shadows,
        contrastCurve,
        saturationLevel,
        rationale,
      },
      characterBible: [
        {
          name: charName,
          role: 'Protagonist',
          visualDescription: charDesc,
          wardrobe: is3D ? 'Canvas pilot bomber jacket with brass buckles' : isCyber ? 'Reflective dark duster coat' : 'Heavy charcoal trenchcoat',
          emotionalArc: 'Transitions from hesitation into resolute purpose as the story unfolds.',
          voiceProfile: is3D ? 'Energetic, warm, melodic' : isCyber ? 'Calm, calculated, modulated' : 'Grounded, evocative, deep',
          consistencySeedPrompt: `vicky_char_${charName.toLowerCase().replace(' ', '_')}, consistent visual look`,
        },
      ],
      locations: [
        {
          name: locName,
          environmentType: 'exterior',
          lighting: is3D ? 'Golden volumetric sun rays' : isCyber ? 'Holographic magenta and deep cyan rim' : 'Twilight overcast marine mist',
          atmosphere: 'Immersive atmospheric depth with suspended particulate motes',
          cameraPlacement: '35mm anamorphic wide master',
          visualRefPrompt: `${locName}, cinematic wide shot, rich lighting, 8k movie still`,
        },
      ],
      soundDesign: {
        musicGenre: is3D ? 'Whimsical Orchestral Symphony' : isCyber ? 'Heavy Darksynth Retrowave' : 'Ambient Cinematic Cello & Piano',
        bpm: is3D ? 104 : isCyber ? 128 : 74,
        mood: 'Evocative, memorable, dynamically graded',
        instruments: is3D ? ['Celesta', 'Strings', 'Flute'] : isCyber ? ['Analog Synth', 'Sub Bass', 'Gated Snares'] : ['Cello', 'Felted Piano', 'Warm Pad'],
        audioMixNotes: 'Sidechained master dialogue track with wide stereo ambient reverb.',
      },
    },
    shots: [
      {
        id: 'shot_1',
        shotNumber: 1,
        title: 'The Establishing Horizon',
        durationSec: 5,
        shotType: 'Wide Master',
        cameraMotion: 'Slow Push-In',
        lensMm: '28mm Anamorphic',
        visualPrompt: `${idea}, cinematic establishing shot, highly detailed, dramatic lighting, 8k`,
        imagePreviewUrl: imageAsset,
        character: charName,
        voiceover: 'Every journey begins before the first step is ever taken.',
        sfx: ['Distant ambient rumble', 'Soft atmospheric wind'],
        transition: 'Cut',
      },
      {
        id: 'shot_2',
        shotNumber: 2,
        title: 'The Discovery Focus',
        durationSec: 5,
        shotType: 'Close-Up',
        cameraMotion: 'Dolly Track Right',
        lensMm: '50mm Prime',
        visualPrompt: `Close-up portrait of ${charName} reacting with awe, dramatic rim lighting, cinematic 8k`,
        imagePreviewUrl: isReal ? '/src/assets/images/shot_location_scout_1790926432440.jpg' : imageAsset,
        character: charName,
        voiceover: 'You can hear the pulse of something new coming alive.',
        sfx: ['Heartbeat pulse', 'Synthesized chime shimmer'],
        transition: 'Cross Dissolve',
      },
      {
        id: 'shot_3',
        shotNumber: 3,
        title: 'The Unfolding Realm',
        durationSec: 5,
        shotType: 'Low-Angle Tracking',
        cameraMotion: 'FPV Drone Arc',
        lensMm: '18mm Ultra Wide',
        visualPrompt: `Epic dynamic camera movement through ${locName}, cinematic depth, atmospheric lighting`,
        imagePreviewUrl: imageAsset,
        character: charName,
        voiceover: 'No boundaries left to hold what was created here.',
        sfx: ['Sub-bass swell', 'Whoosh transition impact'],
        transition: 'Whip Pan',
      },
      {
        id: 'shot_4',
        shotNumber: 4,
        title: 'The Final Climax',
        durationSec: 5,
        shotType: 'Drone Orbit',
        cameraMotion: 'Crane Jib Down',
        lensMm: '35mm',
        visualPrompt: `Grand cinematic finale shot, majestic scale, dramatic sunset lighting, 8k film resolution`,
        imagePreviewUrl: isReal ? '/src/assets/images/shot_location_scout_1790926432440.jpg' : imageAsset,
        character: charName,
        voiceover: 'vicky.AI: Vision brought into reality.',
        sfx: ['Full orchestral crescendo', 'Deep cinematic chime'],
        transition: 'Fade to Black',
      },
    ],
    connectors: {
      capcut: {
        projectTitle: `${title.replace(/ /g, '_')}_CapCut_Sync`,
        beatSyncBpm: isCyber ? 128 : is3D ? 104 : 74,
        aspectRatio: aspectRatio,
        timelineTracks: [
          { trackName: 'V1_MasterVideo', clipsCount: 4, fxType: 'Cinematic_Film_Grade' },
          { trackName: 'V2_DynamicTitles', clipsCount: 2, fxType: 'Animated_LowerThird' },
          { trackName: 'A1_VoiceTrack', clipsCount: 4, fxType: 'Studio_Voice_EQ' },
          { trackName: 'A2_Soundscape', clipsCount: 6, fxType: 'Spatial_Stereo_Spread' },
        ],
        exportJson: JSON.stringify({
          app: 'CapCut_Desktop',
          version: '3.8.0',
          fps: 24,
          canvas: { width: 3840, height: 2160 },
          clips: 4,
        }, null, 2),
        edlFormat: `TITLE: ${title}\nFCM: NON-DROP FRAME\n001  AX  V  C  00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00\n002  AX  V  C  00:00:00:00 00:00:05:00 00:00:05:00 00:00:10:00\n003  AX  V  C  00:00:00:00 00:00:05:00 00:00:10:00 00:00:15:00\n004  AX  V  C  00:00:00:00 00:00:05:00 00:00:15:00 00:00:20:00`,
      },
      canva: {
        templateType: 'Social Reel & YouTube Thumbnail Package',
        fontPairing: { header: 'Cinzel', body: 'Plus Jakarta Sans' },
        colorHexes: [primary, secondary, accent, '#FFFFFF'],
        overlays: [
          { timeCode: '00:00:00', text: 'vicky.AI presents', layout: 'Minimal Header' },
          { timeCode: '00:00:15', text: title.toUpperCase(), layout: 'Full Width Cinematic Center Title' },
        ],
        thumbnailPrompt: `YouTube 16:9 Thumbnail: High impact cinematic frame of ${idea}, bold contrasting text overlay: "${title.toUpperCase()}"`,
      },
      higgsfield: {
        characterConsistencyTag: `vicky_char_${charName.toLowerCase().replace(' ', '_')}`,
        motionPrompts: [
          {
            shot: 1,
            cameraMovement: 'slow dolly push in',
            prompt: `${idea} [dolly in] cinematic 8k`,
            negativePrompt: 'blurry, oversaturated, deformed, jitter, amateur',
            motionScale: 0.6,
          },
          {
            shot: 2,
            cameraMovement: 'cinematic orbit around subject',
            prompt: `Close up portrait of ${charName} [camera orbit] dramatic volumetric lighting`,
            negativePrompt: 'blurry, distorted facial features, plastic skin',
            motionScale: 0.75,
          },
        ],
      },
      davinciResolve: {
        lutRecommendation: `${gradingName.replace(/ /g, '_')}.cube`,
        colorWheelLift: 'RGB(-0.02, 0.00, 0.03)',
        colorWheelGamma: 'RGB(0.01, 0.01, -0.01)',
        colorWheelGain: 'RGB(1.04, 1.00, 0.96)',
        cdlXml: `<ColorCorrection id="vicky_${id}">\n  <SOPNode>\n    <Slope>1.04 1.00 0.96</Slope>\n    <Offset>-0.02 0.00 0.03</Offset>\n    <Power>0.96 0.98 1.02</Power>\n  </SOPNode>\n  <SatNode>\n    <Saturation>0.92</Saturation>\n  </SatNode>\n</ColorCorrection>`,
      },
      elevenlabs: {
        voiceName: `${charName} Voice Persona`,
        stability: 0.75,
        similarityBoost: 0.85,
        scriptWithBursts: 'Every journey begins before the first step is ever taken. <breath> You can hear the pulse of something new coming alive. |yeah| Vision brought into reality.',
      },
    },
  };
}
