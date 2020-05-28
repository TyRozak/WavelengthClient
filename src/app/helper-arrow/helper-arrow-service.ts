import { Injectable, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef,  ConnectionPositionPair } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { HelperArrowComponent } from './helper-arrow.component';
import { HelperArrowRef } from './helper-arrow-ref';
import { HELPER_ARROW_DATA } from './helper-arrow-tokens';

export interface Data {
  direction: string,
  message: string,
  originElement?: any,
  left?:any,
  top?:any,
  timeout: number
}

export interface HelperArrowConfig {
  data?: Data;
}

const DEFAULT_CONFIG: HelperArrowConfig = {
  data: null
}

@Injectable()
export class HelperArrowService {

  constructor(
    private injector: Injector,
    private overlay: Overlay) { }

  createPromise(config)
  {
    return new Promise((resolve)=>{ 
      this.open(config).afterClosed().subscribe(()=>{resolve();});
    });
  }

  currentConfigs:HelperArrowConfig[];
  openMultiple(configs: HelperArrowConfig[])
  {
    this.currentConfigs = configs;
    this.currentConfigs.reduce( async (previousPromise, nextConfig) => {
      await previousPromise;
      return this.createPromise(nextConfig);
    }, Promise.resolve());
  }

  dialogOpen = false;
  currentDialog :HelperArrowRef;

  open(config: HelperArrowConfig = {}) {

    if(this.dialogOpen)
    {
      this.currentDialog.close();
      this.currentConfigs = [];
    }

    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    const overlayRef = this.createOverlay(dialogConfig);

    // Instantiate remote control
    const dialogRef = new HelperArrowRef(overlayRef);

    const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef);

    this.dialogOpen = true;
    dialogRef.afterClosed().subscribe(() => {
      this.dialogOpen = false;
    });
    this.currentDialog = dialogRef;

    dialogRef.componentInstance = overlayComponent;

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());

    switch (dialogConfig.data.direction) {
      case "pointUp":
        dialogRef.componentInstance.angle = 270;
        dialogRef.componentInstance.helperArrowContainerClassList += " animUp";
        dialogRef.componentInstance.helperContainerClassList += " helperContainerColumnReverse";
        break;
      case "pointDown":
        dialogRef.componentInstance.angle = 90;
        dialogRef.componentInstance.helperArrowContainerClassList += " animDown";
        dialogRef.componentInstance.helperContainerClassList += " helperContainerColumn";
        break;
      case "pointLeft":
        dialogRef.componentInstance.angle = 180;
        dialogRef.componentInstance.helperArrowContainerClassList += " animLeft";
        dialogRef.componentInstance.helperContainerClassList += " helperContainerRowReverse";
        break;
      case "pointRight":
        dialogRef.componentInstance.angle = 0;
        dialogRef.componentInstance.helperArrowContainerClassList += " animRight";
        dialogRef.componentInstance.helperContainerClassList += " helperContainerRow";    
        break;
    }

    return dialogRef;
  }

  private createOverlay(config: HelperArrowConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer(overlayRef: OverlayRef, config: HelperArrowConfig, arrowRef: HelperArrowRef) {
    const injector = this.createInjector(config, arrowRef);

    const containerPortal = new ComponentPortal(HelperArrowComponent, null, injector);
    const containerRef: ComponentRef<HelperArrowComponent> = overlayRef.attach(containerPortal);

    
    setTimeout(() => {
      containerRef.instance.close();
      setTimeout(() => {
        containerRef.destroy()
      }, 1000);
    }, config.data.timeout);

    return containerRef.instance;
  }

  private createInjector(config: HelperArrowConfig, dialogRef: HelperArrowRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(HelperArrowRef, dialogRef);
    injectionTokens.set(HELPER_ARROW_DATA, config.data);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private getOverlayConfig(config: HelperArrowConfig): OverlayConfig {
    var positionStrategy
    
    if(config.data.originElement)
    {
      positionStrategy= this.overlay.position().flexibleConnectedTo(config.data.originElement)
      .withPositions(this.getPositions(config));
    }
    else
    {
      positionStrategy =this.overlay.position().global().left(config.data.left+"px").top(config.data.top+"px");
    }
    
    const overlayConfig = new OverlayConfig({

      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: positionStrategy
    });

    return overlayConfig;
  }

  private getPositions(config: HelperArrowConfig): ConnectionPositionPair[] {

    switch (config.data.direction) {
      case "pointUp":
        return [{
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }];
      case "pointDown":
        return [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
          }];
      case "pointLeft":
        return [
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          }];
      case "pointRight":
        return [
          {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center'
          }];
    }
  }
}