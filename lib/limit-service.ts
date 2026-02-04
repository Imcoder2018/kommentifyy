import { prisma } from '@/lib/prisma';

export type LimitType =
    | 'comments'
    | 'likes'
    | 'shares'
    | 'follows'
    | 'connections'
    | 'aiPosts'
    | 'aiComments'
    | 'aiTopicLines'
    | 'importProfiles';

export class LimitService {

    /**
     * Get start of current month for monthly tracking
     */
    private getMonthStart(): Date {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    /**
     * Get today's date at midnight for daily record tracking
     */
    private getToday(): Date {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    /**
     * Check if a user has reached their MONTHLY limit for a specific action
     */
    async checkLimit(userId: string, type: LimitType): Promise<{ allowed: boolean; limit: number; usage: number }> {
        try {
            // Get user's plan
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { plan: true }
            });

            if (!user || !user.plan) {
                // Default strict limits if no plan found
                return { allowed: false, limit: 0, usage: 0 };
            }

            // Determine limit based on plan (MONTHLY limits)
            let limit = 0;
            const plan = user.plan as any;
            switch (type) {
                case 'comments': limit = plan.monthlyComments; break;
                case 'likes': limit = plan.monthlyLikes; break;
                case 'shares': limit = plan.monthlyShares; break;
                case 'follows': limit = plan.monthlyFollows; break;
                case 'connections': limit = plan.monthlyConnections; break;
                case 'aiPosts': limit = plan.aiPostsPerMonth; break;
                case 'aiComments': limit = plan.aiCommentsPerMonth; break;
                case 'aiTopicLines': limit = plan.aiTopicLinesPerMonth; break;
                case 'importProfiles': limit = plan.monthlyImportCredits; break;
            }

            // Get MONTHLY usage (aggregate all daily records for current month)
            const monthStart = this.getMonthStart();
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            // Sum up all usage for the month
            const usage = usageRecords.reduce((sum, record) => {
                return sum + ((record as any)[type] || 0);
            }, 0);

            return {
                allowed: usage < limit,
                limit,
                usage
            };

        } catch (error) {
            console.error('Error checking limit:', error);
            return { allowed: false, limit: 0, usage: 0 };
        }
    }

    /**
     * Increment usage for a specific action (stores in daily record, but limits are monthly)
     */
    async incrementUsage(userId: string, type: LimitType, amount: number = 1): Promise<void> {
        try {
            const today = this.getToday();

            await prisma.apiUsage.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today
                    }
                },
                update: {
                    [type]: { increment: amount }
                },
                create: {
                    userId,
                    date: today,
                    [type]: amount
                }
            });
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    }

    /**
     * Get current MONTHLY usage stats for a user
     */
    async getUsageStats(userId: string) {
        try {
            const monthStart = this.getMonthStart();

            // Get all usage records for current month
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            // Aggregate monthly usage
            const monthlyUsage = {
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0,
                connections: 0,
                importProfiles: 0,
                aiPosts: 0,
                aiComments: 0,
                bonusAiComments: 0,
                aiTopicLines: 0
            };

            usageRecords.forEach((record: any) => {
                monthlyUsage.comments += record.comments || 0;
                monthlyUsage.likes += record.likes || 0;
                monthlyUsage.shares += record.shares || 0;
                monthlyUsage.follows += record.follows || 0;
                monthlyUsage.connections += record.connections || 0;
                monthlyUsage.importProfiles += record.importProfiles || 0;
                monthlyUsage.aiPosts += record.aiPosts || 0;
                monthlyUsage.aiComments += record.aiComments || 0;
                monthlyUsage.bonusAiComments += record.bonusAiComments || 0;
                monthlyUsage.aiTopicLines += record.aiTopicLines || 0;
            });

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { plan: true }
            });

            return {
                usage: monthlyUsage,
                limits: user?.plan || {}
            };
        } catch (error) {
            console.error('Error getting usage stats:', error);
            return null;
        }
    }

    /**
     * Get monthly usage for admin display (for a specific user)
     */
    async getMonthlyUsageForUser(userId: string) {
        try {
            const monthStart = this.getMonthStart();

            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId,
                    date: {
                        gte: monthStart
                    }
                }
            });

            const monthlyUsage = {
                comments: 0,
                likes: 0,
                shares: 0,
                follows: 0,
                connections: 0,
                importProfiles: 0,
                aiPosts: 0,
                aiComments: 0,
                bonusAiComments: 0,
                aiTopicLines: 0
            };

            usageRecords.forEach((record: any) => {
                monthlyUsage.comments += record.comments || 0;
                monthlyUsage.likes += record.likes || 0;
                monthlyUsage.shares += record.shares || 0;
                monthlyUsage.follows += record.follows || 0;
                monthlyUsage.connections += record.connections || 0;
                monthlyUsage.importProfiles += record.importProfiles || 0;
                monthlyUsage.aiPosts += record.aiPosts || 0;
                monthlyUsage.aiComments += record.aiComments || 0;
                monthlyUsage.bonusAiComments += record.bonusAiComments || 0;
                monthlyUsage.aiTopicLines += record.aiTopicLines || 0;
            });

            return monthlyUsage;
        } catch (error) {
            console.error('Error getting monthly usage for user:', error);
            return null;
        }
    }

    /**
     * Get monthly usage for multiple users at once (optimized for admin)
     * Returns a Map of userId -> usage data
     */
    async getMonthlyUsageForUsers(userIds: string[]): Promise<Map<string, any>> {
        const usageMap = new Map<string, any>();
        
        if (userIds.length === 0) {
            return usageMap;
        }

        try {
            const monthStart = this.getMonthStart();

            // Single query to get all usage records for all users
            const usageRecords = await prisma.apiUsage.findMany({
                where: {
                    userId: { in: userIds },
                    date: { gte: monthStart }
                }
            });

            // Initialize empty usage for all users
            userIds.forEach(userId => {
                usageMap.set(userId, {
                    comments: 0,
                    likes: 0,
                    shares: 0,
                    follows: 0,
                    connections: 0,
                    importProfiles: 0,
                    aiPosts: 0,
                    aiComments: 0,
                    bonusAiComments: 0,
                    aiTopicLines: 0
                });
            });

            // Aggregate usage by user
            usageRecords.forEach((record: any) => {
                const existing = usageMap.get(record.userId);
                if (existing) {
                    existing.comments += record.comments || 0;
                    existing.likes += record.likes || 0;
                    existing.shares += record.shares || 0;
                    existing.follows += record.follows || 0;
                    existing.connections += record.connections || 0;
                    existing.importProfiles += record.importProfiles || 0;
                    existing.aiPosts += record.aiPosts || 0;
                    existing.aiComments += record.aiComments || 0;
                    existing.bonusAiComments += record.bonusAiComments || 0;
                    existing.aiTopicLines += record.aiTopicLines || 0;
                }
            });

            return usageMap;
        } catch (error) {
            console.error('Error getting monthly usage for users:', error);
            return usageMap;
        }
    }
}

export const limitService = new LimitService();
