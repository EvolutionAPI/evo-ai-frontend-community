import { create } from 'zustand';
import { accountService } from '@/services/account/accountService';
import usersService from '@/services/users/usersService';
import InboxesService from '@/services/channels/inboxesService';
import { labelsService } from '@/services/contacts/labelsService';
import TeamsService from '@/services/teams/teamsService';
import type { Account } from '@/types/settings';
import type { User } from '@/types/users';
import type { Inbox } from '@/types/channels/inbox';
import type { Label } from '@/types/settings';
import type { Team } from '@/types/users';

interface AccountState {
  // Data
  account: Account | null;
  agents: User[];
  inboxes: Inbox[];
  labels: Label[];
  teams: Team[];

  // Loading states
  isLoadingAccount: boolean;
  isLoadingAgents: boolean;
  isLoadingInboxes: boolean;
  isLoadingLabels: boolean;
  isLoadingTeams: boolean;

  // ⚡ Cache timestamps para evitar requisições duplicadas
  lastFetchedAccountId: string | null;
  lastFetchTimestamps: {
    account: number;
    agents: number;
    inboxes: number;
    labels: number;
    teams: number;
  };

  // Actions
  fetchAccount: (accountId: string, forceRefresh?: boolean) => Promise<void>;
  fetchAgents: (forceRefresh?: boolean) => Promise<void>;
  fetchInboxes: (forceRefresh?: boolean) => Promise<void>;
  fetchLabels: (forceRefresh?: boolean) => Promise<void>;
  fetchTeams: (forceRefresh?: boolean) => Promise<void>;
  initializeAccountMinimal: (accountId: string) => Promise<void>;
  initializeAccountDeferred: (
    accountId: string,
    options?: {
      agents?: boolean;
      inboxes?: boolean;
      labels?: boolean;
      teams?: boolean;
      forceRefresh?: boolean;
    },
  ) => Promise<void>;
  initializeAccount: (accountId: string) => Promise<void>;
  removeInbox: (inboxId: string) => void;
  addInbox: (inbox: Inbox) => void;
  clearAccountData: () => void;
}

// ⚡ OTIMIZAÇÃO: Cache duration - 15 minutos
// Dados como agents, inboxes, labels, teams mudam raramente
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

export const useAccountStore = create<AccountState>((set, get) => ({
  // Initial state
  account: null,
  agents: [],
  inboxes: [],
  labels: [],
  teams: [],

  isLoadingAccount: false,
  isLoadingAgents: false,
  isLoadingInboxes: false,
  isLoadingLabels: false,
  isLoadingTeams: false,

  lastFetchedAccountId: null,
  lastFetchTimestamps: {
    account: 0,
    agents: 0,
    inboxes: 0,
    labels: 0,
    teams: 0,
  },

  // Actions
  fetchAccount: async (accountId, forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTimestamps.account;
    const isSameAccount = state.lastFetchedAccountId === accountId;

    if (!forceRefresh && isSameAccount && state.account && timeSinceLastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoadingAccount: true });
    try {
      const result = await accountService.getAccount(accountId);
      set({
        account: result,
        isLoadingAccount: false,
        lastFetchedAccountId: accountId,
        lastFetchTimestamps: { ...state.lastFetchTimestamps, account: now }
      });
    } catch (error) {
      console.error('Failed to fetch account:', error);
      set({ isLoadingAccount: false });
      throw error;
    }
  },

  fetchAgents: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTimestamps.agents;
    const hasAccountId = !!state.lastFetchedAccountId;

    if (!forceRefresh && hasAccountId && state.agents.length > 0 && timeSinceLastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoadingAgents: true });
    try {
      const response = await usersService.getUsers();
      set({
        agents: response.data,
        isLoadingAgents: false,
        lastFetchTimestamps: { ...state.lastFetchTimestamps, agents: now }
      });
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      set({ isLoadingAgents: false });
      throw error;
    }
  },

  fetchInboxes: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTimestamps.inboxes;
    const hasAccountId = !!state.lastFetchedAccountId;

    if (!forceRefresh && hasAccountId && state.inboxes.length > 0 && timeSinceLastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoadingInboxes: true });
    try {
      const inboxes = await InboxesService.list();
      set({
        inboxes: inboxes.data,
        isLoadingInboxes: false,
        lastFetchTimestamps: { ...state.lastFetchTimestamps, inboxes: now }
      });
    } catch (error) {
      console.error('Failed to fetch inboxes:', error);
      set({ isLoadingInboxes: false });
      throw error;
    }
  },

  fetchLabels: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTimestamps.labels;
    const hasAccountId = !!state.lastFetchedAccountId;

    if (!forceRefresh && hasAccountId && state.labels.length > 0 && timeSinceLastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoadingLabels: true });
    try {
      const response = await labelsService.getLabels();
      set({
        labels: response.data,
        isLoadingLabels: false,
        lastFetchTimestamps: { ...state.lastFetchTimestamps, labels: now }
      });
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      set({ isLoadingLabels: false });
      throw error;
    }
  },

  fetchTeams: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTimestamps.teams;
    const hasAccountId = !!state.lastFetchedAccountId;

    if (!forceRefresh && hasAccountId && state.teams.length > 0 && timeSinceLastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoadingTeams: true });
    try {
      const response = await TeamsService.getTeams();
      set({
        teams: response.data,
        isLoadingTeams: false,
        lastFetchTimestamps: { ...state.lastFetchTimestamps, teams: now }
      });
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      set({ isLoadingTeams: false });
      throw error;
    }
  },

  initializeAccountMinimal: async accountId => {
    // Bootstrap must not depend on `/accounts/:id` because some gateways
    // do not expose this endpoint consistently.
    set(state => ({
      lastFetchedAccountId: accountId,
      isLoadingAccount: false,
      lastFetchTimestamps: { ...state.lastFetchTimestamps, account: Date.now() },
    }));
  },

  initializeAccountDeferred: async (accountId, options = {}) => {
    const state = get();
    const forceRefresh = options.forceRefresh ?? false;
    const shouldLoadAgents = options.agents ?? true;
    const shouldLoadInboxes = options.inboxes ?? true;
    const shouldLoadLabels = options.labels ?? true;
    const shouldLoadTeams = options.teams ?? true;

    // Keep account context consistent before loading deferred datasets.
    if (state.lastFetchedAccountId !== accountId) {
      await get().fetchAccount(accountId, forceRefresh);
    }

    const tasks: Promise<void>[] = [];
    if (shouldLoadAgents) tasks.push(get().fetchAgents(forceRefresh));
    if (shouldLoadInboxes) tasks.push(get().fetchInboxes(forceRefresh));
    if (shouldLoadLabels) tasks.push(get().fetchLabels(forceRefresh));
    if (shouldLoadTeams) tasks.push(get().fetchTeams(forceRefresh));

    // Non-blocking account datasets. Each request is isolated to avoid all-or-nothing failures.
    await Promise.allSettled(tasks);
  },

  initializeAccount: async accountId => {
    await get().initializeAccountMinimal(accountId);
    await get().initializeAccountDeferred(accountId);
  },

  removeInbox: inboxId => {
    set(state => ({
      inboxes: state.inboxes.filter(inbox => inbox.id !== inboxId),
    }));
  },

  addInbox: inbox => {
    set(state => ({
      inboxes: [...state.inboxes, inbox],
    }));
  },

  clearAccountData: () => {
    set({
      account: null,
      agents: [],
      inboxes: [],
      labels: [],
      teams: [],
      lastFetchedAccountId: null,
      lastFetchTimestamps: {
        account: 0,
        agents: 0,
        inboxes: 0,
        labels: 0,
        teams: 0,
      },
    });
  },
}));
