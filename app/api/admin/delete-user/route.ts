import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for auth operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(`Deleting user: ${userId}`);

    // 1. Delete related records first (in order of dependencies)
    
    // Delete simulations where user is participant1 or participant2
    const { error: simError1 } = await supabaseAdmin
      .from('simulations')
      .delete()
      .eq('participant1', userId);
    
    const { error: simError2 } = await supabaseAdmin
      .from('simulations')
      .delete()
      .eq('participant2', userId);

    if (simError1 || simError2) {
      console.error("Error deleting simulations:", simError1 || simError2);
    }

    // Delete connections where user is user_a or user_b
    const { error: connError1 } = await supabaseAdmin
      .from('connections')
      .delete()
      .eq('user_a_id', userId);
    
    const { error: connError2 } = await supabaseAdmin
      .from('connections')
      .delete()
      .eq('user_b_id', userId);

    if (connError1 || connError2) {
      console.error("Error deleting connections:", connError1 || connError2);
    }

    // Delete documents
    const { error: docError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('user_id', userId);

    if (docError) {
      console.error("Error deleting documents:", docError);
    }

    // 2. Delete from users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      throw new Error(`Failed to delete user record: ${userError.message}`);
    }

    // 3. Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    console.log(`Successfully deleted user: ${userId}`);
    return NextResponse.json({ success: true, message: `User ${userId} deleted successfully` });

  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to delete user" 
    }, { status: 500 });
  }
}
