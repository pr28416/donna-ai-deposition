import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Timestamp = {
  start: number;
  end: number;
  utterance: string;
  page: number;
};

export type QueryVideo = {
  video_path: string;
  max_doc: number; // 5
  max_window: number; // 3
};

export type QueryText = {
  text: string;
  top_k: number; // 3
  filter: object; // None
};
