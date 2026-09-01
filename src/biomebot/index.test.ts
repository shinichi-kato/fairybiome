import { describe, expect, it } from 'vitest';
import Kernel, {
  Biomebot,
  ChatBiomebot,
  Kernel as NamedKernel,
} from './index';
import {
  Biomebot as BiomebotImplementation,
  ChatBiomebot as ChatBiomebotImplementation,
} from './kernel';

describe('biomebot index exports', () => {
  it('re-exports the legacy kernel classes and preserves the Kernel alias', () => {
    expect(Kernel).toBe(BiomebotImplementation);
    expect(Biomebot).toBe(BiomebotImplementation);
    expect(NamedKernel).toBe(BiomebotImplementation);
    expect(ChatBiomebot).toBe(ChatBiomebotImplementation);
  });
});
