import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_EQUITY_SOURCES } from '../utils/constants';

const useStore = create(
  persist(
    (set, get) => ({
      // Properties
      properties: [],
      addProperty: (p) =>
        set((state) => ({
          properties: [
            ...state.properties,
            {
              ...p,
              id: crypto.randomUUID(),
              status: p.status || 'pipeline_new',
              status_updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              features: p.features || [],
              highlights: p.highlights || [],
              risks: p.risks || [],
              images: p.images || [],
            },
          ],
        })),
      updateProperty: (id, updates) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
        })),
      updatePropertyStatus: (id, newStatus) => {
        const property = get().properties.find((p) => p.id === id);
        if (property) {
          set((state) => ({
            properties: state.properties.map((p) =>
              p.id === id
                ? { ...p, status: newStatus, status_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                : p
            ),
          }));
          get().addActivity({
            property_id: id,
            type: 'note',
            title: `סטטוס שונה ל: ${newStatus}`,
            content: '',
            tags: ['status-change'],
          });
        }
      },
      deleteProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        })),

      // Equity
      equitySources: DEFAULT_EQUITY_SOURCES,
      updateEquitySource: (id, updates) =>
        set((state) => ({
          equitySources: state.equitySources.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      totalEquity: () =>
        get().equitySources.reduce((sum, s) => sum + s.current_estimate, 0),

      // Tasks
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              is_done: false,
              created_at: new Date().toISOString(),
              completed_at: null,
            },
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, is_done: !t.is_done, completed_at: !t.is_done ? new Date().toISOString() : null }
              : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Activity Log
      activities: [],
      addActivity: (entry) =>
        set((state) => ({
          activities: [
            {
              ...entry,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              tags: entry.tags || [],
            },
            ...state.activities,
          ],
        })),
      deleteActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        })),

      // Mortgage settings
      mortgageYears: 25,
      mortgageRate: 4.5,
      setMortgageYears: (y) => set({ mortgageYears: y }),
      setMortgageRate: (r) => set({ mortgageRate: r }),

      // Income & personal
      netIncome: 14556,
      setNetIncome: (n) => set({ netIncome: n }),
      isFirstProperty: false,  // Alon owns half of Dukhifat
      setIsFirstProperty: (v) => set({ isFirstProperty: v }),

      // Data export/import
      exportData: () => {
        const state = get();
        return {
          properties: state.properties,
          equitySources: state.equitySources,
          tasks: state.tasks,
          activities: state.activities,
          mortgageYears: state.mortgageYears,
          mortgageRate: state.mortgageRate,
          netIncome: state.netIncome,
          isFirstProperty: state.isFirstProperty,
          decisionScores: state.decisionScores,
          decisionWeights: state.decisionWeights,
          scenarios: state.scenarios,
          milestones: state.milestones,
          _exportedAt: new Date().toISOString(),
        };
      },
      importData: (data) => {
        if (!data || !data.properties) return false;
        set({
          properties: data.properties || [],
          equitySources: data.equitySources || get().equitySources,
          tasks: data.tasks || [],
          activities: data.activities || [],
          mortgageYears: data.mortgageYears ?? 25,
          mortgageRate: data.mortgageRate ?? 4.5,
          netIncome: data.netIncome ?? 14556,
          isFirstProperty: data.isFirstProperty ?? false,
          decisionScores: data.decisionScores || [],
          decisionWeights: data.decisionWeights || {},
          scenarios: data.scenarios || [],
          milestones: data.milestones || get().milestones,
        });
        return true;
      },

      // Decision scores
      decisionScores: [],
      setDecisionScore: (propertyId, criterion, score) =>
        set((state) => {
          const existing = state.decisionScores.find(
            (s) => s.property_id === propertyId && s.criterion === criterion
          );
          if (existing) {
            return {
              decisionScores: state.decisionScores.map((s) =>
                s.property_id === propertyId && s.criterion === criterion
                  ? { ...s, score }
                  : s
              ),
            };
          }
          return {
            decisionScores: [
              ...state.decisionScores,
              { id: crypto.randomUUID(), property_id: propertyId, criterion, score, weight: 5 },
            ],
          };
        }),
      setDecisionWeight: (criterion, weight) =>
        set((state) => ({
          decisionScores: state.decisionScores.map((s) =>
            s.criterion === criterion ? { ...s, weight } : s
          ),
        })),
      decisionWeights: {},
      setWeight: (criterion, weight) =>
        set((state) => ({
          decisionWeights: { ...state.decisionWeights, [criterion]: weight },
        })),

      // Scenarios
      scenarios: [],
      addScenario: (scenario) =>
        set((state) => ({
          scenarios: [
            ...state.scenarios,
            { ...scenario, id: crypto.randomUUID() },
          ],
        })),
      updateScenario: (id, updates) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
        })),

      // Milestones
      milestones: [
        { id: '1', title: 'סיום מחקר וסינון', target_date: '2026-02-09', property_id: null, is_completed: false, sort_order: 0 },
        { id: '2', title: 'סיורים אחרונים', target_date: '2026-02-05', property_id: null, is_completed: false, sort_order: 1 },
        { id: '3', title: 'החלטה סופית על דירה', target_date: '2026-02-10', property_id: null, is_completed: false, sort_order: 2 },
        { id: '4', title: 'סגירת משכנתא', target_date: '2026-02-15', property_id: null, is_completed: false, sort_order: 3 },
        { id: '5', title: 'חתימת חוזה', target_date: '2026-03-01', property_id: null, is_completed: false, sort_order: 4 },
        { id: '6', title: 'כניסה לדירה', target_date: '2026-04-01', property_id: null, is_completed: false, sort_order: 5 },
      ],
      toggleMilestone: (id) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === id ? { ...m, is_completed: !m.is_completed } : m
          ),
        })),
      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [
            ...state.milestones,
            { ...milestone, id: crypto.randomUUID(), is_completed: false },
          ],
        })),
    }),
    { name: 'dirali-store' }
  )
);

export default useStore;
