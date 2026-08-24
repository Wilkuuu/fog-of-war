import { registerPlugin } from '@capacitor/core';

export interface PickedQueueVideo {
  path: string;
  name?: string;
}

export interface VideoQueuePickerPlugin {
  pickVideos(): Promise<{ files: PickedQueueVideo[] }>;
}

export const VideoQueuePicker = registerPlugin<VideoQueuePickerPlugin>('VideoQueuePicker');
