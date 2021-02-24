import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { firebase } from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import router from '@/router';

Vue.use(Vuex);

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyC50onHvXg8128nYJXYnTb6pdiRPgtoAuE",
    authDomain: "vue-meal-app.firebaseapp.com",
    databaseURL:"https://vue-meal-app-default-rtdb.firebaseio.com",
    projectId: "vue-meal-app",
    storageBucket: "vue-meal-app.appspot.com",
    messagingSenderId: "585923477040",
    appId: "1:585923477040:web:b7345fcb9e67c774feb7f5"
});

export const auth = firebaseApp.auth();
export const db = firebaseApp.database();

export default new Vuex.Store({
    state: {
        recipes: [],
        apiUrl: 'https://api.edamam.com/search',
        user: null,
        isAuthenticated: false,
        userRecipes: []
    },
    mutations: {
        setRecipes(state, payload) {
            state.recipes = payload;
        },
        setUser(state, payload) {
            state.user = payload;
        },
        setIsAuthenticated(state, payload) {
            state.isAuthenticated = payload;
        },
        setUserRecipes(state, payload) {
            state.userRecipes = payload;
        }
    },
    actions: {
        async getRecipes({ state, commit }, plan) {
            try {
                let response = await axios.get(`${state.apiUrl}`, {
                    params: {
                        q: plan,
                        app_id: '5b6623d5',
                        app_key: '46674aa2193dbb7b88ffd897331e661a',
                        from: 0,
                        to: 9
                    }
                });
                // sbdinc keys
                // let response = await axios.get(`${state.apiUrl}`, {
                //     params: {
                //         q: plan,
                //         app_id: '903de977',
                //         app_key: '1b5fbf78de2db637b392f141c524222c\t',
                //         from: 0,
                //         to: 9
                //     }
                // });
                commit('setRecipes', response.data.hits);
            } catch (error) {
                commit('setRecipes', []);
            }
        },
        userLogin({ commit }, { email, password }) {
            firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(user => {
                    commit('setUser', user);
                    commit('setIsAuthenticated', true);
                    router.push('/about');
                })
                .catch(() => {
                    commit('setUser', null);
                    commit('setIsAuthenticated', false);
                    router.push('/');
                });
        },
        userJoin({ commit }, { email, password }) {
            auth
                .createUserWithEmailAndPassword(email, password)
                .then(user => {
                    commit('setUser', user);
                    commit('setIsAuthenticated', true);
                    router.push('/about');
                })
                .catch(() => {
                    commit('setUser', null);
                    commit('setIsAuthenticated', false);
                    router.push('/');
                });
        },
        userSignOut({ commit }) {
            firebase
                .auth()
                .signOut()
                .then(() => {
                    commit('setUser', null);
                    commit('setIsAuthenticated', false);
                    router.push('/');
                })
                .catch(() => {
                    commit('setUser', null);
                    commit('setIsAuthenticated', false);
                    router.push('/');
                });
        },
        addRecipe({ state }, payload) {
            db
                .ref('users')
                .child(state.user.user.uid)
                .push(payload.recipe.label);
        },
        getUserRecipes({ state, commit }) {
            return db
                .ref('users/' + state.user.user.uid)
                .once('value', snapshot => {
                    commit('setUserRecipes', snapshot.val());
                });
        }
    },
    getters: {
        isAuthenticated(state) {
            return state.user !== null && state.user !== undefined;
        }
    }
});
