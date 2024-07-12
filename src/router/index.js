import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store/index';
import { ROLES_SETTINGS } from '@/data';
import { routes } from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  mode: 'history',
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!(await sessionStorage.getItem('isFirstLoad'))) sessionStorage.setItem('isFirstLoad', 'true');

  let isFirstLoad = JSON.parse(await sessionStorage.getItem('isFirstLoad'));
  let token = sessionStorage.getItem('token');
  let auth = store.state.app.isAuth;

  if (window.location.pathname.includes('redirect') && to.name === 'error') {

    let pathname = window.location.pathname;
    let param = pathname.replace('/redirect/', '');
    let res = await store.dispatch('app/refreshToken', param);
    if (res === true)
      next({
        name: ROLES_SETTINGS[store.state.app.userData.roleNames[0]].startPage,
      });
    else next({ name: 'login' });
  } else {
    if (isFirstLoad) {
      if (token && !auth) {
        let res = await store.dispatch('app/initialize');
        if (res === true)
          next({
            name: ROLES_SETTINGS[store.state.app.userData.roleNames[0]].startPage,
          });
        else to.name !== 'login' ? next({ name: 'login' }) : next();
      } else {
        to.name !== 'login' ? next({ name: 'login' }) : next();
      }
    } else {
      if (!token && !auth && to.name !== 'login') next({ name: 'login' });
      else if (token && !auth) {
        let res = await store.dispatch('app/initialize');
        if (res === true) {
          if (to.name) next();
          else
            next({
              name: ROLES_SETTINGS[store.state.app.userData.roleNames[0]].startPage,
            });
        } else to.name !== 'login' ? next({ name: 'login' }) : next();
      } else next();
    }
  }
});

export default router;
