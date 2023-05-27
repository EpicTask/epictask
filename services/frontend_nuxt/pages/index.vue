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
            <input type="email" v-model="email" placeholder="Email" required />
          </div>
          <div class="input-row">
            <input
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
          <!-- <div class="input-row">
            <button class="cta-button" @click="googleSignIn">
              Sign in with Google
            </button>
          </div> -->
        </div>
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
    };
  },
  methods: {
    async login() {
      try {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString();
        const baseUrl = "https://user-management-5wpxgn35iq-uc.a.run.app";

        await this.$axios.post(`${baseUrl}/event`, {
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

        const response = await this.$axios.post(
          `${baseUrl}/loginWithPassword`,
          {
            email: this.email,
            password: this.password,
          }
        );

        if (response.message != null) {
          await this.$axios.post(`${baseUrl}/event`, {
            event_id: "unique-event-id",
            event_type: "userSignIn",
            user_id: response.message,
            timestamp: formattedDate,
            additional_data: {
              status: "success",
              timestamp: formattedDate,
              social: false,
            },
          });
          
        } else {
          await this.$axios.post(`${baseUrl}/event`, {
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
          
        }
      } catch (error) {
        console.error(error);
        this.$router.push("/parent");
      }
    },
    async register() {
      try {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString();
        const baseUrl = "https://user-management-5wpxgn35iq-uc.a.run.app";

        await this.$axios.post(`${baseUrl}/event`, {
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

        const response = await this.$axios.post(
          `${baseUrl}/registerWithPassword`,
          {
            email: this.email,
            password: this.password,
          }
        );

        if (response.message != null) {
          await this.$axios.post(`${baseUrl}/event`, {
            event_id: "unique-event-id",
            event_type: "userRegistration",
            user_id: response.message,
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
          await this.$axios.post(`${baseUrl}/event`, {
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
      } catch (error) {
        console.error(error);
      }
    },
    forgotPassword() {
      // Redirect or perform necessary actions for password reset
    },
    googleSignIn() {
      // Perform Google Sign-In logic
      // Example: Authenticate with Firebase Authentication using Google Sign-In provider
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

.section-container {
  margin-top: 0; /* Remove the default margin */
}
</style>
