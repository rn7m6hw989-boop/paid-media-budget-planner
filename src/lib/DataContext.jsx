import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { SEED_DATA, EMPTY_DATA } from '../lib/seedData.js';
import { uid } from '../lib/calculations.js';

const STORAGE_KEY = 'paid-media-budget-planner-v1';
const DataContext = createContext(null);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load from storage', err);
  }
  return SEED_DATA;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to storage', err);
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'REPLACE_ALL':
      return action.data;

    case 'UPDATE_POOL':
      return { ...state, pool: { ...state.pool, ...action.changes } };

    case 'UPDATE_OBJECTIVE':
      return {
        ...state,
        objectives: state.objectives.map((o) =>
          o.id === action.id ? { ...o, ...action.changes } : o
        ),
      };

    case 'ADD_OBJECTIVE':
      return {
        ...state,
        objectives: [
          ...state.objectives,
          { id: uid('obj'), name: 'New objective', weight: 1, justification: '', ...action.changes },
        ],
      };

    case 'REMOVE_OBJECTIVE':
      return { ...state, objectives: state.objectives.filter((o) => o.id !== action.id) };

    case 'UPDATE_BUSINESS_PRIORITY':
      return {
        ...state,
        businessPriorities: state.businessPriorities.map((b) =>
          b.id === action.id ? { ...b, ...action.changes } : b
        ),
      };

    case 'ADD_BUSINESS_PRIORITY':
      return {
        ...state,
        businessPriorities: [
          ...state.businessPriorities,
          { id: uid('bp'), name: 'New priority', weight: 1, justification: '', ...action.changes },
        ],
      };

    case 'REMOVE_BUSINESS_PRIORITY':
      return {
        ...state,
        businessPriorities: state.businessPriorities.filter((b) => b.id !== action.id),
      };

    case 'UPDATE_REGION':
      return {
        ...state,
        regions: state.regions.map((r) => (r.id === action.id ? { ...r, ...action.changes } : r)),
      };

    case 'UPDATE_REGION_SCORE':
      return {
        ...state,
        regions: state.regions.map((r) => {
          if (r.id !== action.id) return r;
          return {
            ...r,
            [action.rubric]: { ...r[action.rubric], [action.factorId]: action.value },
          };
        }),
      };

    case 'UPDATE_FACTOR_WEIGHT':
      return {
        ...state,
        rubrics: {
          ...state.rubrics,
          [action.rubric]: {
            ...state.rubrics[action.rubric],
            factors: state.rubrics[action.rubric].factors.map((f) =>
              f.id === action.factorId ? { ...f, weight: action.value } : f
            ),
          },
        },
      };

    case 'ADD_HARD_COMMITMENT':
      return {
        ...state,
        hardCommitments: [
          ...state.hardCommitments,
          {
            id: uid('hc'),
            name: 'New commitment',
            amount: 0,
            objectiveId: state.objectives[0]?.id || null,
            businessPriorityId: state.businessPriorities[0]?.id || null,
            regionId: state.regions[0]?.id || null,
            note: '',
            ...action.changes,
          },
        ],
      };

    case 'UPDATE_HARD_COMMITMENT':
      return {
        ...state,
        hardCommitments: state.hardCommitments.map((h) =>
          h.id === action.id ? { ...h, ...action.changes } : h
        ),
      };

    case 'REMOVE_HARD_COMMITMENT':
      return {
        ...state,
        hardCommitments: state.hardCommitments.filter((h) => h.id !== action.id),
      };

    case 'ADD_CAMPAIGN':
      return {
        ...state,
        campaigns: [
          ...state.campaigns,
          {
            id: uid('cmp'),
            name: 'New campaign',
            objectiveId: state.objectives[0]?.id || null,
            businessPriorityId: state.businessPriorities[0]?.id || null,
            regionId: state.regions[0]?.id || null,
            locked: false,
            manualAdjustment: null,
            ...action.changes,
          },
        ],
      };

    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c
        ),
      };

    case 'REMOVE_CAMPAIGN':
      return { ...state, campaigns: state.campaigns.filter((c) => c.id !== action.id) };

    case 'TOGGLE_LOCK':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.id ? { ...c, locked: !c.locked } : c
        ),
      };

    case 'APPLY_MANUAL_ADJUSTMENT':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.id ? { ...c, manualAdjustment: action.amount } : c
        ),
      };

    case 'CLEAR_MANUAL_ADJUSTMENT':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.id ? { ...c, manualAdjustment: null } : c
        ),
      };

    case 'REBALANCE_ALL_UNLOCKED':
      // Clear all manualAdjustments on unlocked campaigns so the model recalculates.
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.locked ? c : { ...c, manualAdjustment: null }
        ),
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.changes } };

    case 'LOG':
      return {
        ...state,
        changeLog: [
          {
            id: uid('log'),
            timestamp: new Date().toISOString(),
            actor: action.actor || 'You',
            ...action.entry,
          },
          ...state.changeLog,
        ].slice(0, 500), // cap log length
      };

    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const log = useCallback((entry) => {
    dispatch({ type: 'LOG', entry });
  }, []);

  const resetToSeed = useCallback(() => {
    dispatch({ type: 'REPLACE_ALL', data: SEED_DATA });
  }, []);

  const resetToEmpty = useCallback(() => {
    dispatch({ type: 'REPLACE_ALL', data: EMPTY_DATA });
  }, []);

  const replaceAll = useCallback((newData) => {
    dispatch({ type: 'REPLACE_ALL', data: newData });
  }, []);

  return (
    <DataContext.Provider value={{ data, dispatch, log, resetToSeed, resetToEmpty, replaceAll }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
