// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance
export const prisma = new PrismaClient();
