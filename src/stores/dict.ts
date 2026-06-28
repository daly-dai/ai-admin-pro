import { create } from 'zustand';

import { transformDictList } from 'src/api/dict';
import type { Dictionary } from 'src/api/dict/types';

interface DictState {
  dictMapData: Record<string, Record<string, string>>;

  setDict: (code: string, data: Record<string, string>) => void;
  setDictMap: (data: Record<string, Record<string, string>>) => void;
  setDictMapFromList: (list: Dictionary[]) => void;
  reset: () => void;
}

export const useDictStore = create<DictState>()((set) => ({
  dictMapData: {},

  setDict: (code, data) =>
    set((state) => ({
      dictMapData: { ...state.dictMapData, [code]: data },
    })),

  setDictMap: (data) =>
    set((state) => ({
      dictMapData: { ...state.dictMapData, ...data },
    })),

  setDictMapFromList: (list) =>
    set((state) => ({
      dictMapData: {
        ...state.dictMapData,
        ...transformDictList(list),
      },
    })),

  reset: () => set({ dictMapData: {} }),
}));
