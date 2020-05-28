import { Injectable, Inject, OnInit, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { PhaseChangeDialogComponent } from './phase-change-dialog.component';
import { PhaseChangeDialogRef } from './phase-change-ref';
import { PHASE_CHANGED_DIALOG_DATA } from './phase-change-dialog-tokens';

export interface Data {
  phase: string;
  psychic?: string;
}

interface PhaseChangeDialogConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
  data?: Data;
}

const DEFAULT_CONFIG: PhaseChangeDialogConfig = {
  hasBackdrop: true,
  backdropClass: 'dark-backdrop',
  panelClass: 'tm-file-preview-dialog-panel',
  data: null
}

@Injectable()
export class PhaseChangeOverlayService {

  constructor(
    private injector: Injector,
    private overlay: Overlay) { }

  dialogOpen = false;
  currentDialog :PhaseChangeDialogRef;

  open(config: PhaseChangeDialogConfig = {}) {

    if(this.dialogOpen)
    {
      this.currentDialog.close();
    }

    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);

    // Instantiate remote control
    const dialogRef = new PhaseChangeDialogRef(overlayRef);

    this.dialogOpen = true;
    dialogRef.afterClosed().subscribe(() => {
      this.dialogOpen = false;
    });
    this.currentDialog = dialogRef;
    
    const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef);

    dialogRef.componentInstance = overlayComponent;

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());

    return dialogRef;
  }

  private createOverlay(config: PhaseChangeDialogConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer(overlayRef: OverlayRef, config: PhaseChangeDialogConfig, dialogRef: PhaseChangeDialogRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PhaseChangeDialogComponent, null, injector);
    const containerRef: ComponentRef<PhaseChangeDialogComponent> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private createInjector(config: PhaseChangeDialogConfig, dialogRef: PhaseChangeDialogRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PhaseChangeDialogRef, dialogRef);
    injectionTokens.set(PHASE_CHANGED_DIALOG_DATA, config.data);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private getOverlayConfig(config: PhaseChangeDialogConfig): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });

    return overlayConfig;
  }
}