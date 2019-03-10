import { HammerGestureConfig } from '@angular/platform-browser';

export class HammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      threshold: 1,
    },
  };
}
