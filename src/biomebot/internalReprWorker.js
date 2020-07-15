// internalReprWorker.js
import {TextToInternalRepr,DictToInternalRepr}from './worker/internalRepr.worker.js';

export const textToInternalRepr = typeof window === 'object' && new TextToInternalRepr()
export const dictToInternalRepr = typeof window === 'object' && new DictToInternalRepr()