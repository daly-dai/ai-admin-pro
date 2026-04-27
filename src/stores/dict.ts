import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { transformDictList } from 'src/api/dict';
import type { Dictionary } from 'src/api/dict/types';

interface DictState {
  dictMapData: Record<string, Record<string, string>>;

  setDict: (code: string, data: Record<string, string>) => void;
  setDictMap: (data: Record<string, Record<string, string>>) => void;
  setDictMapFromList: (list: Dictionary[]) => void;
  reset: () => void;
}

export const useDictStore = create<DictState>()(
  immer((set) => ({
    dictMapData: {},

    setDict: (code, data) =>
      set((state) => {
        state.dictMapData[code] = data;
      }),

    setDictMap: (data) =>
      set((state) => {
        state.dictMapData = { ...state.dictMapData, ...data };
      }),

    setDictMapFromList: (list) =>
      set((state) => {
        state.dictMapData = {
          ...state.dictMapData,
          ...transformDictList(list),
        };
      }),

    reset: () =>
      set((state) => {
        state.dictMapData = {};
      }),
  })),
);
