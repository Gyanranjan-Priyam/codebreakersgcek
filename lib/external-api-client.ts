/**
 * External Data API Client
 * 
 * A type-safe client library for interacting with the External Data API.
 * Handles authentication, error handling, rate limiting, and provides
 * convenient methods for fetching all resource types.
 * 
 * @example
 * ```typescript
 * const client = new ExternalAPIClient({
 *   apiKey: process.env.EXTERNAL_API_KEY!,
 *   baseUrl: 'https://your-domain.com'
 * });
 * 
 * // Fetch users
 * const users = await client.users.list({ branch: 'CSE', limit: 50 });
 * 
 * // Fetch active quizzes
 * const quizzes = await client.quizzes.list({ isActive: true });
 * 
 * // Get database summary
 * const summary = await client.all();
 * ```
 */

import type {
  APIResponse,
  APIError,
  User,
  Announcement,
  AttendanceSession,
  Task,
  EventPoint,
  Quiz,
  PublishedProject,
  ProjectReview,
  ResourceFolder,
  SupportTicket,
  AllDataSummary,
  ExternalAPIConfig,
  UserQueryParams,
  AnnouncementQueryParams,
  QuizQueryParams,
  ReviewQueryParams,
  SupportQueryParams,
  BaseQueryParams,
} from './external-api-types';

export class ExternalAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ExternalAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Generic fetch method with error handling
   */
  private async fetch<T>(
    resource: string,
    params: Record<string, any> = {}
  ): Promise<APIResponse<T>> {
    const queryParams = new URLSearchParams({
      resource,
      ...this.cleanParams(params),
    });

    const url = `${this.baseUrl}/api/external/data?${queryParams}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = data as APIError;
        throw new ExternalAPIError(
          error.message,
          error.code,
          response.status,
          error
        );
      }

      return data as APIResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ExternalAPIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ExternalAPIError(
          'Request timeout',
          'TIMEOUT',
          408
        );
      }

      throw new ExternalAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'NETWORK_ERROR',
        0
      );
    }
  }

  /**
   * Clean and convert params to string values
   */
  private cleanParams(params: Record<string, any>): Record<string, string> {
    const cleaned: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && key !== 'resource') {
        cleaned[key] = String(value);
      }
    }
    
    return cleaned;
  }

  // ==================== User Methods ====================

  public users = {
    /**
     * Fetch users with optional filtering
     */
    list: async (params?: Omit<UserQueryParams, 'resource'>): Promise<APIResponse<User[]>> => {
      return this.fetch<User[]>('users', params);
    },

    /**
     * Fetch users by branch
     */
    byBranch: async (branch: string, limit = 100): Promise<APIResponse<User[]>> => {
      return this.fetch<User[]>('users', { branch, limit });
    },

    /**
     * Fetch users by admission year
     */
    byAdmissionYear: async (year: string, limit = 100): Promise<APIResponse<User[]>> => {
      return this.fetch<User[]>('users', { admissionYear: year, limit });
    },
  };

  // ==================== Announcement Methods ====================

  public announcements = {
    /**
     * Fetch announcements with optional filtering
     */
    list: async (params?: Omit<AnnouncementQueryParams, 'resource'>): Promise<APIResponse<Announcement[]>> => {
      return this.fetch<Announcement[]>('announcements', params);
    },

    /**
     * Fetch announcements by category
     */
    byCategory: async (category: string, limit = 100): Promise<APIResponse<Announcement[]>> => {
      return this.fetch<Announcement[]>('announcements', { category, limit });
    },

    /**
     * Fetch pinned announcements
     */
    pinned: async (limit = 100): Promise<APIResponse<Announcement[]>> => {
      return this.fetch<Announcement[]>('announcements', { isPinned: true, limit });
    },
  };

  // ==================== Attendance Methods ====================

  public attendance = {
    /**
     * Fetch attendance sessions
     */
    list: async (params?: Omit<BaseQueryParams, 'resource'>): Promise<APIResponse<AttendanceSession[]>> => {
      return this.fetch<AttendanceSession[]>('attendance', params);
    },

    /**
     * Fetch attendance sessions with attendance records
     */
    withRecords: async (limit = 100): Promise<APIResponse<AttendanceSession[]>> => {
      return this.fetch<AttendanceSession[]>('attendance', { includeRelations: true, limit });
    },
  };

  // ==================== Task Methods ====================

  public tasks = {
    /**
     * Fetch tasks
     */
    list: async (params?: Omit<BaseQueryParams, 'resource'>): Promise<APIResponse<Task[]>> => {
      return this.fetch<Task[]>('tasks', params);
    },

    /**
     * Fetch tasks with submissions
     */
    withSubmissions: async (limit = 100): Promise<APIResponse<Task[]>> => {
      return this.fetch<Task[]>('tasks', { includeRelations: true, limit });
    },
  };

  // ==================== Event Methods ====================

  public events = {
    /**
     * Fetch events
     */
    list: async (params?: Omit<BaseQueryParams, 'resource'>): Promise<APIResponse<EventPoint[]>> => {
      return this.fetch<EventPoint[]>('events', params);
    },

    /**
     * Fetch events with participations
     */
    withParticipations: async (limit = 100): Promise<APIResponse<EventPoint[]>> => {
      return this.fetch<EventPoint[]>('events', { includeRelations: true, limit });
    },
  };

  // ==================== Quiz Methods ====================

  public quizzes = {
    /**
     * Fetch quizzes with optional filtering
     */
    list: async (params?: Omit<QuizQueryParams, 'resource'>): Promise<APIResponse<Quiz[]>> => {
      return this.fetch<Quiz[]>('quizzes', params);
    },

    /**
     * Fetch active quizzes
     */
    active: async (limit = 100): Promise<APIResponse<Quiz[]>> => {
      return this.fetch<Quiz[]>('quizzes', { isActive: true, limit });
    },

    /**
     * Fetch quizzes with attempts
     */
    withAttempts: async (limit = 100): Promise<APIResponse<Quiz[]>> => {
      return this.fetch<Quiz[]>('quizzes', { includeRelations: true, limit });
    },
  };

  // ==================== Project Methods ====================

  public projects = {
    /**
     * Fetch published projects
     */
    list: async (params?: Omit<BaseQueryParams, 'resource'>): Promise<APIResponse<PublishedProject[]>> => {
      return this.fetch<PublishedProject[]>('projects', params);
    },

    /**
     * Fetch projects with publisher info
     */
    withPublisher: async (limit = 100): Promise<APIResponse<PublishedProject[]>> => {
      return this.fetch<PublishedProject[]>('projects', { includeRelations: true, limit });
    },
  };

  // ==================== Project Review Methods ====================

  public reviews = {
    /**
     * Fetch project reviews with optional filtering
     */
    list: async (params?: Omit<ReviewQueryParams, 'resource'>): Promise<APIResponse<ProjectReview[]>> => {
      return this.fetch<ProjectReview[]>('reviews', params);
    },

    /**
     * Fetch pending reviews
     */
    pending: async (limit = 100): Promise<APIResponse<ProjectReview[]>> => {
      return this.fetch<ProjectReview[]>('reviews', { status: 'pending', limit });
    },

    /**
     * Fetch reviews by type
     */
    byType: async (type: string, limit = 100): Promise<APIResponse<ProjectReview[]>> => {
      return this.fetch<ProjectReview[]>('reviews', { reviewType: type, limit });
    },
  };

  // ==================== Resource Methods ====================

  public resources = {
    /**
     * Fetch resource folders
     */
    list: async (params?: Omit<BaseQueryParams, 'resource'>): Promise<APIResponse<ResourceFolder[]>> => {
      return this.fetch<ResourceFolder[]>('resources', params);
    },

    /**
     * Fetch resources with items
     */
    withItems: async (limit = 100): Promise<APIResponse<ResourceFolder[]>> => {
      return this.fetch<ResourceFolder[]>('resources', { includeRelations: true, limit });
    },
  };

  // ==================== Support Ticket Methods ====================

  public support = {
    /**
     * Fetch support tickets with optional filtering
     */
    list: async (params?: Omit<SupportQueryParams, 'resource'>): Promise<APIResponse<SupportTicket[]>> => {
      return this.fetch<SupportTicket[]>('support', params);
    },

    /**
     * Fetch open tickets
     */
    open: async (limit = 100): Promise<APIResponse<SupportTicket[]>> => {
      return this.fetch<SupportTicket[]>('support', { status: 'OPEN', limit });
    },

    /**
     * Fetch tickets by priority
     */
    byPriority: async (priority: string, limit = 100): Promise<APIResponse<SupportTicket[]>> => {
      return this.fetch<SupportTicket[]>('support', { priority, limit });
    },

    /**
     * Fetch tickets with responses
     */
    withResponses: async (limit = 100): Promise<APIResponse<SupportTicket[]>> => {
      return this.fetch<SupportTicket[]>('support', { includeRelations: true, limit });
    },
  };

  // ==================== All Data Method ====================

  /**
   * Fetch summary of all resources
   */
  public async all(): Promise<APIResponse<AllDataSummary>> {
    return this.fetch<AllDataSummary>('all');
  }

  // ==================== Pagination Helper ====================

  /**
   * Fetch all pages of a resource
   * @warning This can take a long time and may hit rate limits for large datasets
   */
  public async fetchAll<T>(
    resource: string,
    params: Record<string, any> = {},
    maxPages = 100
  ): Promise<T[]> {
    const allData: T[] = [];
    let offset = 0;
    const limit = params.limit || 100;
    let currentPage = 0;

    while (currentPage < maxPages) {
      const response = await this.fetch<T[]>(resource, {
        ...params,
        limit,
        offset,
      });

      allData.push(...response.data);

      if (!response.metadata.hasMore) {
        break;
      }

      offset += limit;
      currentPage++;
    }

    return allData;
  }
}

/**
 * Custom error class for External API errors
 */
export class ExternalAPIError extends Error {
  public code: string;
  public statusCode: number;
  public details?: APIError;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: APIError
  ) {
    super(message);
    this.name = 'ExternalAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExternalAPIError);
    }
  }

  /**
   * Check if error is a rate limit error
   */
  public isRateLimitError(): boolean {
    return this.code === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * Check if error is an authentication error
   */
  public isAuthError(): boolean {
    return this.code === 'AUTH_FAILED';
  }

  /**
   * Get retry after time for rate limit errors
   */
  public getRetryAfter(): string | undefined {
    return this.details?.resetTime;
  }
}

/**
 * Factory function to create a new client instance
 */
export function createExternalAPIClient(config: ExternalAPIConfig): ExternalAPIClient {
  return new ExternalAPIClient(config);
}

// Export types for convenience
export * from './external-api-types';
