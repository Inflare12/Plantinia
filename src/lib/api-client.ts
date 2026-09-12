export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('plantinia_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('plantinia_auth_token', token);
      } else {
        localStorage.removeItem('plantinia_auth_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('plantinia_auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errData: any;
      try {
        errData = await res.json();
      } catch {
        errData = { message: await res.text() };
      }
      throw new ApiError(res.status, errData.message || errData.error || 'Request failed', errData);
    }

    return await res.json();
  }

  auth = {
    login: async (email: string, password: string) => {
      const data = await this.request<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.token);
      return data;
    },

    signup: async (name: string, email: string, password: string) => {
      const data = await this.request<{ user: any; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      this.setToken(data.token);
      return data;
    },

    getMe: async () => {
      return await this.request<{ user: any }>('/api/auth/me');
    },

    logout: async () => {
      try {
        await this.request('/api/auth/logout', { method: 'POST' });
      } finally {
        this.setToken(null);
      }
    },

    verifyEmail: async (email: string, code: string) => {
      return await this.request<{ success: boolean; message: string }>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    },
  };

  plants = {
    list: async () => {
      return await this.request<{ plants: any[] }>('/api/plants');
    },

    get: async (id: string) => {
      return await this.request<{ plant: any; diagnoses: any[]; timeline: any[] }>(`/api/plants/${id}`);
    },

    create: async (plantData: any) => {
      return await this.request<{ plant: any }>('/api/plants', {
        method: 'POST',
        body: JSON.stringify(plantData),
      });
    },

    update: async (id: string, updates: any) => {
      return await this.request<{ plant: any }>(`/api/plants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    delete: async (id: string) => {
      return await this.request<{ success: boolean }>(`/api/plants/${id}`, {
        method: 'DELETE',
      });
    },

    getTimeline: async (plantId: string) => {
      return await this.request<{ timeline: any[] }>(`/api/plants/${plantId}/timeline`);
    },

    addTimelineEvent: async (plantId: string, event: any) => {
      return await this.request<{ event: any }>(`/api/plants/${plantId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(event),
      });
    },
  };

  diagnose = {
    scan: async (params: {
      mediaUrl: string;
      mediaType: 'image' | 'video';
      plantId?: string;
      plantSpeciesHint?: string;
      notes?: string;
    }) => {
      return await this.request<{ diagnosis: any; remainingCredits?: number }>('/api/diagnose', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    get: async (id: string) => {
      return await this.request<{ diagnosis: any }>(`/api/diagnose/${id}`);
    },

    identify: async (imageUrl: string) => {
      return await this.request<{ identification: any }>('/api/identify', {
        method: 'POST',
        body: JSON.stringify({ imageUrl }),
      });
    },
  };

  chat = {
    send: async (messages: any[], plantContext?: any) => {
      return await this.request<{
        response: string;
        suggestedFollowUps: string[];
        aiProviderUsed: string;
      }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, plantContext }),
      });
    },
  };

  careTasks = {
    list: async () => {
      return await this.request<{ tasks: any[] }>('/api/care-plans');
    },

    create: async (task: any) => {
      return await this.request<{ task: any }>('/api/care-plans', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    },

    toggle: async (id: string) => {
      return await this.request<{ task: any }>(`/api/care-plans/${id}`, {
        method: 'PATCH',
      });
    },
  };

  weather = {
    get: async (lat?: number, lon?: number) => {
      const q = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
      return await this.request<{ advisory: any }>(`/api/weather${q}`);
    },
  };

  knowledge = {
    list: async () => {
      return await this.request<{ items: any[] }>('/api/knowledge');
    },

    search: async (q: string) => {
      return await this.request<{ items: any[] }>(`/api/knowledge?q=${encodeURIComponent(q)}`);
    },
  };

  billing = {
    getPlans: async () => {
      return await this.request<{
        plans: any[];
        currentTier: string;
        subscriptionStatus?: string;
        subscriptionCurrentPeriodEnd?: string;
        creditsRemaining: number;
        videoCreditsRemaining: number;
        plantsCount: number;
        invoices: any[];
      }>('/api/billing/plans');
    },

    createRazorpayOrder: async (tier: string) => {
      return await this.request<{
        order: any;
        keyId: string;
        plan: any;
      }>('/api/billing/create-order', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
    },

    verifyRazorpayPayment: async (paymentData: any) => {
      return await this.request<{
        success: boolean;
        user: any;
        message: string;
      }>('/api/billing/verify-payment', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },

    createStripeSession: async (tier: string) => {
      return await this.request<{ url: string }>('/api/billing/stripe-checkout', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
    },
  };

  admin = {
    getStats: async () => {
      return await this.request<any>('/api/admin/stats');
    },

    getModels: async () => {
      return await this.request<{ models: any[] }>('/api/admin/models');
    },

    setActiveModel: async (id: string) => {
      return await this.request<{
        model: any;
        message: string;
      }>(`/api/admin/models/${id}/activate`, {
        method: 'POST',
      });
    },

    getDatasets: async () => {
      return await this.request<{ datasets: any[] }>('/api/admin/datasets');
    },

    submitFeedback: async (diagnosisId: string, feedback: 'accurate' | 'inaccurate') => {
      return await this.request<{ success: boolean }>('/api/admin/feedback', {
        method: 'POST',
        body: JSON.stringify({ diagnosisId, feedback }),
      });
    },
  };
}

export const apiClient = new ApiClient();

