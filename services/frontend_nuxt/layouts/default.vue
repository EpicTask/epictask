<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn text class="ml-4" @click="connectWallet"> Connect Wallet </v-btn>
      <v-btn v-if="isSignedIn" text class="ml-4" @click="signOut"
        >Sign Out</v-btn
      >
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }} Epic Task</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "DefaultLayout",
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-home",
          title: "Home",
          to: "/",
        },
        {
          icon: "mdi-clipboard",
          title: "Create Task",
          to: "/create",
        },
        {
          icon: "mdi-check",
          title: "Tasks",
          to: "/tasks",
        },
        {
          icon: "mdi-gift",
          title: "Rewards",
          to: "/rewards",
        },
        {
          icon: "mdi-account",
          title: "Profile",
          to: "/profile",
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Epic Task",
      isSignedIn: false, // Initialize the property with false
    };
  },
  created() {
    this.checkAuthState(); // Call the method to check the initial authentication state
  },
  methods: {
    async checkAuthState() {
      try {
        this.$fire.auth.onAuthStateChanged((user) => {
          if (user && user.uid) {
            this.isSignedIn = true; // Update the isSignedIn value if user is signed in
          } else {
            this.isSignedIn = false; // Update the isSignedIn value if user is signed out
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    async connectWallet() {
      try {
        // Connect wallet functionality
        const user_id = this.$fire.auth.currentUser.uid;
        const baseUrl = "https://xrpl-5wpxgn35iq-uc.a.run.app";
        const { data } = await this.$axios.get(
          `${baseUrl}/xummSignInRequest/${user_id}`
        );
        const windowFeatures = "width=700,height=700"; // Customize the window features
        window.open(data, "_blank", windowFeatures);
      } catch (error) {
        console.error("Error occurred while connecting wallet:", error);
        // Handle the error here, show an error message, or perform any necessary actions
      }
    },
    async checkWalletConnection() {
      const user_id = this.$fire.auth.currentUser.uid;
      const userDoc = this.$fire.firestore.collection("users").doc(user_id);

      try {
        const snapshot = await userDoc.get();
        if (snapshot.exists) {
          const userToken = snapshot.data().userToken;
          if (userToken && userToken.token_expiration) {
            const currentTimestamp = Date.now();
            const tokenExpiration = userToken.token_expiration;
            const isTokenValid = currentTimestamp < tokenExpiration;
            return isTokenValid;
          }
        }
      } catch (error) {
        console.error(
          "Error occurred while checking wallet connection:",
          error
        );
        // Handle the error here, log the error or perform any necessary actions
      }

      return false;
    },

    async signOut() {
      try {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString();
        const baseUrl = "https://user-management-5wpxgn35iq-uc.a.run.app";
        const user = await this.$fire.auth.currentUser;

        await this.$axios.post(`${baseUrl}/events`, {
          event_id: "unique-event-id",
          event_type: "userInteraction",
          user_id: user.uid,
          timestamp: formattedDate,
          additional_data: {
            user_id: user.uid,
            interaction: "SignOut",
          },
        });

        await this.$fire.auth.signOut();
        console.log(user);
        this.$router.push("/");
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style>
button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.content-separator {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}
</style>
