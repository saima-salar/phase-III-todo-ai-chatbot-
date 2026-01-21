// frontend/lib/better-auth-client.ts
// Temporarily replace Better Auth with direct backend API calls
// since Better Auth is having database initialization issues

interface Session {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt?: string;
  };
  token: string;
}

class DirectAuthClient {
  async getSession(): Promise<Session | null> {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      return null;
    }

    try {
      // Parse user data
      const user = JSON.parse(userData);

      // Verify token by making a request to the backend
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const backendUser = await response.json();
        return {
          user: {
            id: backendUser.id.toString(),
            email: backendUser.email,
            firstName: backendUser.first_name,
            lastName: backendUser.last_name,
            createdAt: backendUser.created_at,
            updatedAt: backendUser.updated_at
          },
          token: token
        };
      } else {
        // Token is invalid, clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return null;
      }
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  signIn = {
    email: async ({ email, password, callbackURL }: { email: string; password: string; callbackURL: string }) => {
      try {
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          // Store the token and user info
          localStorage.setItem('auth_token', result.access_token);

          // Get user details to store
          const userResponse = await fetch('http://localhost:8000/api/user', {
            headers: {
              'Authorization': `Bearer ${result.access_token}`
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem('user_data', JSON.stringify({
              id: userData.id.toString(),
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at
            }));
          }

          // Simulate Better Auth response format
          return {
            session: {
              user: {
                id: userData?.id || 'unknown',
                email,
                firstName: userData?.firstName || userData?.first_name,
                lastName: userData?.lastName || userData?.last_name,
                createdAt: userData?.createdAt || userData?.created_at || new Date().toISOString(),
                updatedAt: userData?.updatedAt || userData?.updated_at
              },
              token: result.access_token
            }
          };
        } else {
          throw new Error(result.detail || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
  };

  signUp = {
    email: async ({ email, password, firstName, lastName, callbackURL }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      callbackURL: string
    }) => {
      try {
        const response = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Now log the user in to get a token
          const loginResponse = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const loginResult = await loginResponse.json();

          if (loginResponse.ok) {
            // Store the token and user info
            localStorage.setItem('auth_token', loginResult.access_token);

            // Store user data
            localStorage.setItem('user_data', JSON.stringify({
              id: result.id.toString(),
              email: result.email,
              firstName: result.first_name,
              lastName: result.last_name,
              createdAt: result.created_at,
              updatedAt: result.updated_at
            }));

            // Simulate Better Auth response format
            return {
              session: {
                user: {
                  id: result.id?.toString(),
                  email: result.email,
                  firstName: result.first_name,
                  lastName: result.last_name,
                  createdAt: result.created_at,
                  updatedAt: result.updated_at
                },
                token: loginResult.access_token
              }
            };
          } else {
            throw new Error('Login after registration failed');
          }
        } else {
          throw new Error(result.detail || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    }
  };

  signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };
}

export const authClient = new DirectAuthClient() as any;

// Export the client and types
export type { Session };