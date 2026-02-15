import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';


export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Try database first (supports credential updates via admin panel)
                try {
                    const { data: user } = await supabase
                        .from('admin_users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single();

                    if (user) {
                        // Check bcrypt-hashed password
                        let isValidPassword = false;
                        try {
                            isValidPassword = await bcrypt.compare(
                                credentials.password,
                                user.password_hash
                            );
                        } catch {
                            // If hash format is invalid, check plain-text (initial setup)
                            isValidPassword = credentials.password === user.password_hash;
                        }

                        if (isValidPassword) {
                            return {
                                id: user.id,
                                email: user.email,
                                name: user.name || 'Admin User',
                            };
                        }
                        // Password didn't match DB user
                        return null;
                    }
                } catch (error) {
                    console.error('DB Auth Error:', error);
                }

                // Fallback: Hardcoded admin for initial setup / demo only
                if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
                    return {
                        id: 'admin-user-id',
                        email: 'admin@example.com',
                        name: 'Admin User',
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: '/admin/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                // session.user.id = token.id; // needs type augmentation to work perfectly, but okay for basics
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
