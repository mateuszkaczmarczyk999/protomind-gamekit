export type FrameTick = {
  id: number;
  timestampMs: number;
  deltaSec: number;
  elapsedSec: number;
};

export type FrameListener = (tick: FrameTick) => void;

export interface IFrameScheduler {
  start(): void;
  stop(): void;
  now(): number;
  isRunning(): boolean;
  addListener(listener: FrameListener): void;
  removeListener(listener: FrameListener): void;
}
