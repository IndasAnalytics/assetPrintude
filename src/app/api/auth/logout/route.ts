import { NextResponse } from "next/server";

/**
 * Logout endpoint for Bearer token authentication
 * Since tokens are stateless and stored client-side,
 * this endpoint just confirms the logout action
 */
export async function POST() {
  // With Bearer tokens, logout is handled client-side by removing the token
  // This endpoint is kept for compatibility and can be used for logging/analytics
  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
