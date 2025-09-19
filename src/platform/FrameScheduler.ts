import type { FrameListener, FrameTick, IFrameScheduler } from "./IFrame";

class FrameScheduler implements IFrameScheduler {
  private _isRunning: boolean = false;
  private _frameCount: number = 0;
  private _startTimestamp: number = 0;
  private _lastTimestamp: number | null = null;
  private _rafId: number | null = null;

  private _listeners = new Set<FrameListener>();
  private _listenersArray: FrameListener[] = [];
  private _listenersDirty = false;

  public start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this._startTimestamp = this.now();
    this._frameCount = 0;
    this._rafId = requestAnimationFrame(this._update);
  }

  public stop(): void {
    if (this._isRunning) return;
    this._isRunning = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  public now(): number {
    return performance.now();
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  public addListener(listener: FrameListener): void {
    this._listeners.add(listener);
    this._listenersDirty = true;
  }

  public removeListener(listener: FrameListener): void {
    this._listeners.delete(listener);
    this._listenersDirty = true;
  }

  private _toSeconds = (ms: number) => ms / 1000;

  private _update = (timestamp: number): void => {
    this._rafId = requestAnimationFrame(this._update);
    if (!this._isRunning) return;

    const isFirstFrame = this._lastTimestamp === null;
    const deltaSec = isFirstFrame
      ? 0
      : Math.max(0, this._toSeconds(timestamp - this._lastTimestamp!));
    this._lastTimestamp = timestamp;

    const tick: FrameTick = {
      id: this._frameCount++,
      timestampMs: timestamp,
      deltaSec: deltaSec,
      elapsedSec: this._toSeconds(timestamp - this._startTimestamp),
    };

    if (this._listenersDirty) {
      this._listenersArray = Array.from(this._listeners);
      this._listenersDirty = false;
    }

    for (const listener of this._listenersArray) listener(tick);
  };
}

export { FrameScheduler };
