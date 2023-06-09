<template>
  <div class="profile">
    <div class="avatar-container">
      <div class="avatar">
        <img :src="imageUrl" :alt="displayName" />
      </div>
      <div class="display-name">
        {{ displayName }}
      </div>
      <div class="email">
        {{ userEmail }}
      </div>
      <div class="email"> Public Address:
        {{ publicAddress }}
      </div>
      <div class="edit-buttons">
        <button class="item-button" @click="editDisplayName">Edit Display Name</button>
        <button class="item-button" @click="editImage">Edit Image</button>
        <button class="item-button" @click="editPublicAddress">Edit Public Address</button>
      </div>
    </div>

    <form
      v-if="editingField === 'displayName'"
      @submit.prevent="updateDisplayName"
    >
      <div>
        <label for="display-name">Display Name:</label>
        <input
          type="text"
          id="display-name"
          v-model="updatedDisplayName"
          class="white-text"
          required
        />
      </div>
      <div>
        <button class="item-button" type="submit">Save</button>
        <button class="item-button" @click="cancelEdit">Cancel</button>
      </div>
    </form>

    <form v-if="editingField === 'image'" @submit.prevent="updateImage">
      <div>
        <label for="image">Image:</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          accept="image/*"
        />
      </div>
      <div>
        <button class="item-button" type="submit">Save</button>
        <button class="item-button" @click="cancelEdit">Cancel</button>
      </div>
    </form>

    <form
      v-if="editingField === 'publicAddress'"
      @submit.prevent="updatePublicAddress"
    >
      <div>
        <label for="public-address">Public Wallet Address:</label>
        <input
          type="text"
          id="public-address"
          v-model="updatedPublicAddress"
          class="white-text"
          required
        />
      </div>
      <div>
        <button class="item-button" type="submit">Save</button>
        <button class="item-button" @click="cancelEdit">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
    data() {
  return {
    displayName: "",
    updatedDisplayName: "",
    userEmail: "",
    image: null,
    imageUrl: require("~/assets/profile.png"),
    publicAddress:"",
    updatedPublicAddress:"",
    editingField: null,
  };
},

  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const user_id = this.$fire.auth.currentUser.uid;
        const userDocRef = this.$fire.firestore
          .collection("users")
          .doc(user_id);
        const userDocSnapshot = await userDocRef.get();

        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          this.displayName = userData.displayName;
          this.userEmail = userData.email;
          this.publicAddress = userData.publicAddress;
          if (userData.imageUrl) {
            this.imageUrl = userData.imageUrl;
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
    async updateImage() {
      try {
        const user_id = this.$fire.auth.currentUser.uid;
        const storageRef = this.$fire.storage.ref("users");
        const fileRef = storageRef.child(user_id);
        await fileRef.put(this.image);
        const imageUrl = await fileRef.getDownloadURL();
        this.imageUrl = imageUrl;

        // Update the user document with the new image URL
        const userDocRef = this.$fire.firestore
          .collection("users")
          .doc(user_id);
        await userDocRef.update({ imageUrl: imageUrl });

        this.editingField = null;
      } catch (error) {
        console.error("Error updating image:", error);
        // Handle the error here, show error message, etc.
      }
    },

    handleImageUpload(event) {
      // Handle image upload and set the selected image file to the component's data
      this.image = event.target.files[0];
    },
    editDisplayName() {
      this.editingField = "displayName";
      this.updatedDisplayName = this.displayName;
    },
    editPublicAddress() {
      this.editingField = "publicAddress";
      this.updatedpublicAddress = this.publicAddress;
    },
    editImage() {
      this.editingField = "image";
    },
    cancelEdit() {
      this.editingField = null;
    },
    async updateDisplayName() {
      try {
        const user_id = this.$fire.auth.currentUser.uid;
        // Update the user's display name
        const userDocRef = this.$fire.firestore
          .collection("users")
          .doc(user_id);
          
        await userDocRef.update({ displayName: this.updatedDisplayName});
        this.displayName = this.updatedDisplayName;
        this.editingField = null;
      } catch (error) {
        console.error("Error updating display name:", error);
        // Handle the error here, show error message, etc.
      }
    },
    async updatePublicAddress() {
      try {
        const user_id = this.$fire.auth.currentUser.uid;
        // Update the user's display name
        const userDocRef = this.$fire.firestore
          .collection("users")
          .doc(user_id);
          
        await userDocRef.update({ publicAddress: this.updatedPublicAddress});
        this.publicAddress = this.updatedPublicAddress;
        this.editingField = null;
      } catch (error) {
        console.error("Error updating public address:", error);
        // Handle the error here, show error message, etc.
      }
    },
  },
};
</script>

<style scoped>
.profile {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.avatar-container {
  margin: 20px;
}

.avatar {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.display-name {
  margin-top: 10px;
  font-size: 20px;
  font-weight: bold;
}

.email {
  margin-top: 5px;
  font-size: 16px;
}

.edit-buttons {
  margin-top: 10px;
}

.white-text {
  color: white;
}


</style>
