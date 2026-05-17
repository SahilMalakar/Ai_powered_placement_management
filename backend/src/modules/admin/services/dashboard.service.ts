import { getRedisConnectionForCaching } from '../../../configs/redis.config.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import {
    getDashboardCounts,
    getRecentActivities,
    getBranchDistribution,
} from '../repositories/dashboard.repository.js';

/**
 * Aggregates all dashboard data with Redis caching.
 * TTL: 2 minutes — dashboard data changes moderately often.
 */
export const getDashboardStatsService = async () => {
    const cacheKey = CACHE_KEYS.ADMIN_DASHBOARD_STATS;

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedData = await cacheClient.get(cacheKey);
        if (cachedData) {
            console.log('🚀 Dashboard Stats Cache Hit');
            return JSON.parse(cachedData);
        }

        // Cache Miss — fetch from DB
        console.log('⚡ Dashboard Stats Cache Miss');
        const [counts, activities, branchDistribution] = await Promise.all([
            getDashboardCounts(),
            getRecentActivities(),
            getBranchDistribution(),
        ]);

        // Build unified activity timeline
        const timeline = buildActivityTimeline(
            activities.recentJobs,
            activities.recentApplications
        );

        const result = {
            ...counts,
            recentActivities: timeline,
            branchDistribution,
        };

        // Cache with 2-minute TTL
        await cacheClient.set(cacheKey, JSON.stringify(result), 'EX', 120);

        return result;
    } catch (error) {
        console.error('⚠️ Redis Cache Failure (Dashboard Fallback):', error);

        // FAIL-SAFE: Fallback to Database
        const [counts, activities, branchDistribution] = await Promise.all([
            getDashboardCounts(),
            getRecentActivities(),
            getBranchDistribution(),
        ]);

        const timeline = buildActivityTimeline(
            activities.recentJobs,
            activities.recentApplications
        );

        return {
            ...counts,
            recentActivities: timeline,
            branchDistribution,
        };
    }
};

// ─── Helper: Merge and sort activities into a single timeline ──────

interface ActivityItem {
    type: 'JOB_POSTED' | 'APPLICATION_RECEIVED' | 'STUDENT_SELECTED' | 'STUDENT_SHORTLISTED';
    title: string;
    description: string;
    timestamp: string;
}

function buildActivityTimeline(
    recentJobs: any[],
    recentApplications: any[]
): ActivityItem[] {
    const activities: ActivityItem[] = [];

    for (const job of recentJobs) {
        activities.push({
            type: 'JOB_POSTED',
            title: `${job.title} at ${job.company}`,
            description: `Job posted — Status: ${job.status}`,
            timestamp: job.createdAt.toISOString(),
        });
    }

    for (const app of recentApplications) {
        const studentName = app.user.profile?.fullName ?? app.user.email;
        const jobTitle = `${app.job.title} at ${app.job.company}`;

        if (app.status === 'SELECTED') {
            activities.push({
                type: 'STUDENT_SELECTED',
                title: `${studentName} selected`,
                description: `Selected for ${jobTitle}`,
                timestamp: app.createdAt.toISOString(),
            });
        } else if (app.status === 'SHORTLISTED') {
            activities.push({
                type: 'STUDENT_SHORTLISTED',
                title: `${studentName} shortlisted`,
                description: `Shortlisted for ${jobTitle}`,
                timestamp: app.createdAt.toISOString(),
            });
        } else {
            activities.push({
                type: 'APPLICATION_RECEIVED',
                title: `${studentName} applied`,
                description: `Applied for ${jobTitle}`,
                timestamp: app.createdAt.toISOString(),
            });
        }
    }

    // Sort by most recent first
    activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return top 10
    return activities.slice(0, 10);
}
