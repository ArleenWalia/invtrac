import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// Declare Deno global for TypeScript
declare const Deno: any;

const app = new Hono();

// Initialize Supabase admin client (for all operations including user validation)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b468c741/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-b468c741/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Get user data endpoint (requires authentication)
app.get("/make-server-b468c741/user-data", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log(`No access token provided in request`);
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    console.log(`Attempting to authenticate user with token: ${accessToken.substring(0, 20)}...`);
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log(`Authorization error while fetching user data: ${error.message}, code: ${error.status}`);
      return c.json({ error: `Unauthorized: ${error.message}` }, 401);
    }
    
    if (!user?.id) {
      console.log(`No user ID found after authentication`);
      return c.json({ error: "Unauthorized - invalid user" }, 401);
    }

    console.log(`User authenticated successfully: ${user.id}, email: ${user.email}`);

    // Get user's categories and items from KV store
    const userDataKey = `user_data:${user.id}`;
    console.log(`Looking up data with key: ${userDataKey}`);
    const userData = await kv.get(userDataKey);
    console.log(`Found user data:`, userData ? `${Object.keys(userData).length} keys` : 'null');

    return c.json({
      categories: userData?.categories || [],
      items: userData?.items || []
    });
  } catch (error) {
    console.log(`Error fetching user data: ${error}`);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// Save user data endpoint (requires authentication)
app.post("/make-server-b468c741/user-data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized - no token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      console.log(`Authorization error while saving user data: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log(`Saving data for user: ${user.id}, email: ${user.email}`);

    const { categories, items } = await c.req.json();
    
    console.log(`Saving ${categories?.length || 0} categories and ${items?.length || 0} items`);
    
    // Save user's data to KV store
    const userDataKey = `user_data:${user.id}`;
    await kv.set(userDataKey, { categories, items });
    
    console.log(`Successfully saved data with key: ${userDataKey}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving user data: ${error}`);
    return c.json({ error: "Failed to save user data" }, 500);
  }
});

Deno.serve(app.fetch);