export type VideoStyle = 
  | 'real_hyperrealistic'
  | 'cinematic_anamorphic'
  | 'stylized_3d'
  | 'cyberpunk_noir'
  | 'retro_vintage'
  | 'anime_cel';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1';

export type ShotType = 
  | 'Extreme Wide'
  | 'Wide Master'
  | 'Medium'
  | 'Close-Up'
  | 'Extreme Close-Up'
  | 'Low-Angle Tracking'
  | 'Drone Orbit'
  | 'Dutch Tilt';

export type CameraMotion = 
  | 'Static'
  | 'Slow Push-In'
  | 'Dolly Track Right'
  | 'Crane Jib Down'
  | 'FPV Drone Arc'
  | 'Handheld Raw'
  | 'Drone Orbit'
  | 'Low-Angle Tracking';

export interface ShotItem {
  id: string;
  shotNumber: number;
  title: string;
  durationSec: number;
  shotType: ShotType;
  cameraMotion: CameraMotion;
  lensMm: string;
  visualPrompt: string;
  imagePreviewUrl?: string;
  videoBlobUrl?: string;
  character?: string;
  voiceover?: string;
  sfx: string[];
  transition: 'Cut' | 'Cross Dissolve' | 'Match Cut' | 'Whip Pan' | 'Glitch Impact' | 'Fade to Black';
}

export type BodyPostureType =
  | 'Heroic Standing'
  | 'Dynamic Sprint'
  | 'Cinematic Seated'
  | 'Low Combat Stance'
  | 'Slow Walking'
  | 'Observant Leaning'
  | 'Custom Posed';

export interface CharacterProfile {
  id?: string;
  name: string;
  role: string;
  visualDescription: string;
  wardrobe: string;
  emotionalArc: string;
  voiceProfile: string;
  consistencySeedPrompt: string;
  imageUrl?: string;
  facePreserveEnabled?: boolean;
  facePreserveStrength?: number;
  bodyPosture?: BodyPostureType;
  poseWeight?: number;
  poseReferenceUrl?: string;
  faceAnchorTags?: string;
}

export interface LocationSet {
  name: string;
  environmentType: 'interior' | 'exterior' | 'aerial' | 'macro';
  lighting: string;
  atmosphere: string;
  cameraPlacement: string;
  visualRefPrompt: string;
}

export interface ColorHarmony {
  gradingName: string;
  primary: string;
  secondary: string;
  accent: string;
  shadows: string;
  contrastCurve: string;
  saturationLevel: string;
  rationale: string;
}

export interface SoundDesignSpec {
  musicGenre: string;
  bpm: number;
  mood: string;
  instruments: string[];
  audioMixNotes: string;
}

export interface AutonomousDecisions {
  directorRationale: string;
  colorPalette: ColorHarmony;
  characterBible: CharacterProfile[];
  locations: LocationSet[];
  soundDesign: SoundDesignSpec;
}

export interface ConnectorsBlueprint {
  capcut: {
    projectTitle: string;
    beatSyncBpm: number;
    aspectRatio: string;
    timelineTracks: { trackName: string; clipsCount: number; fxType: string }[];
    exportJson: string;
    edlFormat: string;
  };
  canva: {
    templateType: string;
    fontPairing: { header: string; body: string };
    colorHexes: string[];
    overlays: { timeCode: string; text: string; layout: string }[];
    thumbnailPrompt: string;
  };
  higgsfield: {
    motionPrompts: {
      shot: number;
      cameraMovement: string;
      prompt: string;
      negativePrompt: string;
      motionScale: number;
    }[];
    characterConsistencyTag: string;
  };
  davinciResolve: {
    lutRecommendation: string;
    colorWheelLift: string;
    colorWheelGamma: string;
    colorWheelGain: string;
    cdlXml: string;
  };
  elevenlabs: {
    voiceName: string;
    stability: number;
    similarityBoost: number;
    scriptWithBursts: string;
  };
}

export interface ProductionProject {
  id: string;
  title: string;
  logline: string;
  userIdea: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  targetDurationSec: number;
  createdAt: string;
  autonomousDecisions: AutonomousDecisions;
  shots: ShotItem[];
  connectors: ConnectorsBlueprint;
  masterVideoBlobUrl?: string;
}
