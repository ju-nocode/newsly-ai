// ================================================
// NEWSLY AI - USER INTELLIGENCE SYSTEM
// ================================================
// Système centralisé pour gérer toute la personnalisation utilisateur

/**
 * User Intelligence Manager
 * Gère toutes les interactions avec les tables de personnalisation
 */
class UserIntelligenceSystem {
    constructor() {
        this.supabase = window.supabase;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.cache = {
            profile: null,
            settings: null,
            feedPrefs: null,
            searchPrefs: null,
            timestamp: 0,
            duration: 60000 // 1 minute cache
        };
    }

    /**
     * Initialize the system
     */
    async init() {
        console.log('🚀 User Intelligence System initializing...');
        await this.checkAuth();
        console.log('🔐 Authentication check complete:', this.isAuthenticated);
        if (this.isAuthenticated) {
            console.log('👤 User:', this.currentUser?.email);
            await this.ensureUserTables();
            console.log('✅ User tables ensured');
        } else {
            console.log('⚠️ User not authenticated');
        }
        console.log('✅ User Intelligence System initialized');
    }

    /**
     * Check authentication status
     */
    async checkAuth() {
        if (!this.supabase) {
            this.isAuthenticated = false;
            return false;
        }

        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            this.isAuthenticated = !!user && !error;
            this.currentUser = user;
            return this.isAuthenticated;
        } catch (e) {
            this.isAuthenticated = false;
            return false;
        }
    }

    /**
     * Ensure all user tables are initialized
     */
    async ensureUserTables() {
        if (!this.isAuthenticated) return;

        try {
            console.log('🔧 Calling initialize_user_preferences RPC for user:', this.currentUser.id);
            const { data, error } = await this.supabase.rpc('initialize_user_preferences', {
                p_user_id: this.currentUser.id
            });

            if (error) {
                console.error('❌ Error from RPC initialize_user_preferences:', error);
            } else {
                console.log('✅ RPC initialize_user_preferences completed:', data);
            }
        } catch (e) {
            console.error('❌ Exception initializing user tables:', e);
        }
    }

    // ================================================
    // USER SETTINGS
    // ================================================

    /**
     * Get user settings
     */
    async getSettings() {
        if (!this.isAuthenticated) {
            return this.getDefaultSettings();
        }

        // Check cache
        if (this.cache.settings && (Date.now() - this.cache.timestamp) < this.cache.duration) {
            return this.cache.settings;
        }

        try {
            const { data, error } = await this.supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error || !data) {
                return this.getDefaultSettings();
            }

            this.cache.settings = data;
            this.cache.timestamp = Date.now();
            return data;
        } catch (e) {
            console.error('Error loading settings:', e);
            return this.getDefaultSettings();
        }
    }

    /**
     * Update user settings
     */
    async updateSettings(settings) {
        if (!this.isAuthenticated) return false;

        try {
            const { error } = await this.supabase
                .from('user_settings')
                .upsert({
                    user_id: this.currentUser.id,
                    ...settings
                }, { onConflict: 'user_id' });

            if (!error) {
                this.cache.settings = null; // Invalidate cache
            }

            return !error;
        } catch (e) {
            console.error('Error updating settings:', e);
            return false;
        }
    }

    getDefaultSettings() {
        return {
            theme: 'dark',
            language: 'fr',
            email_notifications: true,
            push_notifications: false,
            newsletter_frequency: 'weekly',
            articles_per_page: 20,
            compact_view: false,
            show_images: true,
            timezone: 'Europe/Paris'
        };
    }

    // ================================================
    // FEED PREFERENCES
    // ================================================

    /**
     * Get feed preferences
     */
    async getFeedPreferences() {
        if (!this.isAuthenticated) {
            return this.getDefaultFeedPreferences();
        }

        if (this.cache.feedPrefs && (Date.now() - this.cache.timestamp) < this.cache.duration) {
            return this.cache.feedPrefs;
        }

        try {
            const { data, error } = await this.supabase
                .from('user_feed_preferences')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error || !data) {
                return this.getDefaultFeedPreferences();
            }

            this.cache.feedPrefs = data;
            this.cache.timestamp = Date.now();
            return data;
        } catch (e) {
            console.error('Error loading feed preferences:', e);
            return this.getDefaultFeedPreferences();
        }
    }

    /**
     * Follow a category
     */
    async followCategory(category) {
        if (!this.isAuthenticated) return false;

        try {
            const prefs = await this.getFeedPreferences();
            const categories = prefs.followed_categories || [];

            if (!categories.includes(category)) {
                categories.push(category);

                const { error } = await this.supabase
                    .from('user_feed_preferences')
                    .upsert({
                        user_id: this.currentUser.id,
                        followed_categories: categories
                    }, { onConflict: 'user_id' });

                if (!error) {
                    this.cache.feedPrefs = null; // Invalidate cache
                }

                return !error;
            }

            return true;
        } catch (e) {
            console.error('Error following category:', e);
            return false;
        }
    }

    /**
     * Unfollow a category
     */
    async unfollowCategory(category) {
        if (!this.isAuthenticated) return false;

        try {
            const prefs = await this.getFeedPreferences();
            const categories = (prefs.followed_categories || []).filter(c => c !== category);

            const { error } = await this.supabase
                .from('user_feed_preferences')
                .upsert({
                    user_id: this.currentUser.id,
                    followed_categories: categories
                }, { onConflict: 'user_id' });

            if (!error) {
                this.cache.feedPrefs = null; // Invalidate cache
            }

            return !error;
        } catch (e) {
            console.error('Error unfollowing category:', e);
            return false;
        }
    }

    getDefaultFeedPreferences() {
        return {
            followed_categories: ['general'],
            followed_sources: [],
            blocked_sources: [],
            interest_keywords: [],
            blocked_keywords: [],
            preferred_countries: [],
            excluded_countries: [],
            default_sort: 'relevance',
            max_article_age_hours: 48
        };
    }

    // ================================================
    // READING HISTORY & ANALYTICS
    // ================================================

    /**
     * Track article opened
     */
    async trackArticleOpened(articleData) {
        if (!this.isAuthenticated) return;

        try {
            await this.supabase
                .from('user_reading_history')
                .insert({
                    user_id: this.currentUser.id,
                    article_id: articleData.id || this.hashUrl(articleData.url),
                    article_url: articleData.url,
                    article_title: articleData.title,
                    article_category: articleData.category,
                    article_source: articleData.source,
                    device_type: this.getDeviceType()
                });
        } catch (e) {
            console.error('Error tracking article:', e);
        }
    }

    /**
     * Update reading progress
     */
    async updateReadingProgress(articleId, duration, scrollDepth, completed = false) {
        if (!this.isAuthenticated) return;

        try {
            await this.supabase
                .from('user_reading_history')
                .update({
                    read_duration_seconds: duration,
                    scroll_depth_percent: scrollDepth,
                    completed: completed
                })
                .eq('user_id', this.currentUser.id)
                .eq('article_id', articleId);
        } catch (e) {
            console.error('Error updating reading progress:', e);
        }
    }

    /**
     * Get recommended categories based on reading history
     */
    async getRecommendedCategories(limit = 5) {
        if (!this.isAuthenticated) return [];

        try {
            const { data, error } = await this.supabase
                .rpc('get_recommended_categories', {
                    p_user_id: this.currentUser.id,
                    p_limit: limit
                });

            if (error) return [];
            return data || [];
        } catch (e) {
            console.error('Error getting recommended categories:', e);
            return [];
        }
    }

    /**
     * Get recommended sources
     */
    async getRecommendedSources(limit = 5) {
        if (!this.isAuthenticated) return [];

        try {
            const { data, error } = await this.supabase
                .rpc('get_recommended_sources', {
                    p_user_id: this.currentUser.id,
                    p_limit: limit
                });

            if (error) return [];
            return data || [];
        } catch (e) {
            console.error('Error getting recommended sources:', e);
            return [];
        }
    }

    // ================================================
    // BOOKMARKS
    // ================================================

    /**
     * Bookmark an article
     */
    async bookmarkArticle(articleData, folder = 'default', tags = []) {
        if (!this.isAuthenticated) return false;

        try {
            const { error } = await this.supabase
                .from('user_bookmarks')
                .insert({
                    user_id: this.currentUser.id,
                    article_id: articleData.id || this.hashUrl(articleData.url),
                    article_url: articleData.url,
                    article_title: articleData.title,
                    article_category: articleData.category,
                    article_source: articleData.source,
                    article_image_url: articleData.image,
                    article_published_at: articleData.publishedAt,
                    folder: folder,
                    tags: tags
                });

            // Also update reading history
            await this.supabase
                .from('user_reading_history')
                .update({ bookmarked: true })
                .eq('user_id', this.currentUser.id)
                .eq('article_id', articleData.id || this.hashUrl(articleData.url));

            return !error;
        } catch (e) {
            console.error('Error bookmarking article:', e);
            return false;
        }
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(articleId) {
        if (!this.isAuthenticated) return false;

        try {
            const { error } = await this.supabase
                .from('user_bookmarks')
                .delete()
                .eq('user_id', this.currentUser.id)
                .eq('article_id', articleId);

            // Update reading history
            await this.supabase
                .from('user_reading_history')
                .update({ bookmarked: false })
                .eq('user_id', this.currentUser.id)
                .eq('article_id', articleId);

            return !error;
        } catch (e) {
            console.error('Error removing bookmark:', e);
            return false;
        }
    }

    /**
     * Get all bookmarks
     */
    async getBookmarks(folder = null) {
        if (!this.isAuthenticated) return [];

        try {
            let query = this.supabase
                .from('user_bookmarks')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('bookmarked_at', { ascending: false });

            if (folder) {
                query = query.eq('folder', folder);
            }

            const { data, error } = await query;

            if (error) return [];
            return data || [];
        } catch (e) {
            console.error('Error getting bookmarks:', e);
            return [];
        }
    }

    // ================================================
    // ACTIVITY LOGGING
    // ================================================

    /**
     * Log user activity
     */
    async logActivity(activityType, context = {}) {
        if (!this.isAuthenticated) return;

        try {
            await this.supabase
                .from('user_activity_log')
                .insert({
                    user_id: this.currentUser.id,
                    activity_type: activityType,
                    context: context,
                    device_type: this.getDeviceType(),
                    user_agent: navigator.userAgent
                });
        } catch (e) {
            // Silent fail for activity logging
        }
    }

    // ================================================
    // USER PROFILE
    // ================================================

    /**
     * Get complete user profile
     */
    async getUserProfile() {
        if (!this.isAuthenticated) return null;

        try {
            const { data, error } = await this.supabase
                .rpc('get_user_profile', {
                    p_user_id: this.currentUser.id
                });

            if (error) return null;
            return data;
        } catch (e) {
            console.error('Error getting user profile:', e);
            return null;
        }
    }

    // ================================================
    // UTILITIES
    // ================================================

    hashUrl(url) {
        // Simple hash function for article ID
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    invalidateCache() {
        this.cache = {
            profile: null,
            settings: null,
            feedPrefs: null,
            searchPrefs: null,
            timestamp: 0,
            duration: 60000
        };
    }
}

// Export singleton instance
export const userIntelligence = new UserIntelligenceSystem();

// Auto-initialize on import
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        userIntelligence.init();
    });
} else {
    userIntelligence.init();
}
