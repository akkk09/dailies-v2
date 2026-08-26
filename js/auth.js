const Auth = {
    user: null,

    init: async function() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            this.user = session.user;
            document.getElementById('auth-overlay').style.display = 'none';
            // Load state from cloud
            const cloudState = await this.loadFromCloud();
            if (cloudState) {
                // Merge cloud state into global state
                Object.assign(state, cloudState);
                
                // Ensure critical number fields are valid numbers
                state.xp = Number(state.xp) || 0;
                state.level = Number(state.level) || 1;
                state.carrots = Number(state.carrots) || 0;
                state.streak = Number(state.streak) || 0;
                
                // Fix date overrides
                state.today = new Date().toLocaleDateString('en-CA'); // e.g. YYYY-MM-DD
            }
            if (window.appInit) window.appInit();
        } else {
            document.getElementById('auth-overlay').style.display = 'flex';
        }

        this.setupListeners();
        
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            if (session) {
                this.user = session.user;
                document.getElementById('auth-overlay').style.display = 'none';
                
                // Only reload if this was an active manual login, not just a token refresh
                if (_event === 'SIGNED_IN' && this.isManualLogin) {
                    window.location.reload();
                }
            } else {
                this.user = null;
                document.getElementById('auth-overlay').style.display = 'flex';
            }
        });
    },

    setupListeners: function() {
        const form = document.getElementById('auth-form');
        const loginBtn = document.getElementById('auth-login-btn');
        const signupBtn = document.getElementById('auth-signup-btn');
        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');
        const errorDiv = document.getElementById('auth-error');
        const loadingDiv = document.getElementById('auth-loading');

        const handleError = (error) => {
            if (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                loadingDiv.style.display = 'none';
                return true;
            }
            errorDiv.style.display = 'none';
            return false;
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            Auth.isManualLogin = true;
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });
            
            if (!handleError(error)) {
                loadingDiv.style.display = 'none';
            }
        });

        signupBtn.addEventListener('click', async () => {
            loadingDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!email || !password) {
                handleError({ message: 'Email and password required for signup.' });
                return;
            }

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
            });
            
            if (!handleError(error)) {
                loadingDiv.style.display = 'none';
                alert('Signup successful! You can now log in.');
            }
        });
    },

    loadFromCloud: async function() {
        if (!this.user) return null;
        
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('state')
                .eq('id', this.user.id)
                .single();
                
            if (error && error.code !== 'PGRST116') { // PGRST116 means 0 rows
                console.error('Error fetching state:', error);
                return null;
            }
            
            if (data && data.state) {
                return data.state;
            }
        } catch (e) {
            console.error('Catch error fetching state:', e);
        }
        return null;
    },

    saveToCloud: async function(stateObj) {
        if (!this.user) return;
        
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: this.user.id,
                    state: stateObj,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
            if (error) {
                console.error('Error saving state:', error);
            }
        } catch (e) {
            console.error('Catch error saving state:', e);
        }
    },
    
    logout: async function() {
        await supabaseClient.auth.signOut();
        window.location.reload();
    }
};

window.addEventListener('DOMContentLoaded', () => Auth.init());
