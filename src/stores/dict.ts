import { create } from 'zustand';

import { transformDictList } from 'src/api/dict';
import type { Dict, DictMapData } from 'src/api/dict/types';

interface DictState {
  dictMapData: DictMapData;

  setDict: (code: string, data: Record<string, string>) => void;
  setDictMap: (data: DictMapData) => void;
  setDictMapFromList: (list: Dict[]) => void;
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
