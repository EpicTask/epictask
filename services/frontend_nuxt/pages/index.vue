<template>
  <div class="main">
    <v-card>
      <header>
        <h1>Welcome to EpicTask</h1>
        <p>
          A platform to incentivize and teach children money management skills
          through tasks and rewards
        </p>
      </header>
    </v-card>
    <section class="section-container">
      <h2>Get Started Today!</h2>
      <p>
        Sign up or log in to start using EpicTask and empower your children with
        financial literacy.
      </p>
      <div class="login-container">
        <div class="form-container">
          <div class="input-row">
            <input
              class="white-text"
              type="email"
              v-model="email"
              placeholder="Email"
              required
            />
          </div>
          <div class="input-row">
            <input
              class="white-text"
              type="password"
              v-model="password"
              placeholder="Password"
              required
            />
          </div>
          <div class="input-row">
            <button class="cta-button" @click="login">Login</button>
          </div>
          <div class="input-row">
            <v-btn variant="text" @click="forgotPassword">
              Forgot Password
            </v-btn>
          </div>
          <div class="input-row">
            <button class="cta-button" @click="register">
              Create a new account
            </button>
          </div>
          <div class="input-row">
            <button class="cta-button" @click="googleSignIn">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      <div v-if="loginFailed" class="error-message">
        Login failed. Invalid credentials. Please try again.
      </div>
      <div v-if="signUpFailed" class="error-message">Sign up failed.</div>
      <div v-if="invalidEmail" class="error-message">
        Invalid email address.
      </div>
      <div v-if="invalidPassword" class="error-message">
        Password must be at least 6 characters.
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Main",
  data() {
    return {
      email: "",
      password: "",
      loginFailed: false, // New variable to track login failure
      signUpFailed: false, // New variable to track registration failure
      invalidEmail: false, // New variable to track invalid email
      invalidPassword: false, // New variable to track invalid password
    };
  },
  created() {
    try {
      const user_id = this.$fire.auth.currentUser.uid;
      if (user_id) {
        this.$router.push("/parent");
      }
    } catch (e) {}
  },
  methods: {
    async login() {
      const isValidEmail = this.isValidEmail(this.email);
      const isValidPassword = this.isValidPassword(this.password);

      if (isValidEmail && isValidPassword) {
        try {
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString();
          const baseUrl = this.$config.userUrl;

          await this.$axios.post(`${baseUrl}/events`, {
            event_id: "unique-event-id",
            event_type: "userSignIn",
            user_id: "",
            timestamp: formattedDate,
            additional_data: {
              status: "pending",
              timestamp: formattedDate,
              social: false,
            },
          });

          const user = await this.$fire.auth.signInWithEmailAndPassword(
            this.email,
            this.password
          );

          if (user && user.user.uid) {
            await this.$axios.post(`${baseUrl}/events`, {
              event_id: "unique-event-id",
              event_type: "userSignIn",
              user_id: user.user.uid,
              timestamp: formattedDate,
              additional_data: {
                status: "success",
                timestamp: formattedDate,
                social: false,
              },
            });
            this.$router.push("/parent");
          } else {
            await this.$axios.post(`${baseUrl}/events`, {
              event_id: "unique-event-id",
              event_type: "userSignIn",
              user_id: "",
              timestamp: formattedDate,
              additional_data: {
                status: "failed",
                timestamp: formattedDate,
                social: false,
              },
            });
            this.loginFailed = true; // Set login failure status
          }
        } catch (error) {
          console.error(error);
          this.loginFailed = true; // Set login failure status
        }
      } else {
        this.invalidEmail = !isValidEmail;
        this.invalidPassword = !isValidPassword;
      }
    },

    async register() {
      const isValidEmail = this.isValidEmail(this.email);
      const isValidPassword = this.isValidPassword(this.password);

      if (isValidEmail && isValidPassword) {
        try {
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString();
          const baseUrl = this.$config.userUrl;

          await this.$axios.post(`${baseUrl}/events`, {
            event_id: "unique-event-id",
            event_type: "userRegistration",
            user_id: "",
            timestamp: formattedDate,
            additional_data: {
              email: this.email,
              timestamp: formattedDate,
              status: "pending",
              social: false,
            },
          });

          const user = await this.$fire.auth.createUserWithEmailAndPassword(
            this.email,
            this.password
          );

          if (user && user.user.uid) {
            await this.$axios.post(`${baseUrl}/events`, {
              event_id: "unique-event-id",
              event_type: "userRegistration",
              user_id: user.user.uid,
              timestamp: formattedDate,
              additional_data: {
                email: this.email,
                status: "success",
                timestamp: formattedDate,
                social: false,
              },
            });
            this.$router.push("/parent");
          } else {
            await this.$axios.post(`${baseUrl}/events`, {
              event_id: "unique-event-id",
              event_type: "userRegistration",
              user_id: "",
              timestamp: formattedDate,
              additional_data: {
                email: this.email,
                status: "failed",
                timestamp: formattedDate,
                social: false,
              },
            });
          }
          this.signUpFailed = true;
        } catch (error) {
          console.error(error);
        }
      } else {
        this.signUpFailed = true;
        this.invalidEmail = !isValidEmail;
        this.invalidPassword = !isValidPassword;
      }
    },

    // Function to validate the email format
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Function to validate the password criteria
    isValidPassword(password) {
      // Password should be at least 6 characters long
      if (password.length < 6) {
        return false;
      }
      return true;
    },

    forgotPassword() {
      // Redirect or perform necessary actions for password reset
    },
    async googleSignIn() {
      // Perform Google Sign-In logic
      try {
        const provider = new this.$fireModule.auth.GoogleAuthProvider();
        const user = await this.$fire.auth.signInWithPopup(provider);
        console.log(user); // here you can do what you want with the user data
        this.$router.push("/parent"); // that return from firebase
      } catch (e) {
        // handle the error
        console.log(e);
        this.signUpFailed = true;
      }
    },
  },
};
</script>

<style scoped>
/* Add your main component styles here */
.main {
  text-align: center;
  margin: 50px auto;
  max-width: 600px;
}

.login-container {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  height: 50vh;
}
.white-text {
  color: white;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
}

input {
  padding: 5px;
  margin-right: 10px;
}

button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cta-button {
  margin-right: 10px;
}
</style>
