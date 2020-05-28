import { InjectionToken } from '@angular/core';

import { Data } from './phase-change-service';

export const PHASE_CHANGED_DIALOG_DATA = new InjectionToken<Data>('PHASE_CHANGED_DIALOG_DATA');