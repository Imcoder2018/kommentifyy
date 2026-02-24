import { hashPassword, comparePassword } from './auth';
import { prisma } from '@/lib/prisma';

// #21: User interface now matches Prisma schema field names (monthly* instead of daily*)
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  plan: {
    id: string;
    name: string;
    price: number;
    monthlyComments: number;
    monthlyLikes: number;
    monthlyShares: number;
    monthlyFollows: number;
    monthlyConnections: number;
    aiPostsPerMonth: number;
    aiCommentsPerMonth: number;
    aiTopicLinesPerMonth: number;
    allowAiPostGeneration: boolean;
    allowAiCommentGeneration: boolean;
    allowAiTopicLines: boolean;
    allowPostScheduling: boolean;
    allowAutomation: boolean;
    allowAutomationScheduling: boolean;
    allowNetworking: boolean;
    allowNetworkScheduling: boolean;
    allowCsvExport: boolean;
    allowImportProfiles: boolean;
    monthlyImportCredits: number;
  } | null;
}

// #24: User without password — for API responses
export type UserWithoutPassword = Omit<User, 'password'>;

export class UserService {

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    try {
      const dbUsers = await prisma.user.findMany({
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
      // #24: Strip passwords before returning
      return dbUsers.map(({ password, ...user }) => user) as unknown as UserWithoutPassword[];
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error finding user by email:', error);
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
    // #23: Replace deprecated substr() with substring()
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    try {
      // First, check if there's a trial plan available
      const trialPlan = await prisma.plan.findFirst({
        where: { isTrialPlan: true }
      });

      let planData: any;
      let trialEndsAt: Date | null = null;

      if (trialPlan) {
        // Assign trial plan with expiry date
        trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialPlan.trialDurationDays);

        planData = {
          connect: { id: trialPlan.id }
        };
      } else {
        // Fallback to Free plan if no trial plan exists
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

      return dbUser as unknown as User;
    } catch (error) {
      console.error('Database error during user creation:', error);
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
