/**
 * Post-processing policy placeholder for bloom, occlusion, depth of field, grain, and vignette.
 */

export interface PostProcessingSettings {
  readonly bloom: boolean;
  readonly ssao: boolean;
  readonly depthOfField: boolean;
  readonly filmGrainIntensity: number;
  readonly vignette: boolean;
}

export class PostProcessing {
  private settings: PostProcessingSettings = {
    bloom: true,
    ssao: true,
    depthOfField: false,
    filmGrainIntensity: 0.02,
    vignette: true
  };

  /** Return current post-processing settings. */
  public snapshot(): PostProcessingSettings {
    return this.settings;
  }

  /** Replace post-processing settings. */
  public configure(settings: PostProcessingSettings): void {
    this.settings = settings;
  }
}

