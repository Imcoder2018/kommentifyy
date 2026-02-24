import { hashPassword, comparePassword } from './auth';
import { prisma } from '@/lib/prisma';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  plan: {
    id: string;
    name: string;
    price: number;
    dailyComments: number;
    dailyLikes: number;
    dailyShares: number;
    dailyFollows: number;
    dailyConnections: number;
    aiPostsPerDay: number;
    aiCommentsPerDay: number;
    allowAiPostGeneration: boolean;
    allowAiCommentGeneration: boolean;
    allowPostScheduling: boolean;
    allowAutomation: boolean;
    allowAutomationScheduling: boolean;
    allowNetworking: boolean;
    allowNetworkScheduling: boolean;
    allowCsvExport: boolean;
  } | null;
}

export class UserService {

  async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from database...');
      const dbUsers = await prisma.user.findMany({
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
      console.log(`📊 Found ${dbUsers.length} users in database`);
      return dbUsers as unknown as User[];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Return empty array instead of fallback to avoid confusion
      return [];
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { plan: true },
      });
      return user as unknown as User;
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  async createUser(
    email: string, 
    password: string, 
    name: string, 
    options?: { referralCode?: string; referredById?: string | null }
  ): Promise<User> {
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // First, check if there's a trial plan available
      const trialPlan = await prisma.plan.findFirst({
        where: { isTrialPlan: true }
      });

      let planData: any;
      let trialEndsAt: Date | null = null;

      if (trialPlan) {
        // Assign trial plan with expiry date
        console.log(`✨ Assigning ${trialPlan.trialDurationDays}-day trial plan to new user`);
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);
        
        planData = {
          connect: { id: trialPlan.id }
        };
      } else {
        // Fallback to Free plan if no trial plan exists
        console.log('⚠️ No trial plan found, using Free plan');
        planData = {
          connectOrCreate: {
            where: { name: 'Free' },
            create: {
              name: 'Free',
              price: 0,
              isDefaultFreePlan: true,
              monthlyComments: 300,
              monthlyLikes: 600,
              monthlyShares: 150,
              monthlyFollows: 300,
              monthlyConnections: 150,
              aiPostsPerMonth: 60,
              aiCommentsPerMonth: 300,
              aiTopicLinesPerMonth: 60,
              monthlyImportCredits: 50,
              allowAiTopicLines: true,
              allowAiPostGeneration: true,
              allowAiCommentGeneration: true,
              allowPostScheduling: false,
              allowAutomation: true,
              allowAutomationScheduling: false,
              allowNetworking: false,
              allowNetworkScheduling: false,
              allowCsvExport: false,
              allowImportProfiles: false,
            } as any
          }
        };
      }

      const dbUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          password: hashedPassword,
          trialEndsAt,
          plan: planData,
          referralCode: options?.referralCode,
          referredById: options?.referredById
        } as any,
        include: { plan: true },
      });
      
      console.log(`✅ User created: ${dbUser.email} | Plan: ${dbUser.plan?.name} | Trial ends: ${trialEndsAt ? trialEndsAt.toISOString() : 'N/A'}`);
      return dbUser as unknown as User;
    } catch (error) {
      console.error('❌ Database error during user creation:', error);
      throw new Error('Failed to create user in database: ' + (error as Error).message);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return null;

    return user;
  }
}

export const userService = new UserService();
