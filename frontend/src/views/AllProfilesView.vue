<template>
  <div class="min-vh-100 d-flex flex-column justify-content-between">
    <NavbarPost />
    <h1 class="my-2">Liste des utilisateurs</h1>
    <div class="col col-md-8 mx-auto contentRounded">
        <div class="row mx-0 py-2 bg-primary contentRounded shadow-sm">
            <span class="col-1 text-white font-weight-bold px-0 my-auto">ID</span>
            <span class="col-1 text-white font-weight-bold px-0 my-auto">PHOTO</span>
            <span class="col-2 text-white font-weight-bold px-0 my-auto">PSEUDO</span>
            <span class="col-3 text-white font-weight-bold px-0 my-auto">EMAIL</span>
            <span class="col-1 text-white font-weight-bold px-0 my-auto">ADMIN</span>
            <span class="col-2 text-white font-weight-bold px-0 my-auto">CRÉÉ LE</span>
        </div>
    </div>

    <AllProfiles v-for="user in users" :key="user.id">
        <template v-slot:AllUsers>
            <div class="row">
                <span class="col-1 text-white font-weight-bold px-0 my-auto">{{ user.id }}</span>
                <b-img-lazy :src="user.imageUrl" class="col-1 my-auto py-2 img-fluid rounded-circle"></b-img-lazy>
                <span class="col-2 text-white font-weight-bold px-0 my-auto">{{ user.pseudo }}</span>
                <span class="col-3 text-white font-weight-bold px-0 my-auto">{{ user.email }}</span>
                <span class="col-1 text-white font-weight-bold px-0 my-auto">{{ user.isAdmin }}</span>
                <span class="col-2 text-white font-weight-bold px-0 my-auto">{{ user.createdAt.substr(0, 10).split("-").reverse().join("-") }}</span>
                <button class="col-1 btn btn-danger btn-sm font-weight-bold my-auto shadow-sm" @click.prevent="deleteUser(user.id)">Bannir</button>
                
                <b-alert v-if="confirmDelete" show dismissible variant="success">Profil supprimé</b-alert>
                <b-alert v-if="errorDelete" show dismissible variant="danger">Une erreur est survenue.</b-alert>
            </div>
        </template>
    </AllProfiles>
    <Footer />
  </div>
</template>

<script>
import NavbarPost from '@/components/NavbarPost.vue'
import AllProfiles from '@/components/AllProfiles.vue'
import Footer from '@/components/Footer.vue'

import axios from "axios";

export default {
    name: 'AllUsers',
    components: {
        NavbarPost, AllProfiles, Footer
    },

    data() {
        return {
            userId: parseInt(localStorage.getItem('userId')),
            users: [],
            user: {
                id: "",
                pseudo: "",
                email: "",
                imageUrl: "",
                createdAt: "",
                isAdmin: "",

                confirmDelete: false,
                errorDelete: false,
            },
        }
    },


    async created() {
        await axios
                .get('http://localhost:3000/api/users', {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": 'Bearer ' + localStorage.getItem('token')
                    }
                })
                .then((response) => {
                    this.users = response.data;
                    console.log(response);
                })
                .catch(e => {
                    console.log(e + "User inconnu ou Users indisponibles");
                })
    },
    methods: {
        deleteUser(id) {
            axios
                .delete('http://localhost:3000/api/users/' + id, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": 'Bearer ' + localStorage.getItem('token')
                    }
                })
                .then(() => {
                    this.$router.go()
                    this.confirmDelete = true
                })
                .catch((error) => {
                    console.log('cannot delete user ' + error )
                    this.errorDelete = true
                })
        }
    }
};
</script>

<style scoped>
.contentRounded {
    border-radius: 1.7rem;
}
</style>

