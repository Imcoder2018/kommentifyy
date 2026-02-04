import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { userService } from '@/lib/user-service';
import { limitService } from '@/lib/limit-service';

// Get all users (admin only)
async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    // Get all users from UserService (includes both database and in-memory users)
    let allUsers = await userService.getAllUsers();

    // Apply search filter if provided
    if (search) {
      allUsers = allUsers.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const total = allUsers.length;
    const skip = (page - 1) * limit;
    const users = allUsers.slice(skip, skip + limit);

    // Get MONTHLY usage for all users in a single batch query (optimized)
    const userIds = users.map(u => u.id);
    const usageMap = await limitService.getMonthlyUsageForUsers(userIds);

    // Map users with their usage data
    const usersWithUsage = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      const monthlyUsage = usageMap.get(user.id) || {
        comments: 0,
        likes: 0,
        shares: 0,
        follows: 0,
        connections: 0,
        importProfiles: 0,
        aiPosts: 0,
        aiComments: 0,
        aiTopicLines: 0,
      };
      
      return {
        ...userWithoutPassword,
        status: 'active',
        paymentStatus: user.plan?.name === 'Free' ? 'free' : 'paid',
        monthlyUsage,
      };
    });

    return NextResponse.json({
      success: true,
      users: usersWithUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.log('UserService error, using fallback users:', error);
    
    // Fallback users data when everything fails
    const fallbackUsers = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: '2024-01-15T10:30:00.000Z',
        plan: { id: 'plan-2', name: 'Pro', price: 29.99 },
        paymentStatus: 'paid'
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'active',
        createdAt: '2024-02-20T15:45:00.000Z',
        plan: { id: 'plan-1', name: 'Free', price: 0 },
        paymentStatus: 'free'
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        status: 'inactive',
        createdAt: '2024-03-10T09:15:00.000Z',
        plan: { id: 'plan-3', name: 'Enterprise', price: 99.99 },
        paymentStatus: 'pending'
      }
    ];

    return NextResponse.json({
      success: true,
      users: fallbackUsers,
      fallback: true,
      pagination: {
        page: 1,
        limit: fallbackUsers.length,
        total: fallbackUsers.length,
        totalPages: 1,
      },
    });
  }
}

export const GET = requireAdmin(handleGet);
