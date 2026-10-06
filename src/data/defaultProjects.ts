import { ProductionProject } from '../types/producer';

export const DEFAULT_PROJECTS: ProductionProject[] = [
  {
    id: 'proj_last_lightkeeper',
    title: 'The Solitary Horizon',
    logline: 'An introspective wanderer journeys along coastal rain-swept highways toward a forgotten Nordic lighthouse before nightfall.',
    userIdea: 'Make a deeply cinematic, realistic story of a lone traveler at twilight in the rain along a coastal highway, ending at a Nordic lighthouse cabin. Emotional, moody, high film grain.',
    style: 'cinematic_anamorphic',
    aspectRatio: '2.39:1',
    targetDurationSec: 24,
    createdAt: '2026-10-02T00:30:00Z',
    autonomousDecisions: {
      directorRationale: 'Vicky.AI selected a 2.39:1 anamorphic ratio with 35mm optical characteristics. The color science uses Kodak 2383 print emulation to harmonize damp pavement reflections with glowing vehicle amber headlights.',
      colorPalette: {
        gradingName: 'Kodak 2383 Teal-Amber Film Emulation',
        primary: '#0B192C',
        secondary: '#1E3E62',
        accent: '#FF6500',
        shadows: '#050C16',
        contrastCurve: 'S-Curve with Lifted Midnight Blacks',
        saturationLevel: '85% Controlled Organic Density',
        rationale: 'Deep oceanic blue shadows contrast against warm tungsten vehicle lights to evoke emotional isolation and resolve.'
      },
      characterBible: [
        {
          name: 'Kael Vance',
          role: 'The Drifter',
          visualDescription: 'Mid-30s, rugged weathered features, piercing observant hazel eyes, rain-dampened dark hair.',
          wardrobe: 'Waxed slate-charcoal canvas trench coat with high collar, heavy leather traveling boots.',
          emotionalArc: 'Begins exhausted and wandering, achieves quiet clarity upon viewing the lighthouse.',
          voiceProfile: 'Baritone, slow cadence, intimate proximity with subtle breathing rhythm.',
          consistencySeedPrompt: 'vicky_char_kael_vance, 35yo Nordic man, dark hair, olive skin, weathered jaw, heavy charcoal coat',
          imageUrl: '/src/assets/images/shot_cinematic_real_1790926385863.jpg',
          facePreserveEnabled: true,
          facePreserveStrength: 0.92,
          bodyPosture: 'Slow Walking',
          poseWeight: 0.85,
          faceAnchorTags: '[face_id_lock: Kael_Vance_Nordic] [ip_adapter: 0.92] [openpose: slow_walk_away]'
        }
      ],
      locations: [
        {
          name: 'The Wet Coastal Asphalte',
          environmentType: 'exterior',
          lighting: 'Twilight gloom with distant high-beam tungsten illumination',
          atmosphere: 'Heavy coastal drizzle, ground mist, asphalt light sheen',
          cameraPlacement: 'Low-angle tracking dolly at 24mm anamorphic lens height',
          visualRefPrompt: 'Rain-slicked coastal highway at twilight, wet asphalt reflections, moody fog'
        },
        {
          name: 'Nordic Fjord Overlook Cabin',
          environmentType: 'exterior',
          lighting: 'Soft dawn break through morning marine stratus',
          atmosphere: 'Glassy fjord waters, crisp arctic mountain breeze',
          cameraPlacement: 'Extreme wide slow crane establishing shot',
          visualRefPrompt: 'Minimalist concrete villa cantilevered over foggy Nordic fjord waters'
        }
      ],
      soundDesign: {
        musicGenre: 'Ambient Cinematic Post-Rock',
        bpm: 72,
        mood: 'Hauntingly beautiful, bittersweet, expansive',
        instruments: ['Bowed cello', 'Felted upright piano', 'Warm analog synthesizer pad', 'Subtle vinyl crackle'],
        audioMixNotes: 'Heavy sidechain ducking under dialogue. Wind howling gently filtered through a 400Hz low-pass.'
      }
    },
    shots: [
      {
        id: 'shot_1',
        shotNumber: 1,
        title: 'The Wet Highway Walk',
        durationSec: 6,
        shotType: 'Wide Master',
        cameraMotion: 'Slow Push-In',
        lensMm: '35mm Anamorphic T1.9',
        visualPrompt: 'Cinematic anamorphic 35mm film still of a lone explorer walking down a rain-slicked highway at twilight, distant headlights illuminating atmospheric fog, rich cyan and amber cinematic color grading, shallow depth of field, 8k movie still',
        imagePreviewUrl: '/src/assets/images/shot_cinematic_real_1790926385863.jpg',
        character: 'Kael Vance',
        voiceover: 'The miles leave their weight in the soles of your boots... but you keep walking.',
        sfx: ['Tire hiss on wet asphalt', 'Distant thunder roll', 'Wind gust through utility lines'],
        transition: 'Cross Dissolve'
      },
      {
        id: 'shot_2',
        shotNumber: 2,
        title: 'The Coastal Outpost',
        durationSec: 6,
        shotType: 'Extreme Wide',
        cameraMotion: 'Crane Jib Down',
        lensMm: '24mm Ultra Prime',
        visualPrompt: 'Breathtaking architectural location scout photograph, minimalist modern concrete villa perched dramatically over a foggy Nordic fjord at sunrise, misty morning light, soft reflection on glassy water, architectural digest film still',
        imagePreviewUrl: '/src/assets/images/shot_location_scout_1790926432440.jpg',
        character: 'Kael Vance',
        voiceover: 'Until the water whispers that you have finally arrived.',
        sfx: ['Gentle fjord lap', 'Single gull call in distance', 'Deep sub-bass swell'],
        transition: 'Match Cut'
      },
      {
        id: 'shot_3',
        shotNumber: 3,
        title: 'Reflections in Headlights',
        durationSec: 6,
        shotType: 'Close-Up',
        cameraMotion: 'Dolly Track Right',
        lensMm: '65mm Macro Cine',
        visualPrompt: 'Close up profile of rugged man turning toward blinding warm vehicular headlight beam, rain droplets trickling down cheek, cinematic lighting, 8k',
        imagePreviewUrl: '/src/assets/images/shot_cinematic_real_1790926385863.jpg',
        character: 'Kael Vance',
        voiceover: 'No turning back now.',
        sfx: ['Wet leather creak', 'Sharp intake of breath', 'Headlight relay click'],
        transition: 'Whip Pan'
      },
      {
        id: 'shot_4',
        shotNumber: 4,
        title: 'Beacon into the Morning Mist',
        durationSec: 6,
        shotType: 'Drone Orbit',
        cameraMotion: 'FPV Drone Arc',
        lensMm: '18mm Master Anamorphic',
        visualPrompt: 'Aerial sweeping cinematic shot above Nordic fjord cliff edge overlooking modern glass and stone beacon as sun rises through low cloud bank',
        imagePreviewUrl: '/src/assets/images/shot_location_scout_1790926432440.jpg',
        character: 'Kael Vance',
        voiceover: 'Here, the light never sleeps.',
        sfx: ['Orchestral peak crescendo', 'Ocean spray impact'],
        transition: 'Fade to Black'
      }
    ],
    connectors: {
      capcut: {
        projectTitle: 'The_Solitary_Horizon_CapCut_v1',
        beatSyncBpm: 72,
        aspectRatio: '21:9',
        timelineTracks: [
          { trackName: 'V1_VideoMaster', clipsCount: 4, fxType: 'FilmGrain_35mm_Medium' },
          { trackName: 'V2_LowerThirds', clipsCount: 2, fxType: 'Minimalist_Cinematic_Title' },
          { trackName: 'A1_Voiceover', clipsCount: 4, fxType: 'StudioVocal_DeEsser' },
          { trackName: 'A2_AtmosphericSFX', clipsCount: 8, fxType: 'WetReverb_Space_40' }
        ],
        exportJson: JSON.stringify({
          app: 'CapCut_Desktop',
          version: '3.8.0',
          fps: 24,
          canvas: { width: 3840, height: 1600 },
          tracks: [
            { id: 'trk_v1', type: 'video', clips: ['clip_01', 'clip_02', 'clip_03', 'clip_04'] },
            { id: 'trk_a1', type: 'audio', clips: ['vo_01', 'vo_02', 'vo_03', 'vo_04'] }
          ]
        }, null, 2),
        edlFormat: `TITLE: The_Solitary_Horizon\nFCM: NON-DROP FRAME\n001  AX       V     C        00:00:00:00 00:00:06:00 00:00:00:00 00:00:06:00\n* FROM CLIP NAME: SHOT_01_RAIN_HIGHWAY.MOV\n002  AX       V     C        00:00:00:00 00:00:06:00 00:00:06:00 00:00:12:00\n* FROM CLIP NAME: SHOT_02_FJORD_OUTPOST.MOV\n003  AX       V     C        00:00:00:00 00:00:06:00 00:00:12:00 00:00:18:00\n* FROM CLIP NAME: SHOT_03_HEADLIGHT_FACE.MOV\n004  AX       V     C        00:00:00:00 00:00:06:00 00:00:18:00 00:00:24:00\n* FROM CLIP NAME: SHOT_04_AERIAL_BEACON.MOV`
      },
      canva: {
        templateType: 'Cinematic Movie Trailer & Social Story Card',
        fontPairing: { header: 'Cinzel Decorative', body: 'Plus Jakarta Sans' },
        colorHexes: ['#0B192C', '#1E3E62', '#FF6500', '#F8FAFC'],
        overlays: [
          { timeCode: '00:00:01', text: 'vicky.AI presents', layout: 'Minimal Center Top Tracking +400' },
          { timeCode: '00:00:18', text: 'THE SOLITARY HORIZON', layout: 'Cinematic Anamorphic Wide Display' }
        ],
        thumbnailPrompt: 'YouTube 16:9 4K Thumbnail: Moody cinematic silhouette of trenchcoat traveler against rain-slicked highway with glowing amber headlights and title typography "THE SOLITARY HORIZON"'
      },
      higgsfield: {
        characterConsistencyTag: 'vicky_char_kael_vance',
        motionPrompts: [
          {
            shot: 1,
            cameraMovement: 'slow dolly forward at 0.4 speed',
            prompt: 'vicky_char_kael_vance walking away along rain soaked coastal road at dusk, headlights illuminating mist, shallow focus [dolly in]',
            negativePrompt: 'blurry, distorted facial features, daytime, bright sunny, low quality, oversaturated',
            motionScale: 0.65
          },
          {
            shot: 2,
            cameraMovement: 'slow crane descent over water',
            prompt: 'Nordic fjord modern concrete architecture in sunrise mist, glassy water reflections, cinematic architecture digest style [crane down]',
            negativePrompt: 'cartoon, plastic textures, jitter, aliasing',
            motionScale: 0.5
          }
        ]
      },
      davinciResolve: {
        lutRecommendation: 'Kodak_2383_D60_Print_Rec709.cube',
        colorWheelLift: 'RGB(-0.02, 0.01, 0.04)',
        colorWheelGamma: 'RGB(0.01, 0.00, -0.02)',
        colorWheelGain: 'RGB(1.05, 0.98, 0.92)',
        cdlXml: `<ColorCorrection id="vicky_grade_01">\n  <SOPNode>\n    <Slope>1.050000 0.980000 0.920000</Slope>\n    <Offset>-0.020000 0.010000 0.040000</Offset>\n    <Power>0.950000 0.950000 1.020000</Power>\n  </SOPNode>\n  <SatNode>\n    <Saturation>0.880000</Saturation>\n  </SatNode>\n</ColorCorrection>`
      },
      elevenlabs: {
        voiceName: 'Marcus - Deep Narrative Baritone',
        stability: 0.72,
        similarityBoost: 0.85,
        scriptWithBursts: 'The miles leave their weight in the soles of your boots... <breath> but you keep walking. Until the water whispers that you have finally arrived. |yeah| No turning back now. Here, the light never sleeps.'
      }
    }
  },
  {
    id: 'proj_chrono_brass',
    title: 'The Brass Clockwork Heart',
    logline: 'In a whimsical sun-drenched steampunk workshop, a passionate young inventor crafts a sentient clockwork companion with an emotive crystal furnace.',
    userIdea: 'Make a 3D animated Pixar style short of a young inventor boy in a sunlit workshop building a cute clockwork robot. Warm colors, glowing gears, whimsical and heartfelt.',
    style: 'stylized_3d',
    aspectRatio: '16:9',
    targetDurationSec: 20,
    createdAt: '2026-10-02T00:15:00Z',
    autonomousDecisions: {
      directorRationale: 'Vicky.AI selected a high-fidelity stylized 3D render look inspired by top animation studios (Unreal 5 Lumen & Subsurface scattering). The color palette is driven by warm polished brass, amber glow, and contrasting lapis lazuli accents.',
      colorPalette: {
        gradingName: 'Warm Amber & Lapis Pixar Studio Grade',
        primary: '#451952',
        secondary: '#662549',
        accent: '#F39E60',
        shadows: '#1A0B2E',
        contrastCurve: 'Gentle Warm Highlight Roll-off',
        saturationLevel: '110% High Vibrancy and Specular Pop',
        rationale: 'Whimsical high-key lighting with subsurface skin glow and warm metallic specular reflections creates instant charm and family-friendly warmth.'
      },
      characterBible: [
        {
          name: 'Leo Sparks',
          role: 'Young Master Inventor',
          visualDescription: '12-year-old with tousled chestnut hair, brass magnifying goggles perched on forehead, freckled cheeks, vibrant green eyes.',
          wardrobe: 'Brown leather apron over rolled-up teal denim workshirt, tool pouch belt with miniature calipers.',
          emotionalArc: 'Determined concentration turning into joyful triumph as the robot awakens.',
          voiceProfile: 'Youthful tenor, earnest and quick-thinking, full of playful enthusiasm.',
          consistencySeedPrompt: 'vicky_char_leo_sparks, 12yo 3d animated boy inventor, brass goggles, leather apron, brown hair, pixar style',
          imageUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
          facePreserveEnabled: true,
          facePreserveStrength: 0.88,
          bodyPosture: 'Observant Leaning',
          poseWeight: 0.90,
          faceAnchorTags: '[face_id_lock: Leo_Sparks_Pixar] [openpose: leaning_workbench_0.90]'
        },
        {
          name: 'Cogsworth-7',
          role: 'The Clockwork Automaton',
          visualDescription: 'Compact 40cm brass robot with twin glass optic eyes, exposed rotating gears in chest cavity glowing with amber mana.',
          wardrobe: 'Hand-hammered brass chassis with copper rivets and spring-loaded articulation joints.',
          emotionalArc: 'Initial robotic boot-sequence glitch into cute head-tilt recognition of Leo.',
          voiceProfile: 'Synthesized melodic chimes, analog clickers, and soft bell sounds.',
          consistencySeedPrompt: 'vicky_char_cogsworth_robot, cute miniature 3d brass robot, glowing amber chest heart, clockwork gears',
          imageUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
          facePreserveEnabled: true,
          facePreserveStrength: 0.85,
          bodyPosture: 'Custom Posed',
          poseWeight: 0.80,
          faceAnchorTags: '[chassis_preserve: Cogsworth_Brass] [pose: tilt_head_greeting]'
        }
      ],
      locations: [
        {
          name: 'The Clocktower Attic Workshop',
          environmentType: 'interior',
          lighting: 'Golden morning light filtering through stained glass dormer windows with floating dust motes',
          atmosphere: 'Warm wood shavings, polished bronze scent, ticking pendulum rhythm',
          cameraPlacement: 'Dutch tilt close-up on workbench table',
          visualRefPrompt: 'Steampunk inventor attic workshop, glowing brass contraptions, volumetric sunlight beams'
        }
      ],
      soundDesign: {
        musicGenre: 'Whimsical Orchestral Fantasy',
        bpm: 104,
        mood: 'Playful, wondrous, triumphant',
        instruments: ['Celesta', 'Pizzicato violins', 'Glockenspiel', 'Warm French Horns', 'Wooden xylophone'],
        audioMixNotes: 'Gears ticking mixed in sync with 104 BPM tempo. Sweetened top-end sparkle for optic activation.'
      }
    },
    shots: [
      {
        id: 'shot_b1',
        shotNumber: 1,
        title: 'The Ticking Workshop',
        durationSec: 5,
        shotType: 'Wide Master',
        cameraMotion: 'Slow Push-In',
        lensMm: '28mm Cine',
        visualPrompt: 'High-end stylized 3D animation feature film frame, Unreal Engine 5 render, expressive friendly animated inventor character in a whimsical steampunk workshop surrounded by glowing brass contraptions and volumetric warm sunlight, Pixar and DreamWorks aesthetic, 8k',
        imagePreviewUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
        character: 'Leo Sparks',
        voiceover: 'Grandpa always told me: a real machine needs more than gears. It needs a spark.',
        sfx: ['Grandfather clock pendulum', 'Brass tool clink', 'Dust mote ambient shimmer'],
        transition: 'Cut'
      },
      {
        id: 'shot_b2',
        shotNumber: 2,
        title: 'Placing the Crystal Heart',
        durationSec: 5,
        shotType: 'Extreme Close-Up',
        cameraMotion: 'Static',
        lensMm: '90mm Macro',
        visualPrompt: 'Extreme close up 3D render of delicate youthful boy hand inserting glowing amber faceted gemstone into brass gear mechanism of miniature robot, volumetric rays, 8k',
        imagePreviewUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
        character: 'Leo Sparks',
        voiceover: 'Just one final turn... easy now...',
        sfx: ['Tension ratchet winding', 'Tiny spark zap', 'Low humming oscillation'],
        transition: 'Cross Dissolve'
      },
      {
        id: 'shot_b3',
        shotNumber: 3,
        title: 'The Awakening Spark',
        durationSec: 5,
        shotType: 'Medium',
        cameraMotion: 'Low-Angle Tracking',
        lensMm: '50mm Prime',
        visualPrompt: '3D animation frame of cute brass robot opening dual cyan optic lenses and tilting head in curiosity toward joyful young boy inventor, Pixar style, vibrant colors',
        imagePreviewUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
        character: 'Leo Sparks & Cogsworth-7',
        voiceover: 'Hello little guy! Welcome to the world.',
        sfx: ['Cute musical chime', 'Servo motor whir', 'Leo excited gasp'],
        transition: 'Whip Pan'
      },
      {
        id: 'shot_b4',
        shotNumber: 4,
        title: 'Partners in Invention',
        durationSec: 5,
        shotType: 'Wide Master',
        cameraMotion: 'Crane Jib Down',
        lensMm: '35mm',
        visualPrompt: 'Wide shot of sunlit workshop with boy and little robot high-fiving as gears spin happily in background, golden hour dust motes, cinematic 3D',
        imagePreviewUrl: '/src/assets/images/shot_stylized_3d_1790926401701.jpg',
        character: 'Leo Sparks & Cogsworth-7',
        voiceover: 'We are going to build the greatest wonders anyone has ever seen!',
        sfx: ['Triumphant orchestral swell', 'Brass bell flourish'],
        transition: 'Fade to Black'
      }
    ],
    connectors: {
      capcut: {
        projectTitle: 'Chrono_Brass_Pixar3D_CapCut',
        beatSyncBpm: 104,
        aspectRatio: '16:9',
        timelineTracks: [
          { trackName: 'V1_AnimationMaster', clipsCount: 4, fxType: 'ColorGlow_WarmShimmer' },
          { trackName: 'V2_CartoonStickers', clipsCount: 3, fxType: 'Sparkle_Burst_3D' },
          { trackName: 'A1_DialogVoice', clipsCount: 4, fxType: 'BrightVoice_Opt' }
        ],
        exportJson: JSON.stringify({
          app: 'CapCut_Desktop',
          version: '3.8.0',
          fps: 30,
          canvas: { width: 1920, height: 1080 }
        }, null, 2),
        edlFormat: `TITLE: Chrono_Brass_Pixar3D\n001  V1  C  00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00\n002  V1  C  00:00:00:00 00:00:05:00 00:00:05:00 00:00:10:00\n003  V1  C  00:00:00:00 00:00:05:00 00:00:10:00 00:00:15:00\n004  V1  C  00:00:00:00 00:00:05:00 00:00:15:00 00:00:20:00`
      },
      canva: {
        templateType: 'Kids Animated YouTube Banner & Video Intro Graphic',
        fontPairing: { header: 'Bungee Rounded', body: 'Plus Jakarta Sans' },
        colorHexes: ['#451952', '#F39E60', '#F8FAFC', '#22C55E'],
        overlays: [
          { timeCode: '00:00:00', text: 'vicky.AI presents', layout: 'Bouncing Playful Top Banner' },
          { timeCode: '00:00:15', text: 'THE BRASS HEART', layout: 'Golden 3D Extruded Title' }
        ],
        thumbnailPrompt: 'YouTube 16:9 Thumbnail: Cute 3D brass robot with glowing heart beside grinning young boy inventor in sunlit workshop with bold text "IT ACTUALLY WORKS!"'
      },
      higgsfield: {
        characterConsistencyTag: 'vicky_char_leo_sparks',
        motionPrompts: [
          {
            shot: 1,
            cameraMovement: 'slow dolly in through clockwork',
            prompt: 'vicky_char_leo_sparks examining gears in glowing steampunk attic, warm volumetric sunshine, 3d pixar animation style [dolly in]',
            negativePrompt: 'photorealistic, live action, muted colors, flat lighting',
            motionScale: 0.7
          }
        ]
      },
      davinciResolve: {
        lutRecommendation: 'Arri_3DAnimation_VibrantPunch.cube',
        colorWheelLift: 'RGB(0.00, 0.00, 0.00)',
        colorWheelGamma: 'RGB(0.04, 0.02, -0.01)',
        colorWheelGain: 'RGB(1.08, 1.04, 0.96)',
        cdlXml: `<ColorCorrection id="vicky_grade_3d">\n  <SOPNode>\n    <Slope>1.08 1.04 0.96</Slope>\n    <Offset>0.00 0.00 0.00</Offset>\n    <Power>0.92 0.92 0.95</Power>\n  </SOPNode>\n  <SatNode>\n    <Saturation>1.120000</Saturation>\n  </SatNode>\n</ColorCorrection>`
      },
      elevenlabs: {
        voiceName: 'Charlie - Upbeat Animated Teen',
        stability: 0.65,
        similarityBoost: 0.80,
        scriptWithBursts: 'Grandpa always told me: a real machine needs more than gears. It needs a spark! Just one final turn... easy now... <gasp> Hello little guy! |yeah| Welcome to the world.'
      }
    }
  },
  {
    id: 'proj_neo_cyberpunk',
    title: 'Neon Drift: Sub-Sector 9',
    logline: 'In a rain-drenched vertical megacity of holographic shadows, a cybernetic courier races across skybridge conduits with forbidden quantum data.',
    userIdea: 'High-octane cyberpunk sci-fi teaser. Wet neon city, rain, neon signs, holographic advertisements, synthwave bass, fast paced, Blade Runner aesthetic.',
    style: 'cyberpunk_noir',
    aspectRatio: '16:9',
    targetDurationSec: 18,
    createdAt: '2026-10-02T00:00:00Z',
    autonomousDecisions: {
      directorRationale: 'Vicky.AI selected a high-contrast Cyberpunk Noir aesthetic with Blade Runner-inspired anamorphic flares and deep indigo-magenta separation. Shutter angle set to 90 degrees for crisp rain streak captures.',
      colorPalette: {
        gradingName: 'Neo-Tokyo Indigo & Magenta Anamorphic',
        primary: '#090A0F',
        secondary: '#1A0826',
        accent: '#FF007F',
        shadows: '#020307',
        contrastCurve: 'Steep High-Contrast Matrix with Crushed Cyan Shadows',
        saturationLevel: '125% Selective Neon Luminescence',
        rationale: 'Deep darkness allows electric magenta, cyan, and acid green neon signs to punch through the stormy rain volume.'
      },
      characterBible: [
        {
          name: 'Nyx Kestrel',
          role: 'Data Courier',
          visualDescription: 'Agile 26yo runner with chrome ocular implant, dark shaved temple undercut, holographic spine tattoo.',
          wardrobe: 'Weatherproof high-collar iridescent tactical duster, carbon-fiber fingerless gauntlets.',
          emotionalArc: 'Hyper-focused tension, adrenaline-fueled evasion, cold confidence.',
          voiceProfile: 'Sultry alto with synthesized vocoder modulation and tight tactical cadence.',
          consistencySeedPrompt: 'vicky_char_nyx_kestrel, 26yo cyberpunk woman runner, chrome ocular implant, black tactical trench',
          imageUrl: '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg',
          facePreserveEnabled: true,
          facePreserveStrength: 0.95,
          bodyPosture: 'Dynamic Sprint',
          poseWeight: 0.92,
          faceAnchorTags: '[face_id_lock: Nyx_Kestrel_Cyber] [openpose: rooftop_catwalk_sprint_0.92]'
        }
      ],
      locations: [
        {
          name: 'Upper Skybridge Conduit 09',
          environmentType: 'exterior',
          lighting: 'Giant animated holographic billboards reflecting on wet chrome catwalks',
          atmosphere: 'Acid rain, steam venting from cryo-ducts, drone traffic lanes below',
          cameraPlacement: 'Dutch angle tracking shot at 16mm ultra wide',
          visualRefPrompt: 'Cinematic neo-cyberpunk establishing shot, dramatic vertical towers shrouded in neon mist, holographic billboards'
        }
      ],
      soundDesign: {
        musicGenre: 'Dark Synthwave / Darksynth Cyber',
        bpm: 128,
        mood: 'Aggressive, relentless, electrifying',
        instruments: ['Analog saw bass', 'Gated reverb snare', 'Arpeggiated lead synths', 'Industrial metal clanks'],
        audioMixNotes: 'Heavy sidechain pumping against 128 BPM kick drum. High-frequency rain hiss stereo widened 140%.'
      }
    },
    shots: [
      {
        id: 'shot_c1',
        shotNumber: 1,
        title: 'Megacity Abyss',
        durationSec: 6,
        shotType: 'Extreme Wide',
        cameraMotion: 'Crane Jib Down',
        lensMm: '14mm Cine Ultra',
        visualPrompt: 'Cinematic neo-cyberpunk establishing shot, dramatic vertical towers shrouded in neon mist, holographic billboards reflecting on wet asphalt, deep indigo, magenta and emerald rim lights, Blade Runner aesthetic, ultra-detailed wide angle',
        imagePreviewUrl: '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg',
        character: 'Nyx Kestrel',
        voiceover: 'At fifty floors up, you stop looking down. You only look forward.',
        sfx: ['Hovercar Doppler zoom', 'Neon ballast buzz', 'Sub-woofer drop impact'],
        transition: 'Glitch Impact'
      },
      {
        id: 'shot_c2',
        shotNumber: 2,
        title: 'The Courier Sprint',
        durationSec: 6,
        shotType: 'Low-Angle Tracking',
        cameraMotion: 'Dolly Track Right',
        lensMm: '24mm Anamorphic',
        visualPrompt: 'Low angle motion tracking shot of cyberpunk runner sprinting across rain-drenched catwalk, neon billboards flickering behind, holographic glitch trails, cinematic 8k',
        imagePreviewUrl: '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg',
        character: 'Nyx Kestrel',
        voiceover: 'They gave me sixty seconds to cross the sector. I only need forty.',
        sfx: ['Boots splashing puddle', 'Breathing monitor ping', 'Sirens in lower grid'],
        transition: 'Whip Pan'
      },
      {
        id: 'shot_c3',
        shotNumber: 3,
        title: 'Data Uplink Locked',
        durationSec: 6,
        shotType: 'Close-Up',
        cameraMotion: 'Slow Push-In',
        lensMm: '50mm Macro Prime',
        visualPrompt: 'Close up of cyberpunk woman with glowing holographic eye displaying green code streams, rain running over tactical collar, neon glow',
        imagePreviewUrl: '/src/assets/images/shot_cyberpunk_neon_1790926417160.jpg',
        character: 'Nyx Kestrel',
        voiceover: 'Payload verified. Disappearing now.',
        sfx: ['Digital modem handshake', 'Bass drop impact', 'Static burst'],
        transition: 'Fade to Black'
      }
    ],
    connectors: {
      capcut: {
        projectTitle: 'Neo_Drift_SubSector9_CapCut',
        beatSyncBpm: 128,
        aspectRatio: '16:9',
        timelineTracks: [
          { trackName: 'V1_CyberpunkClips', clipsCount: 3, fxType: 'CyberGlitch_RGB_Split' },
          { trackName: 'V2_NeonText', clipsCount: 3, fxType: 'HoloGlow_NeonPink' },
          { trackName: 'A1_DarksynthBeats', clipsCount: 1, fxType: 'BassBooster_Hard' }
        ],
        exportJson: JSON.stringify({
          app: 'CapCut_Desktop',
          version: '3.8.0',
          fps: 60,
          canvas: { width: 3840, height: 2160 }
        }, null, 2),
        edlFormat: `TITLE: Neo_Drift_SubSector9\n001  V1  C  00:00:00:00 00:00:06:00 00:00:00:00 00:00:06:00\n002  V1  C  00:00:00:00 00:00:06:00 00:00:06:00 00:00:12:00\n003  V1  C  00:00:00:00 00:00:06:00 00:00:12:00 00:00:18:00`
      },
      canva: {
        templateType: 'Cyberpunk YouTube Stream Overlay & Social Video Reel',
        fontPairing: { header: 'Orbitron', body: 'JetBrains Mono' },
        colorHexes: ['#090A0F', '#FF007F', '#00F0FF', '#39FF14'],
        overlays: [
          { timeCode: '00:00:00', text: 'VICKY.AI SYNTHESIS', layout: 'Glitch Terminal Top Left' },
          { timeCode: '00:00:12', text: 'SECTOR 09 SECURED', layout: 'Cyber Neon Lower Third' }
        ],
        thumbnailPrompt: 'YouTube 16:9 Thumbnail: High-contrast cyberpunk runner with glowing ocular lens and neon rain cityscape with neon title "THE RUNNER WHO ESCAPED"'
      },
      higgsfield: {
        characterConsistencyTag: 'vicky_char_nyx_kestrel',
        motionPrompts: [
          {
            shot: 1,
            cameraMovement: 'fast whip tracking with speed ramp',
            prompt: 'vicky_char_nyx_kestrel leaping across rain drenched high tech neon catwalk, neon billboards flickering, blade runner aesthetic [whip pan]',
            negativePrompt: 'sunny, rural, daylight, cartoony, low resolution',
            motionScale: 0.95
          }
        ]
      },
      davinciResolve: {
        lutRecommendation: 'Cyberpunk_BladeRunner_IndigoMagenta.cube',
        colorWheelLift: 'RGB(-0.04, -0.01, 0.05)',
        colorWheelGamma: 'RGB(0.02, -0.02, 0.03)',
        colorWheelGain: 'RGB(0.92, 1.05, 1.15)',
        cdlXml: `<ColorCorrection id="vicky_cyber_grade">\n  <SOPNode>\n    <Slope>0.92 1.05 1.15</Slope>\n    <Offset>-0.04 -0.01 0.05</Offset>\n    <Power>1.10 1.05 0.92</Power>\n  </SOPNode>\n  <SatNode>\n    <Saturation>1.250000</Saturation>\n  </SatNode>\n</ColorCorrection>`
      },
      elevenlabs: {
        voiceName: 'Nyx - Synthetic Tactical Whisper',
        stability: 0.82,
        similarityBoost: 0.90,
        scriptWithBursts: 'At fifty floors up, you stop looking down. You only look forward. They gave me sixty seconds to cross the sector. I only need forty. <breath> Payload verified. Disappearing now.'
      }
    }
  }
];
