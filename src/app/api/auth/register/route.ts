// src/app/api/auth/register/route.ts
// CostLens AI — User Registration

import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, organizationName } = body;

    // Validation
    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { success: false, error: "All fields are required: email, password, name, organizationName" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            + "-" + Date.now().toString(36),
          plan: "FREE",
        },
      });

      // Create user as owner
      const user = await tx.user.create({
        data: {
          email,
          name,
          hashedPassword,
          role: "OWNER",
          organizationId: org.id,
        },
      });

      // Create default teams
      const defaultTeams = [
        { name: "Engineering", color: "#00D4AA" },
        { name: "Marketing", color: "#4BA3F5" },
        { name: "Sales", color: "#B68AE8" },
        { name: "Support", color: "#F0A868" },
      ];

      await tx.team.createMany({
        data: defaultTeams.map((t) => ({
          name: t.name,
          color: t.color,
          organizationId: org.id,
        })),
      });

      return { user, org };
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        organizationId: result.org.id,
        message: "Account created successfully. You can now sign in.",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
